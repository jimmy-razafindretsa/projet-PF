'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

interface UpdateOrderParams {
    id: string;
    price?: number | null;
    ship_date?: string | null;
    note?: string | null;
    order_status_id?: number;
    is_archive?: boolean;
}

export async function updateOrder(params: UpdateOrderParams) {
    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);

    // --- DEBUG LOGS (SERVER SIDE) ---
    console.log("SERVER: updateOrder called with:", params);

    const { id, ...updates } = params;

    // Validate price if present (optional check)
    if (typeof updates.price === 'number' && isNaN(updates.price)) {
        console.error("SERVER: Invalid price detected:", updates.price);
        return { error: "Price must be a valid number." };
    }

    // --- DEBUG: ID Type Check
    console.log(`SERVER: ID is type: ${typeof id}, Value: ${id}`);

    // --- DEBUG: Check Auth User
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        console.error("SERVER: Auth User Error:", authError);
    } else {
        console.log("SERVER: Authenticated User ID:", user.id);
    }

    // --- DEBUG: Check if row exists and is visible (SELECT)
    const { data: checkData, error: checkError } = await supabase
        .from('Order')
        .select('*')
        .eq('id', id);

    if (checkError) {
        console.error("SERVER: Check SELECT Error:", checkError);
    } else {
        console.log(`SERVER: Check SELECT found ${checkData?.length} rows for ID ${id}`);
    }

    console.log("SERVER: Attempting update on ID:", id, "with updates:", updates);

    const { data, error } = await supabase
        .from('Order')
        .update(updates)
        .eq('id', id)
        .select();

    if (error) {
        console.error('SERVER: Error updating order:', error);
        return { error: error.message };
    }

    console.log("SERVER: Update successful. Data returned:", data);

    revalidatePath('/client_dashboard/production');
    revalidatePath('/client_dashboard/completed');
    revalidatePath(`/client_dashboard/order_detail/${id}`);

    return { success: true, data };
}
