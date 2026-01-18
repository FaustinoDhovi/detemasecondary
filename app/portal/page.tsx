"use client";
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Loader2, ArrowLeft, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function PortalLoginPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [id, setId] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isAdmin) {
        // STRICT ADMIN CHECK: Only uses Vercel/Local Environment Variables
        const adminUser = process.env.NEXT_PUBLIC_ADMIN_USERNAME;
        const adminPass = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

        if (!adminUser || !adminPass) {
          setError("Server configuration error. Contact System Admin.");
          setLoading(false);
          return;
        }

        if (id.trim() === adminUser && pass === adminPass) {
          localStorage.setItem('portalSession', JSON.stringify({ role: 'admin' }));
          window.location.href = '/portal/admin';
        } else {
          setError("Invalid administrative credentials.");
        }
      } else {
        // STUDENT CHECK: Always checks the real-time Supabase Database
        const { data, error: dbError } = await supabase
          .from('students')
          .select('*')
          .eq('id', id.toUpperCase().trim())
          .single();

        if (data) {
          localStorage.setItem('portalSession', JSON.stringify({ role: 'student', student: data }));
          window.location.href = '/portal/dashboard';
        } else {
          setError("Student ID not recognized.");
        }
      }
    } catch (err) {
      setError("An unexpected connection error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row font-sans text-slate-900">
      <div className="lg:w-1/2 bg-slate-900 p-12 lg:p-24 text-white flex flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-400 font-black uppercase text-[10px] tracking-[0.3em] transition-all mb-12">
            <ArrowLeft size={14} /> Back to Website
          </Link>
          <h1 className="text-7xl font-black italic leading-[0.8] uppercase tracking-tighter mb-6">Detema<br/><span className="text-blue-500">Cloud</span></h1>
          <p className="text-slate-400 font-bold italic uppercase tracking-widest text-[10px]">Security Layer Enabled</p>
        </div>
      </div>

      <div className="lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <h2 className="text-4xl font-black italic uppercase tracking-tighter">
            {isAdmin ? 'Staff Portal' : 'Student Login'}
          </h2>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-black uppercase italic">
              <ShieldAlert size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest italic">Identification</label>
              <input 
                type="text" 
                placeholder={isAdmin ? "Username" : "Student ID"} 
                className="w-full px-8 py-5 rounded-[2rem] bg-slate-50 border border-slate-100 font-black outline-none focus:ring-2 focus:ring-blue-500/20" 
                onChange={(e) => setId(e.target.value)} 
                required 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest italic">Passcode</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full px-8 py-5 rounded-[2rem] bg-slate-50 border border-slate-100 font-black outline-none focus:ring-2 focus:ring-blue-500/20" 
                onChange={(e) => setPass(e.target.value)} 
                required 
              />
            </div>
            <button disabled={loading} className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex justify-center items-center gap-2 shadow-xl shadow-slate-200">
              {loading ? <Loader2 className="animate-spin" /> : "Verify Identity"}
            </button>
          </form>

          <button onClick={() => setIsAdmin(!isAdmin)} className="w-full text-[10px] font-black text-blue-600 uppercase italic underline underline-offset-8 decoration-2 hover:text-slate-900 transition-colors">
            {isAdmin ? "Switch to Student View" : "Bursar/Staff Terminal"}
          </button>
        </div>
      </div>
    </div>
  );
}