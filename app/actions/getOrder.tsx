'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function getOrder(id: string) {
    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);

    const { data: order, error } = await supabase
        .from('Order')
        .select(`
            *,
            order_status(order_status_name),
            product_type(product_type_name),
            Order_file(id, "fileName")
        `)
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching order:', error);
        return { error: error.message };
    }

    return { order };
}
