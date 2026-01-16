
import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export class RealAuthSystem {
  private supabase: SupabaseClient;
   
  constructor() {
    if (!supabaseUrl || !supabaseKey) {
        console.warn("Supabase keys missing. Auth will fail.");
    }
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async realSignUp(email: string, password: string, name: string): Promise<User> { 
    // 1. Real Supabase signup 
    const { data, error } = await this.supabase.auth.signUp({ 
      email, 
      password, 
      options: { data: { name } } 
    }); 
     
    if (error) throw new Error(`Signup failed: ${error.message}`); 
    if (!data.user) throw new Error("User creation failed");

    // 2. Create real user profile in database (Assuming 'profiles' table exists)
    // We try/catch this because sometimes triggers handle it
    try {
        await this.createUserProfile(data.user.id, name, email); 
    } catch (e) {
        console.warn("Profile creation handled by trigger or failed", e);
    }
     
    return data.user; 
  } 
   
  async realLogin(email: string, password: string): Promise<Session> { 
    // Real login với Supabase 
    const { data, error } = await this.supabase.auth.signInWithPassword({ 
      email, 
      password 
    }); 
     
    if (error) throw new Error(`Login failed: ${error.message}`); 
    if (!data.session) throw new Error("No session returned");

    return data.session; 
  } 
   
  async realLogout(): Promise<void> { 
    await this.supabase.auth.signOut(); 
    if (typeof window !== 'undefined') {
        localStorage.removeItem('sb-access-token'); // Clear supabase token if manual
        window.location.href = '/'; 
    }
  }

  private async createUserProfile(userId: string, name: string, email: string) {
      const { error } = await this.supabase
        .from('profiles')
        .upsert({ id: userId, full_name: name, email, updated_at: new Date().toISOString() });
      
      if (error) throw error;
  }
}
