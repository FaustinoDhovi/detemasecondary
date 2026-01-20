"use client";
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Loader2, ArrowLeft, ShieldAlert, LogIn, UserCircle, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '', 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function PortalLoginPage() {
  const [isStaff, setIsStaff] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [passInput, setPassInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const cleanUser = userInput.trim();
    const cleanPass = passInput.trim();

    try {
      if (isStaff) {
        // --- SECURE STAFF LOGIN ---
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: cleanUser,
          password: cleanPass,
        });

        if (authError) {
          setErrorMsg("Invalid Staff Credentials.");
          setLoading(false);
          return;
        }

        // Verify profile and approval status
        const { data: profile, error: profError } = await supabase
          .from('staff_profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (profError || !profile) {
          setErrorMsg("Staff profile not found.");
        } else if (!profile.is_approved) {
          setErrorMsg("Account pending Admin approval.");
        } else {
          // Redirect based on database role
          localStorage.setItem('portalSession', JSON.stringify({ role: profile.role, user: profile }));
          if (profile.role === 'admin') {
            router.push('/portal/admin');
          } else {
            router.push('/teacher');
          }
        }
      } else {
        // --- STUDENT LOGIN ---
        const { data, error } = await supabase
          .from('student_ledger')
          .select('*')
          .ilike('name', `%${cleanUser.toUpperCase()}%`)
          .single();

        if (error || !data) {
          setErrorMsg("Student record not found.");
          return;
        }

        if (cleanPass.toUpperCase() === data.id.trim().toUpperCase()) {
          localStorage.setItem('portalSession', JSON.stringify({ role: 'student', student: data }));
          router.push('/portal/dashboard');
        } else {
          setErrorMsg("Incorrect Student ID.");
        }
      }
    } catch (err) {
      setErrorMsg("Connection error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row font-sans text-slate-900">
      {/* Left Branding Side */}
      <div className="lg:w-1/2 bg-slate-900 p-12 lg:p-24 text-white flex flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-400 font-black uppercase text-[10px] tracking-widest mb-12 transition-colors">
            <ArrowLeft size={14} /> Back to Website
          </Link>
          <h1 className="text-7xl font-black italic leading-[0.8] uppercase tracking-tighter mb-6">Detema<br/><span className="text-blue-500">Cloud</span></h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em]">Institutional Management v2.0</p>
        </div>
        
        <div className="relative z-10 flex items-center gap-4 bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-sm max-w-xs">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center">
            {isStaff ? <UserCircle size={24} /> : <GraduationCap size={24} />}
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest">
            {isStaff ? "Authorized Personnel Access Only" : "Secure Student Portal Entry"}
          </p>
        </div>

        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* Right Login Side */}
      <div className="lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-12">
          <header>
            <div className={`w-16 h-1 mb-6 transition-all duration-500 ${isStaff ? 'bg-blue-600' : 'bg-slate-900'}`}></div>
            <h2 className="text-5xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">
              {isStaff ? 'Staff<br/>Access' : 'Student<br/>Entry'}
            </h2>
          </header>

          {errorMsg && (
            <div className="bg-red-50 text-red-600 p-5 rounded-[2rem] flex items-center gap-3 text-xs font-black uppercase border border-red-100 animate-in fade-in slide-in-from-top-2">
              <ShieldAlert size={18} />
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <input 
                  type={isStaff ? "email" : "text"} 
                  placeholder={isStaff ? "OFFICIAL EMAIL" : "STUDENT FULL NAME"} 
                  className="w-full px-8 py-6 rounded-[2rem] bg-slate-50 border border-slate-100 font-black outline-none focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-300" 
                  onChange={(e) => setUserInput(e.target.value)} 
                  required 
                />
              </div>
              <div className="relative">
                <input 
                  type="password" 
                  placeholder={isStaff ? "PASSWORD" : "STUDENT ID NUMBER"} 
                  className="w-full px-8 py-6 rounded-[2rem] bg-slate-50 border border-slate-100 font-black outline-none focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-300" 
                  onChange={(e) => setPassInput(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <button disabled={loading} className="w-full bg-slate-900 text-white py-6 rounded-[2.5rem] font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex justify-center items-center gap-3 shadow-2xl active:scale-95 disabled:opacity-70">
              {loading ? <Loader2 className="animate-spin" /> : <LogIn size={20} />}
              {loading ? "Verifying..." : "Sign In to Portal"}
            </button>
          </form>

          <div className="pt-6 border-t border-slate-100">
            <button 
              onClick={() => { setIsStaff(!isStaff); setErrorMsg(null); }} 
              className="w-full text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-slate-900 transition-colors"
            >
              {isStaff ? "← Switch to Student Login" : "Staff Administration Access →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}