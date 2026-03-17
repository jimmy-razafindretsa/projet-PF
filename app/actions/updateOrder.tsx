'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { Resend } from "resend";
import { UpdatedOrderEmail } from "../../supabase/functions/handle-orders/_templates/UpdatedOrderEmail";

interface UpdateOrderParams {
    id: string;
    price?: number | null;
    ship_date?: string | null;
    note?: string | null;
    supplier_note?: string | null;
    order_status_id?: number;
    is_archive?: boolean;
    newFileNames?: string[];
    sendEmail?: boolean;
    clientName?: string; // Need this for the email template
}

export async function updateOrder(params: UpdateOrderParams) {
    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);

    // --- DEBUG LOGS (SERVER SIDE) ---
    console.log("SERVER: updateOrder called with:", params);

    const { id, newFileNames, sendEmail, clientName, ...updates } = params;

    // Validate price if present
    if (typeof updates.price === 'number' && isNaN(updates.price)) {
        return { error: "Price must be a valid number." };
    }

    // Verify authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        console.error("Auth Error:", authError);
        return { error: "Unauthorized" };
    }

    const { data, error } = await supabase
        .from('Order')
        .update(updates)
        .eq('id', id)
        .select();

    if (error) {
        console.error('SERVER: Error updating order:', error);
        return { error: error.message };
    }

    // Insert new files into Order_file if provided
    if (newFileNames && newFileNames.length > 0) {
        const filesToInsert = newFileNames.map((f: string) => ({
            order_id: id,
            fileName: f
        }));
        
        const { error: fileError } = await supabase
            .from('Order_file')
            .insert(filesToInsert);
            
        if (fileError) {
             console.error('SERVER: Error inserting file associations:', fileError.message);
             // We can return success for the order update but log the file error, 
             // or return an error. Returning an error might confuse the user if the order updated.
             // We'll return an error so they know the upload association failed.
             return { error: 'Order updated, but error attaching new files.' };
        }
    }

    if (sendEmail) {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
            console.warn("RESEND_API_KEY not set. Skipping email dispatch.");
        } else {
            const resend = new Resend(apiKey);
            const SUPPLIER_EMAIL = process.env.NEXT_PUBLIC_SUPPLIER_EMAIL || "no-reply@example.com";

            try {
                const newStatus = updates.order_status_id;
                let emailSubject = "";
                let emailComponent;
                const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

                if (newStatus === 4 || newStatus === 5 || newStatus === 6) {
                    // Email to CLIENT (using generic supplier email to demo for now since we don't store client emails)
                    emailSubject = newStatus === 4 ? `Action Required: Order #${id} Needs Review` :
                                  newStatus === 5 ? `Update: Order #${id} is In Production` :
                                  `Update: Order #${id} has Shipped`;
                                  
                    emailComponent = (
                      <UpdatedOrderEmail
                        clientName={clientName || "Client"}
                        orderId={id}
                        updates={updates as any}
                        orderUrl={`${BASE_URL}/client_dashboard/order_detail/${id}`}
                      />
                    );
                } else if (newStatus === 2 || newStatus === 7) {
                    // Email to SUPPLIER
                    emailSubject = newStatus === 2 ? `New Request: Order #${id} Submitted` : 
                                   `Update: Review Completed for Order #${id}`;
                                   
                    emailComponent = (
                      <UpdatedOrderEmail
                        clientName={clientName || "Unknown Client"}
                        orderId={id}
                        updates={updates as any}
                        orderUrl={`${BASE_URL}/supplier_dashboard/order_detail/${id}`}
                      />
                    );
                }

                if (emailComponent) {
                    const { data: emailData, error: emailError } = await resend.emails.send({
                        from: "Murmur Order System <onboarding@resend.dev>",
                        to: [SUPPLIER_EMAIL],
                        subject: emailSubject,
                        react: emailComponent,
                    });

                    if (emailError) {
                        console.error('SERVER: Resend error:', emailError);
                    } else {
                        console.log('SERVER: Email sent manually via Resend:', emailData);
                    }
                } else {
                     console.log(`SERVER: Target status ${newStatus} does not trigger an email rule.`);
                }

            } catch (err) {
                console.error("SERVER: Failed to send manual email:", err);
            }
        }
    }

    revalidatePath('/client_dashboard/production');
    revalidatePath('/client_dashboard/completed');
    revalidatePath(`/client_dashboard/order_detail/${id}`);
    revalidatePath('/supplier_dashboard/production');
    revalidatePath('/supplier_dashboard/completed');

    return { success: true, data };
}
