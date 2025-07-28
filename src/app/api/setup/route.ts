import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Try to create user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@example.com',
      password: 'password',
      email_confirm: true
    });

    if (authError) {
      // Check if user already exists
      if (authError.message?.includes('already been registered')) {
        return NextResponse.json({ 
          success: true, 
          message: 'User already exists' 
        });
      }
      
      throw authError;
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Admin user created successfully',
      userId: authData.user?.id 
    });

  } catch (error: any) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create admin user' },
      { status: 500 }
    );
  }
}