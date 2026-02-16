'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function getStatuses() {
    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);

    const { data: statuses, error } = await supabase
        .from('order_status')
        .select('*')
        .order('id', { ascending: true });

    if (error) {
        console.error('Error fetching statuses:', error);
        return [];
    }

    return statuses;
}
