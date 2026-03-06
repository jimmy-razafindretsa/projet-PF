'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

// Define the action to accept FormData
export async function insertFile(formData: FormData) {
    const file = formData.get('file') as File;
    if (!file) return;

    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        console.error("User not authenticated explicitly in insertFile:", authError);
        return { error: "Authentication required to upload files." };
    } else {
        console.log("User authenticated in insertFile:", user);
    }
    const fileName = await uniqueFileName(file.name);

    const filePath = `uploads/${fileName}`;



    const { data, error } = await supabase.storage
        .from('PDF')
        .upload(filePath, file)

    if (error) {
        console.error('Error uploading file:', error)
        return { error: error.message }
    }

    return { success: true, data }
}

export const UniqueFileName = async (fileName: string) => uniqueFileName(fileName);

export async function uniqueFileName(fileName: string) {
    var sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `${Date.now()}_${sanitizedName}`;
}