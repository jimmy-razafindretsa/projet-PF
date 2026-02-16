'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function deleteOrder(id: string) {
    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);

    // --- DEBUG: Check Auth User
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        console.error("SERVER: Auth User Error:", authError);
        return { error: "User not authenticated" };
    }

    console.log(`SERVER: Attempting delete on ID: ${id} by User: ${user.id}`);

    const { error } = await supabase
        .from('Order')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('SERVER: Error deleting order:', error);
        return { error: error.message };
    }

    console.log("SERVER: Delete successful for ID:", id);

    revalidatePath('/client_dashboard/production');
    revalidatePath('/client_dashboard/completed');

    return { success: true };
}
