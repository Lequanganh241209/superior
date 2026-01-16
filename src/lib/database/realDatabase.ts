
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export interface Project {
    id: string;
    name: string;
    code: any;
    settings: any;
}

export class RealUserDatabase {
  private supabase: SupabaseClient;

  constructor() {
      this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async saveUserProject(userId: string, project: Project): Promise<boolean> { 
    // REAL database save 
    const { error } = await this.supabase 
      .from('user_projects') 
      .upsert({ 
        user_id: userId, 
        project_id: project.id, 
        name: project.name, 
        code: project.code, 
        settings: project.settings, 
        updated_at: new Date().toISOString() 
      }); 
     
    if (error) throw new Error(`Save failed: ${error.message}`); 
     
    return true; 
  } 
   
  async getUserProjects(userId: string): Promise<Project[]> { 
    // REAL database query 
    const { data, error } = await this.supabase 
      .from('user_projects') 
      .select('*') 
      .eq('user_id', userId) 
      .order('updated_at', { ascending: false }); 
     
    if (error) throw new Error(`Load failed: ${error.message}`); 
     
    return data.map(row => ({ 
      id: row.project_id, 
      name: row.name, 
      code: row.code, 
      settings: row.settings 
    })); 
  } 
   
  async incrementUserUsage(userId: string, feature: string): Promise<void> { 
    // REAL usage tracking via RPC (Stored Procedure)
    const { error } = await this.supabase.rpc('increment_usage', { 
      user_id: userId, 
      feature_name: feature, 
      increment_amount: 1 
    });
    
    if (error) {
        // Fallback if RPC doesn't exist: Insert to logs
        await this.supabase.from('usage_logs').insert({ user_id: userId, feature, timestamp: new Date() });
    }
  } 
}
