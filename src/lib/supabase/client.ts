import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const valid = Boolean(supabaseUrl) && Boolean(supabaseAnonKey) && !supabaseUrl.includes('example') && !supabaseAnonKey.includes('example')

function createLocalClient() {
  let session: any = null
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem('dev_session') || 'null'
      session = JSON.parse(raw)
    } catch {}
  }
  const listeners = new Set<(event: string, session: any) => void>()
  const notify = (event: string) => {
    listeners.forEach((cb) => {
      try { cb(event, session) } catch {}
    })
  }
  return {
    auth: {
      async signInWithPassword({ email, password }: { email: string; password: string }) {
        session = { user: { id: 'dev-user', email } }
        if (typeof window !== 'undefined') {
          try { window.localStorage.setItem('dev_session', JSON.stringify(session)) } catch {}
        }
        notify('SIGNED_IN')
        return { data: { user: session.user }, error: null }
      },
      async signUp({ email, password }: { email: string; password: string }) {
        return { data: { user: { id: 'dev-user', email } }, error: null }
      },
      async signOut() {
        session = null
        if (typeof window !== 'undefined') {
          try { window.localStorage.removeItem('dev_session') } catch {}
        }
        notify('SIGNED_OUT')
        return { error: null }
      },
      async getSession() {
        if (typeof window !== 'undefined') {
            try {
              const raw = window.localStorage.getItem('dev_session') || 'null'
              session = JSON.parse(raw)
            } catch {}
        }
        return { data: { session }, error: null }
      },
      onAuthStateChange(cb: (event: string, session: any) => void) {
        listeners.add(cb)
        return { data: { subscription: { unsubscribe: () => listeners.delete(cb) } } }
      }
    },
    from() {
      return {
        select: async () => ({ data: [], error: null }),
        insert: async () => ({ data: null, error: null }),
        update: async () => ({ data: null, error: null }),
        delete: async () => ({ data: null, error: null }),
        eq() { return this },
        order() { return this },
        single: async () => ({ data: null, error: null })
      }
    }
  } as any
}

export const supabase = (function() {
  // Check for explicit local mode override
  let isLocalMode = false;
  if (typeof window !== 'undefined') {
    try {
      isLocalMode = window.localStorage.getItem('aether_use_local_mode') === 'true' || 
                    document.cookie.includes('aether_local_mode=true');
    } catch {}
  }

  if (valid && !isLocalMode) {
    return createBrowserClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        // Fix for "AbortError: signal is aborted without reason" in dev mode
        // This overrides the default lock mechanism which causes issues with Next.js hot reload
        lock: typeof window !== 'undefined' ? (async (name: string, ...args: any[]) => {
            const callback = args[args.length - 1];
            return callback();
        }) as any : undefined,
      },
    })
  } else {
    return createLocalClient()
  }
})();
