// app/actions.ts -- now insertOrder.tsx
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { uniqueFileName } from './insertFile'

interface OrderFormData {
    clientName: string;
    companyName: string;
    address: string;
    email: string;
    useCase: string;
    fileName: string;
    fileNames?: string[];
}

export async function insertOrder(formData: OrderFormData, selectedProduct: string) {
    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);

    const clientName = formData.clientName;
    const note = formData.useCase;
    const fileNames = formData.fileNames || [];

    // 1. Get Product Type ID
    // We try to find the product type by name.
    let productTypeId: number | null = null;

    const { data: existingProduct, error: fetchError } = await supabase
        .from('product_type')
        .select('id')
        .ilike('product_type_name', selectedProduct)
        .single();

    if (existingProduct) {
        productTypeId = existingProduct.id;
    } else {
        // Since product_type table might be empty or missing this type, 
        // we can attempt to insert it if RLS allows.
        // If RLS blocks (likely for anonymous/public users), we can't do much without admin access.
        // However, for authenticated users this might succeed.
        console.warn(`Product type '${selectedProduct}' not found. Attempting to create...`);

        const { data: newProduct, error: insertError } = await supabase
            .from('product_type')
            .insert([{ product_type_name: selectedProduct }])
            .select('id')
            .single();

        if (insertError) {
            console.error("Failed to insert product type:", insertError.message);
            // If we can't create it, we can't insert the Order because of FK constraint.
            // We fallback to hardcoded ID 1 or just fail. 
            // Failing is safer than corrupting data.
            return { error: `Product Type '${selectedProduct}' invalid or permission denied.` };
        }
        if (newProduct) {
            productTypeId = newProduct.id;
        }
    }

    if (!productTypeId) {
        return { error: "Product Type ID could not be determined." };
    }

    // 2. Insert Order (No file_name column inserted)
    const { data: orderData, error: orderError } = await supabase
        .from('Order')
        .insert([{
            cl_name: clientName,
            note: note,
            ord_time: new Date().toISOString(),
            order_status_id: 2,
            product_type_id: productTypeId, // Valid ID
            is_archive: false
        }])
        .select();

    if (orderError) {
        console.error('Error inserting data:', orderError.message)
        return { error: orderError.message }
    }

    // 3. Insert specific files to Order_file table if any
    if (orderData && orderData.length > 0) {
        const orderId = orderData[0].id;
        
        if (fileNames.length > 0) {
            const filesToInsert = fileNames.map(f => ({
                order_id: orderId,
                fileName: f
            }));
            
            const { error: fileError } = await supabase
                .from('Order_file')
                .insert(filesToInsert);
                
            if (fileError) {
                 console.error('Error inserting file associations:', fileError.message);
                 return { error: 'Order created, but error associating files.' };
            }
        }
    }

    revalidatePath('/')
    return { success: true }
}