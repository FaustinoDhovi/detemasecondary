"use client";
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Loader2, ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function PortalLoginPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [idInput, setIdInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const cleanName = nameInput.trim().toUpperCase();
    const cleanId = idInput.trim().toUpperCase();

    try {
      if (isAdmin) {
        // Staff Authentication
        if (cleanName === process.env.NEXT_PUBLIC_ADMIN_USERNAME && idInput === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
          localStorage.setItem('portalSession', JSON.stringify({ role: 'admin' }));
          window.location.href = '/portal/admin';
        } else {
          setErrorMsg("Access Denied.");
        }
      } else {
        // Student Authentication
        // ilike handles names with trailing spaces often found in Excel data
        const { data, error } = await supabase
          .from('student_ledger')
          .select('*')
          .ilike('name', `%${cleanName}%`)
          .single();

        if (error || !data) {
          setErrorMsg("Login Failed.");
          setLoading(false);
          return;
        }

        // Student ID acts as the password
        if (cleanId === data.id.trim().toUpperCase()) {
          localStorage.setItem('portalSession', JSON.stringify({ 
            role: 'student', 
            student: data 
          }));
          window.location.href = '/portal/dashboard';
        } else {
          setErrorMsg("Login Failed.");
        }
      }
    } catch (err) {
      setErrorMsg("System Error.");
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
          <h1 className="text-7xl font-black italic leading-[0.8] uppercase tracking-tighter mb-6">
            Detema<br/><span className="text-blue-500">Cloud</span>
          </h1>
        </div>
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-12">
          <header>
            <div className="w-16 h-1 bg-blue-600 mb-6"></div>
            <h2 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900">
              {isAdmin ? 'Staff Access' : 'Student Login'}
            </h2>
          </header>

          {errorMsg && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-xs font-bold uppercase border border-red-100">
              <AlertCircle size={18} />
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="group">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-2 block">
                  {isAdmin ? 'Username' : 'Full Name'}
                </label>
                <input 
                  type="text" 
                  autoComplete="off"
                  className="w-full px-8 py-5 rounded-[2rem] bg-slate-50 border border-slate-100 font-black focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" 
                  onChange={(e) => setNameInput(e.target.value)} 
                  required 
                />
              </div>

              <div className="group">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-2 block">
                  {isAdmin ? 'Password' : 'Student ID'}
                </label>
                <input 
                  type="password" 
                  className="w-full px-8 py-5 rounded-[2rem] bg-slate-50 border border-slate-100 font-black focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" 
                  onChange={(e) => setIdInput(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <button 
              disabled={loading} 
              className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest hover:bg-blue-600 shadow-2xl transition-all flex justify-center items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Sign In"}
            </button>
          </form>

          <button 
            onClick={() => setIsAdmin(!isAdmin)} 
            className="w-full text-[10px] font-black text-blue-600 uppercase italic underline underline-offset-8 decoration-2"
          >
            {isAdmin ? "Student Access" : "Staff Access"}
          </button>
        </div>
      </div>
    </div>
  );
}