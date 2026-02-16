
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);

    // List all buckets
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    return NextResponse.json({
        buckets,
        bucketError,
        user: user ? { id: user.id, email: user.email } : null,
        authError
    });
}
