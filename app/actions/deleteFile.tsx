'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function deleteFile(fileId: number, fileName: string) {
    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);

    // 1. Delete from database
    const { error: dbError } = await supabase
        .from('Order_file')
        .delete()
        .eq('id', fileId);

    if (dbError) {
        console.error('Error deleting from db:', dbError.message);
        return { error: 'Failed to delete file from order records.' };
    }

    // 2. Delete from storage
    const { error: storageError } = await supabase.storage
        .from('PDF')
        .remove([fileName]);

    if (storageError) {
        console.error('Error deleting from storage:', storageError.message);
        // We log error but don't strictly fail if storage removal fails
        // since the db record is what the user sees.
        console.warn('Storage file may be orphaned:', fileName);
    }

    return { success: true };
}
