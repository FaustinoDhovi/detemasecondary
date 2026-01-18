"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import readXlsxFile from 'read-excel-file';
import { 
  Lock, Wallet, Upload, LogOut, Fingerprint,
  Phone, BookOpen, GraduationCap, ArrowRight, UserCircle2, 
  ShieldCheck, CreditCard, Bell, Download, HelpCircle, Camera, CheckCircle2
} from 'lucide-react';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = (SUPABASE_URL && SUPABASE_KEY) ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

const ADMIN_USER = process.env.NEXT_PUBLIC_ADMIN_USERNAME || 'admin'; 
const ADMIN_PASS = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'DeteMa_1984';

interface StudentRecord {
  id: string;
  name: string;
  student_class: string;
  parent_number: string;
  previous_balance: number;
  term_3_balance: number;
  term_1_2026_balance: number;
  total_outstanding: number;
}

function AuthPage({ onLogin }: { onLogin: (role: 'admin' | 'student', student: StudentRecord | null) => void }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true);
    if (isAdmin) {
      if (loginId === ADMIN_USER && password === ADMIN_PASS) onLogin('admin', null);
      else alert("Unauthorized Admin Access");
    } else {
      const { data } = await supabase.from('student_ledger').select('*').eq('id', loginId.toUpperCase().trim()).single();
      if (data) onLogin('student', data);
      else alert("Student ID not found.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row font-sans">
      <div className="lg:w-1/2 bg-slate-900 p-12 lg:p-24 text-white flex flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <img src="/logo.png" alt="Logo" className="w-24 h-24 mb-12" />
          <h1 className="text-7xl font-black italic leading-[0.8] uppercase tracking-tighter mb-6">Detema<br/><span className="text-blue-500">Cloud</span></h1>
          <p className="text-slate-400 font-bold italic mb-12 uppercase tracking-widest text-xs">Official School Ledger Terminal</p>
        </div>
      </div>

      <div className="lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <h2 className="text-4xl font-black italic uppercase text-slate-900">{isAdmin ? 'Admin Entry' : 'Student Entry'}</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="text" placeholder={isAdmin ? "Username" : "Student ID (e.g. S123)"} className="w-full px-8 py-5 rounded-[2rem] bg-slate-50 border border-slate-100 font-black text-slate-900" onChange={(e) => setLoginId(e.target.value)} />
            <input type="password" placeholder="Password" className="w-full px-8 py-5 rounded-[2rem] bg-slate-50 border border-slate-100 font-black text-slate-900" onChange={(e) => setPassword(e.target.value)} />
            <button className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl">{loading ? "Authenticating..." : "Access Portal"}</button>
          </form>
          <button onClick={() => setIsAdmin(!isAdmin)} className="w-full text-[10px] font-black text-blue-600 uppercase italic underline underline-offset-4 decoration-2">{isAdmin ? "Student View" : "Administrator Terminal"}</button>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ role, student }: { role: 'admin' | 'student', student: StudentRecord | null }) {
  const [syncing, setSyncing] = useState(false);
  const [popUploading, setPopUploading] = useState(false);

  const handlePopUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !supabase || !student) return;
    setPopUploading(true);
    
    try {
      // In a real app, you'd upload to Supabase Storage first. 
      // For now, we simulate the submission to the audit table.
      const { error } = await supabase.from('payment_submissions').insert({
        student_id: student.id,
        student_name: student.name,
        submission_date: new Date().toISOString(),
        status: 'pending'
      });
      
      if (error) throw error;
      alert("Proof of Payment submitted! The bursar will verify this within 24 hours.");
    } catch (err: any) {
      alert("Submission failed: " + err.message);
    } finally {
      setPopUploading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !supabase || role !== 'admin') return;
    setSyncing(true);

    try {
      const sheetsResult = await readXlsxFile(file, { getSheets: true } as any);
      const sheets = (sheetsResult as unknown) as any[];
      const studentMap = new Map<string, StudentRecord>();

      for (const sheet of sheets) {
        const rows = await readXlsxFile(file, { sheet: sheet.name });
        rows.slice(1).forEach((row) => {
          if (!row[0] && !row[1]) return; 
          const studentId = row[1] ? String(row[1]).trim().toUpperCase() : null;
          if (!studentId) return;
          const prev = Number(row[3]) || 0;
          const t3 = Number(row[4]) || 0;
          const t1 = Number(row[5]) || 0;
          studentMap.set(studentId, {
            id: studentId,
            name: row[0] ? String(row[0]).trim() : "Unknown Student",
            student_class: sheet.name,
            parent_number: row[2] ? String(row[2]).trim() : "N/A",
            previous_balance: prev,
            term_3_balance: t3,
            term_1_2026_balance: t1,
            total_outstanding: prev + t3 + t1
          });
        });
      }
      const masterData = Array.from(studentMap.values());
      await supabase.from('student_ledger').delete().neq('id', 'temp-init');
      await supabase.from('student_ledger').insert(masterData);
      alert(`Sync Complete! Processed ${masterData.length} unique students.`);
    } catch (err: any) {
      alert(`Sync Failed: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <nav className="h-20 bg-white border-b flex items-center px-8 justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
           <img src="/logo.png" alt="Logo" className="w-8 h-8" />
           <span className="font-black italic text-slate-900 tracking-tighter">DETEMA CLOUD</span>
        </div>
        <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="text-red-500 font-black text-[10px] uppercase tracking-widest bg-red-50 px-4 py-2 rounded-xl flex items-center gap-2"> <LogOut size={14}/> Log Out</button>
      </nav>

      <main className="max-w-6xl mx-auto pt-10 px-6 pb-24 text-slate-900">
        {role === 'admin' ? (
          <div className="bg-white rounded-[3.5rem] p-12 shadow-xl border border-blue-100">
             <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-blue-600 rounded-3xl text-white shadow-lg"><ShieldCheck /></div>
                <div>
                    <h2 className="text-4xl font-black italic uppercase text-slate-900 leading-none">Database Sync</h2>
                    <p className="text-slate-400 font-bold italic text-sm mt-1 uppercase">Deduplication: Active</p>
                </div>
            </div>
            <label className="cursor-pointer bg-slate-900 text-white px-12 py-6 rounded-full font-black uppercase tracking-widest text-xs inline-flex items-center gap-3 hover:bg-blue-600 transition-all shadow-xl">
              <Upload size={18} /> {syncing ? 'Deduplicating & Syncing...' : 'Upload 7-Sheet Excel'}
              <input type="file" disabled={syncing} className="hidden" accept=".xlsx" onChange={handleUpload} />
            </label>
          </div>
        ) : (
          <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-700">
             {/* Main Balance Header */}
             <div className="bg-slate-900 rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden">
                <div className="flex justify-between items-start mb-4 relative z-10">
                    <p className="text-blue-400 font-black text-[10px] uppercase tracking-[0.3em]">Account Summary</p>
                    <div className="bg-blue-600 px-6 py-2 rounded-full text-[12px] font-black uppercase italic tracking-widest">{student?.student_class}</div>
                </div>
                <h2 className="text-8xl font-black italic mb-8 leading-none tracking-tighter relative z-10">${student?.total_outstanding.toLocaleString()}</h2>
                <div className="flex flex-wrap gap-4 relative z-10">
                    <div className="bg-white/10 px-6 py-3 rounded-full flex items-center gap-3 border border-white/10 text-[10px] font-black uppercase italic"><UserCircle2 size={14}/>{student?.name}</div>
                    <div className="bg-white/10 px-6 py-3 rounded-full flex items-center gap-3 border border-white/10 text-[10px] font-black uppercase italic"><Fingerprint size={14}/>{student?.id}</div>
                </div>
                <Wallet size={350} className="absolute -right-24 -bottom-24 opacity-5 rotate-12" />
             </div>

             <div className="grid lg:grid-cols-3 gap-6">
                <BalanceBox label="Previous Arrears" val={student?.previous_balance || 0} color="text-red-500" />
                <BalanceBox label="Term 3 2025" val={student?.term_3_balance || 0} color="text-slate-900" />
                <BalanceBox label="Term 1 2026 (New)" val={student?.term_1_2026_balance || 0} color="text-blue-600" />
             </div>

             <div className="grid lg:grid-cols-2 gap-8">
                {/* Proof of Payment Section */}
                <div className="bg-blue-600 p-10 rounded-[3rem] text-white shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                        <Camera size={24} />
                        <h3 className="font-black italic uppercase">Submit Receipt (POP)</h3>
                    </div>
                    <p className="text-sm font-bold opacity-80 mb-6">Already paid? Upload your receipt photo here to notify the bursar and clear your balance faster.</p>
                    <label className="cursor-pointer bg-white text-blue-600 px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-slate-100 transition-all shadow-xl">
                        <Upload size={16} /> {popUploading ? "Uploading..." : "Upload Receipt"}
                        <input type="file" accept="image/*" className="hidden" onChange={handlePopUpload} />
                    </label>
                </div>

                {/* Important Notices */}
                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                        <Bell className="text-orange-500" />
                        <h3 className="font-black italic uppercase text-slate-900">Term 1 Notices</h3>
                    </div>
                    <ul className="space-y-4">
                        <li className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="text-blue-600 font-black italic">01</div>
                            <p className="text-sm font-bold text-slate-600">School re-opens for Term 1 on Jan 13th, 2026.</p>
                        </li>
                        <li className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="text-blue-600 font-black italic">02</div>
                            <p className="text-sm font-bold text-slate-600">Please settle Term 1 fees to ensure early registration.</p>
                        </li>
                    </ul>
                </div>
             </div>
             
             {/* Payment Channels */}
             <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-lg mt-8">
                <div className="flex items-center gap-3 mb-8">
                    <CreditCard className="text-blue-600" />
                    <h3 className="font-black italic uppercase text-slate-900">Payment Channels</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 bg-slate-50 rounded-3xl flex items-center gap-6">
                        <div className="bg-white p-4 rounded-2xl shadow-sm"><img src="/bankabc.webp" className="w-10" alt="Bank" /></div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase italic">BankABC (USD)</p>
                            <p className="font-black text-slate-800">Branch: 1092 / Acc: 827419XXX</p>
                        </div>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-3xl flex items-center gap-6">
                        <div className="bg-white p-4 rounded-2xl shadow-sm"><img src="/ecocash.webp" className="w-10" alt="Ecocash" /></div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase italic">Ecocash USD</p>
                            <p className="font-black text-slate-800">Merchant Code: *151*2*2*152643#</p>
                        </div>
                    </div>
                </div>
             </div>

             <div className="flex justify-center pt-8">
                <div className="flex items-center gap-2 text-slate-400 font-bold italic text-xs uppercase tracking-widest">
                    <HelpCircle size={14}/> Support: +263 77X XXX XXX (Bursar)
                </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
}

function BalanceBox({ label, val, color }: { label: string, val: number, color: string }) {
    return (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic mb-2">{label}</p>
            <p className={`text-3xl font-black italic ${color}`}>${val.toLocaleString()}</p>
        </div>
    );
}

export default function Portal() {
  const [session, setSession] = useState<{role: 'admin' | 'student', student: StudentRecord | null} | null>(null);
  useEffect(() => {
    const saved = localStorage.getItem('portalSession');
    if (saved) setSession(JSON.parse(saved));
  }, []);
  if (!supabase) return <div className="h-screen flex items-center justify-center font-black italic uppercase">Config Missing</div>;
  if (!session) return <AuthPage onLogin={(role, student) => {
    const s = { role, student };
    setSession(s);
    localStorage.setItem('portalSession', JSON.stringify(s));
  }} />;
  return <Dashboard role={session.role} student={session.student} />;
}