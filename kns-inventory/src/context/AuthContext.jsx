import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch profile from profiles table
  async function fetchProfile(user) {
    try {
      // Try to read existing profile
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (data) {
        console.log('Profile loaded:', data.email, 'role:', data.role);
        return data;
      }

      if (error) {
        console.warn('Profile fetch error:', error.message);
      }

      // Profile doesn't exist yet — create one for new users only
      // IMPORTANT: Use INSERT not UPSERT to avoid overwriting existing roles
      console.log('No profile found, creating new profile...');
      const meta = user.user_metadata || {};
      const newProfile = {
        id: user.id,
        full_name: meta.full_name || '',
        email: user.email || '',
        role: meta.role || 'user',
        department: '',
        phone: '',
        status: 'Active',
      };

      const { data: created, error: insertErr } = await supabase
        .from('profiles')
        .insert([newProfile])
        .select()
        .single();

      if (insertErr) {
        // Insert failed — profile might exist but RLS blocked the SELECT
        // Try one more time to read it (the auth token may now be ready)
        console.warn('Insert failed (profile may exist):', insertErr.message);
        const { data: retry } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (retry) {
          console.log('Retry succeeded, role:', retry.role);
          return retry;
        }

        // Last resort: return local profile object so login doesn't break
        // but DON'T write to DB (to avoid overwriting admin role)
        console.warn('Using local fallback profile');
        return newProfile;
      }

      return created || newProfile;
    } catch (err) {
      console.error('fetchProfile crash:', err);
      return {
        id: user.id,
        full_name: user.user_metadata?.full_name || '',
        email: user.email || '',
        role: user.user_metadata?.role || 'user',
        status: 'Active',
      };
    }
  }

  // Listen for auth state changes
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setCurrentUser(session.user);
        const prof = await fetchProfile(session.user);
        setProfile(prof);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setCurrentUser(session.user);
          const prof = await fetchProfile(session.user);
          setProfile(prof);
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, message: error.message };

    const prof = await fetchProfile(data.user);
    setCurrentUser(data.user);
    setProfile(prof);
    console.log('Login complete — role:', prof?.role);
    return { success: true, role: prof?.role || 'user' };
  }

  async function signup(fullName, email, password) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role: 'user' },
      },
    });
    if (error) return { success: false, message: error.message };

    // Wait for trigger to create profile, then fetch
    await new Promise((r) => setTimeout(r, 1000));
    const prof = await fetchProfile(data.user);
    setCurrentUser(data.user);
    setProfile(prof);
    return { success: true, role: prof?.role || 'user' };
  }

  async function logout() {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setProfile(null);
  }

  async function resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/signin`,
    });
    if (error) return { success: false, message: error.message };
    return { success: true, message: 'Password reset email sent! Check your inbox.' };
  }

  const isLoggedIn = !!currentUser && !!profile;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        profile,
        isLoggedIn,
        loading,
        login,
        signup,
        logout,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
