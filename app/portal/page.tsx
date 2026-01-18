"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Loader2, ArrowLeft, AlertCircle, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '', 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function PortalLoginPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [passInput, setPassInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const cleanUser = userInput.trim();
    const cleanPass = passInput.trim();

    try {
      if (isAdmin) {
        // STAFF LOGIN - Using the variables you set in Vercel
        const envUser = process.env.NEXT_PUBLIC_ADMIN_USERNAME;
        const envPass = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

        // Fallback for local testing if Vercel hasn't updated yet
        if (cleanUser === envUser && cleanPass === envPass) {
          localStorage.setItem('portalSession', JSON.stringify({ role: 'admin' }));
          window.location.href = '/portal/admin';
          return;
        } else {
          setErrorMsg("Unauthorized Staff Access.");
          console.error("Staff Login Failed. Check Vercel Env Variables.");
        }
      } else {
        // STUDENT LOGIN (Confirmed working)
        const { data, error } = await supabase
          .from('student_ledger')
          .select('*')
          .ilike('name', `%${cleanUser.toUpperCase()}%`)
          .single();

        if (error || !data) {
          setErrorMsg("Access Denied.");
          return;
        }

        if (cleanPass.toUpperCase() === data.id.trim().toUpperCase()) {
          localStorage.setItem('portalSession', JSON.stringify({ role: 'student', student: data }));
          window.location.href = '/portal/dashboard';
        } else {
          setErrorMsg("Access Denied.");
        }
      }
    } catch (err) {
      setErrorMsg("Connection Error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row font-sans text-slate-900">
      <div className="lg:w-1/2 bg-slate-900 p-12 lg:p-24 text-white flex flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-400 font-black uppercase text-[10px] tracking-widest mb-12">
            <ArrowLeft size={14} /> Back to Website
          </Link>
          <h1 className="text-7xl font-black italic leading-[0.8] uppercase tracking-tighter mb-6">Detema<br/><span className="text-blue-500">Cloud</span></h1>
        </div>
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-12">
          <header>
            <div className="w-16 h-1 bg-blue-600 mb-6"></div>
            <h2 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900">
              {isAdmin ? 'Staff Access' : 'Student Entry'}
            </h2>
          </header>

          {errorMsg && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-xs font-bold uppercase border border-red-100">
              <ShieldAlert size={18} />
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder={isAdmin ? "Staff Username" : "Full Name"} 
                className="w-full px-8 py-5 rounded-[2rem] bg-slate-50 border border-slate-100 font-black outline-none focus:ring-4 focus:ring-blue-500/10 transition-all" 
                onChange={(e) => setUserInput(e.target.value)} 
                required 
              />
              <input 
                type="password" 
                placeholder={isAdmin ? "Staff Password" : "Student ID"} 
                className="w-full px-8 py-5 rounded-[2rem] bg-slate-50 border border-slate-100 font-black outline-none focus:ring-4 focus:ring-blue-500/10 transition-all" 
                onChange={(e) => setPassInput(e.target.value)} 
                required 
              />
            </div>

            <button disabled={loading} className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex justify-center items-center gap-2 shadow-xl">
              {loading ? <Loader2 className="animate-spin" /> : "Sign In"}
            </button>
          </form>

          <button 
            onClick={() => { setIsAdmin(!isAdmin); setErrorMsg(null); }} 
            className="w-full text-[10px] font-black text-blue-600 uppercase underline decoration-2 underline-offset-4"
          >
            {isAdmin ? "Switch to Student Login" : "Staff Administration"}
          </button>
        </div>
      </div>
    </div>
  );
}