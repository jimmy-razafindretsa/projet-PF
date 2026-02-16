'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function signOut() {
    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    const { error } = await supabase.auth.signOut()

    if (error) {
        console.error('Error signing out:', error)
    }

    redirect('/')
}
