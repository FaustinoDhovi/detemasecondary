"use client";
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Loader2, ArrowLeft, ShieldAlert, LogIn, UserPlus, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '', 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function PortalPage() {
  const [view, setView] = useState<'student' | 'staff-login' | 'staff-signup'>('student');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    const formData = new FormData(e.currentTarget);
    const userVal = (formData.get('user') as string).trim();
    const passVal = (formData.get('pass') as string).trim();

    try {
      if (view === 'staff-login') {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: userVal,
          password: passVal,
        });

        if (authError) throw new Error("Invalid Staff Credentials.");

        const { data: profile } = await supabase.from('staff_profiles').select('*').eq('id', authData.user.id).single();
        
        if (!profile?.is_approved) throw new Error("Account pending Admin approval.");
        
        localStorage.setItem('portalSession', JSON.stringify({ role: profile.role, user: profile }));
        router.push(profile.role === 'admin' ? '/portal/admin' : '/teacher');
      } else {
        // STUDENT LOGIN
        const { data, error } = await supabase.from('student_ledger').select('*').ilike('name', `%${userVal.toUpperCase()}%`).single();
        if (error || !data) throw new Error("Student record not found.");
        if (passVal.toUpperCase() !== data.id.trim().toUpperCase()) throw new Error("Incorrect Student ID.");

        localStorage.setItem('portalSession', JSON.stringify({ role: 'student', student: data }));
        router.push('/portal/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStaffSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    const formData = new FormData(e.currentTarget);
    const ec_number = formData.get('ec_number') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const full_name = formData.get('full_name') as string;

    try {
      // 1. Check if EC Number exists in official master list
      const { data: validStaff, error: ecError } = await supabase
        .from('staff_master_list')
        .select('*')
        .eq('ec_number', ec_number)
        .single();

      if (ecError || !validStaff) throw new Error("Invalid EC Number. Please contact Admin.");

      // 2. Create Authentication Account
      const { data: authUser, error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) throw signUpError;

      // 3. Create Staff Profile (Defaults to unapproved)
      if (authUser.user) {
        await supabase.from('staff_profiles').insert([{
          id: authUser.user.id,
          full_name,
          ec_number,
          subject_taught: validStaff.subject_taught,
          role: 'teacher',
          is_approved: false
        }]);
        setSuccessMsg("Account created! Awaiting Admin approval.");
        setView('staff-login');
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row font-sans text-slate-900">
      {/* Brand Side */}
      <div className="lg:w-1/2 bg-slate-900 p-12 lg:p-24 text-white flex flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-400 font-black uppercase text-[10px] mb-12"><ArrowLeft size={14} /> Back</Link>
          <h1 className="text-7xl font-black italic leading-[0.8] uppercase tracking-tighter mb-6">Detema<br/><span className="text-blue-500">Cloud</span></h1>
        </div>
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* Form Side */}
      <div className="lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <header>
            <div className="w-16 h-1 bg-blue-600 mb-6"></div>
            <h2 className="text-5xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">
              {view === 'student' ? <>Student<br/>Entry</> : view === 'staff-login' ? <>Staff<br/>Login</> : <>Staff<br/>Register</>}
            </h2>
          </header>

          {(errorMsg || successMsg) && (
            <div className={`p-5 rounded-2xl flex items-center gap-3 text-xs font-black uppercase border ${errorMsg ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
              {errorMsg ? <ShieldAlert size={18} /> : <CheckCircle size={18} />}
              {errorMsg || successMsg}
            </div>
          )}

          {view !== 'staff-signup' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <input name="user" placeholder={view === 'student' ? "STUDENT FULL NAME" : "OFFICIAL EMAIL"} className="w-full px-8 py-5 rounded-2xl bg-slate-50 border font-black outline-none focus:ring-4 focus:ring-blue-500/10" required />
              <input name="pass" type="password" placeholder={view === 'student' ? "STUDENT ID NUMBER" : "PASSWORD"} className="w-full px-8 py-5 rounded-2xl bg-slate-50 border font-black outline-none focus:ring-4 focus:ring-blue-500/10" required />
              <button disabled={loading} className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex justify-center items-center gap-3">
                {loading ? <Loader2 className="animate-spin" /> : <LogIn size={20} />} Sign In
              </button>
              <div className="flex justify-between pt-4">
                <button type="button" onClick={() => setView(view === 'student' ? 'staff-login' : 'student')} className="text-[10px] font-black text-blue-600 uppercase underline decoration-2">{view === 'student' ? "Staff Administration" : "Student Login"}</button>
                {view === 'staff-login' && <button type="button" onClick={() => setView('staff-signup')} className="text-[10px] font-black text-emerald-600 uppercase underline decoration-2">Create Account</button>}
              </div>
            </form>
          ) : (
            <form onSubmit={handleStaffSignUp} className="space-y-4">
              <input name="ec_number" placeholder="EC NUMBER (REQUIRED)" className="w-full px-8 py-5 rounded-2xl bg-slate-50 border font-black outline-none focus:ring-4 focus:ring-blue-500/10" required />
              <input name="full_name" placeholder="FULL NAME" className="w-full px-8 py-5 rounded-2xl bg-slate-50 border font-black outline-none focus:ring-4 focus:ring-blue-500/10" required />
              <input name="email" type="email" placeholder="EMAIL ADDRESS" className="w-full px-8 py-5 rounded-2xl bg-slate-50 border font-black outline-none focus:ring-4 focus:ring-blue-500/10" required />
              <input name="password" type="password" placeholder="CREATE PASSWORD" className="w-full px-8 py-5 rounded-2xl bg-slate-50 border font-black outline-none focus:ring-4 focus:ring-blue-500/10" required />
              <button disabled={loading} className="w-full bg-emerald-600 text-white py-6 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-900 transition-all flex justify-center items-center gap-3">
                {loading ? <Loader2 className="animate-spin" /> : <UserPlus size={20} />} Register Staff
              </button>
              <button type="button" onClick={() => setView('staff-login')} className="w-full text-[10px] font-black text-slate-400 uppercase">Back to Login</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}