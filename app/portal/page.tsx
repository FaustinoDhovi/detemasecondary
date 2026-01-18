"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import readXlsxFile from 'read-excel-file';
import { 
  Wallet, Upload, LogOut, UserCircle2, 
  ShieldCheck, CreditCard, FileText, GraduationCap,
  Lock, CheckCircle2, ClipboardList
} from 'lucide-react';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = (SUPABASE_URL && SUPABASE_KEY) ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// SECURE CREDENTIALS: Now pulled from your .env.local or Vercel Settings
const ADMIN_USER = process.env.NEXT_PUBLIC_ADMIN_USERNAME; 
const ADMIN_PASS = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

const TERM_1_FEE = 70;
const TERM_2_FEE = 70;
const CLOSING_DATE = new Date('2026-04-02');
const REPORT_ACCESS_THRESHOLD = 30;

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

interface MarkRecord {
  subject: string;
  mark: number;
  grade: string;
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
      // Logic check using environment variables
      if (loginId === ADMIN_USER && password === ADMIN_PASS) {
        onLogin('admin', null);
      } else {
        alert("Invalid Admin Credentials");
      }
    } else {
      const { data } = await supabase.from('student_ledger').select('*').eq('id', loginId.toUpperCase().trim()).single();
      if (data) onLogin('student', data as StudentRecord);
      else alert("Student ID not found.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row font-sans text-slate-900">
      <div className="lg:w-1/2 bg-slate-900 p-12 lg:p-24 text-white flex flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <img src="/logo.png" alt="Logo" className="w-24 h-24 mb-12" />
          <h1 className="text-7xl font-black italic leading-[0.8] uppercase tracking-tighter mb-6">Detema<br/><span className="text-blue-500">Cloud</span></h1>
          <p className="text-slate-400 font-bold italic mb-12 uppercase tracking-widest text-xs">Secure Administration</p>
        </div>
      </div>
      <div className="lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <h2 className="text-4xl font-black italic uppercase">{isAdmin ? 'Staff Portal' : 'Student Login'}</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="text" placeholder="ID Number" className="w-full px-8 py-5 rounded-[2rem] bg-slate-50 border border-slate-100 font-black" onChange={(e) => setLoginId(e.target.value)} />
            <input type="password" placeholder="Password" className="w-full px-8 py-5 rounded-[2rem] bg-slate-50 border border-slate-100 font-black" onChange={(e) => setPassword(e.target.value)} />
            <button className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl">{loading ? "Verifying..." : "Enter"}</button>
          </form>
          <button onClick={() => setIsAdmin(!isAdmin)} className="w-full text-[10px] font-black text-blue-600 uppercase italic underline underline-offset-4 decoration-2">{isAdmin ? "Switch to Student" : "Bursar Terminal"}</button>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ role, student }: { role: 'admin' | 'student', student: StudentRecord | null }) {
  const [activeTab, setActiveTab] = useState<'finance' | 'results'>('finance');
  const [syncing, setSyncing] = useState(false);
  const [marks, setMarks] = useState<MarkRecord[]>([]);

  const today = new Date();
  const isAfterClosing = today >= CLOSING_DATE;
  const reportDebt = (student?.previous_balance || 0) + (student?.term_3_balance || 0) + (student?.term_1_2026_balance || 0);
  const hasReportAccess = reportDebt < REPORT_ACCESS_THRESHOLD;

  useEffect(() => {
    if (role === 'student' && student && hasReportAccess) {
      fetchMarks();
    }
  }, [student, hasReportAccess]);

  const fetchMarks = async () => {
    if (!supabase || !student) return;
    const { data } = await supabase.from('student_marks').select('subject, mark, grade').eq('student_id', student.id);
    if (data) setMarks(data as MarkRecord[]);
  };

  const handleMarkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !supabase || role !== 'admin') return;
    setSyncing(true);
    try {
      const rows = await readXlsxFile(file);
      const headers = rows[2] as string[];
      const dataRows = rows.slice(3);
      const allMarks: any[] = [];
      dataRows.forEach((row: any) => {
        if (!row[1]) return;
        for (let i = 3; i < headers.length; i++) {
          if (headers[i] && !['GRAND TOTAL', 'POSITION'].includes(headers[i])) {
            const val = Number(row[i]) || 0;
            allMarks.push({
              student_id: row[0],
              student_name: row[1],
              subject: headers[i],
              mark: val,
              grade: val >= 75 ? 'A' : val >= 60 ? 'B' : val >= 50 ? 'C' : val >= 40 ? 'D' : 'U'
            });
          }
        }
      });
      await supabase.from('student_marks').delete().neq('student_id', 'init');
      await supabase.from('student_marks').insert(allMarks);
      alert("Marks Uploaded!");
    } catch (err: any) { alert(err.message); } finally { setSyncing(false); }
  };

  const handleLedgerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
          const studentId = row[1] ? String(row[1]).trim().toUpperCase() : '';
          const enrollmentYear = studentId.substring(0, 4);
          if (!['2023', '2024', '2025', '2026'].includes(enrollmentYear)) return;
          const prev = Number(row[3]) || 0;
          const t3 = Number(row[4]) || 0;
          const t1 = TERM_1_FEE;
          const t2 = isAfterClosing ? TERM_2_FEE : 0;
          studentMap.set(studentId, {
            id: studentId,
            name: String(row[0]),
            student_class: sheet.name,
            parent_number: String(row[2]),
            previous_balance: prev,
            term_3_balance: t3,
            term_1_2026_balance: t1,
            total_outstanding: prev + t3 + t1 + t2
          });
        });
      }
      await supabase.from('student_ledger').delete().neq('id', 'init');
      await supabase.from('student_ledger').insert(Array.from(studentMap.values()));
      alert("Ledger Updated!");
    } catch (err: any) { alert(err.message); } finally { setSyncing(false); }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <nav className="h-20 bg-white border-b flex items-center px-8 justify-between sticky top-0 z-50">
        <div className="font-black italic text-slate-900 tracking-tighter">DETEMA CLOUD</div>
        {role === 'student' && (
          <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl">
            <TabBtn active={activeTab === 'finance'} label="Fees" icon={<Wallet size={14}/>} onClick={() => setActiveTab('finance')} />
            <TabBtn active={activeTab === 'results'} label="Results" icon={<GraduationCap size={14}/>} onClick={() => setActiveTab('results')} />
          </div>
        )}
        <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="text-red-500 bg-red-50 p-2 rounded-xl"> <LogOut size={18}/> </button>
      </nav>

      <main className="max-w-6xl mx-auto pt-10 px-6 pb-24">
        {role === 'admin' ? (
          <div className="grid md:grid-cols-2 gap-8">
             <AdminBox title="Fee Ledger" desc="Financial Master Sync" onFile={handleLedgerUpload} loading={syncing} icon={<ShieldCheck/>}/>
             <AdminBox title="Mark Schedule" desc="Academic Results Sync" onFile={handleMarkUpload} loading={syncing} icon={<ClipboardList/>}/>
          </div>
        ) : (
          <div className="space-y-8 animate-in slide-in-from-bottom-6">
             {activeTab === 'finance' && (
                <>
                  <div className="bg-slate-900 rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden">
                    <p className="text-blue-400 font-black text-[10px] uppercase tracking-widest mb-2 italic">Current Fee Balance</p>
                    <h2 className="text-8xl font-black italic mb-8 tracking-tighter">${student?.total_outstanding.toLocaleString()}</h2>
                    <div className="flex gap-4">
                        <div className="bg-white/10 px-6 py-3 rounded-full border border-white/10 text-[10px] font-black uppercase italic">{student?.name}</div>
                        <div className="bg-white/10 px-6 py-3 rounded-full border border-white/10 text-[10px] font-black uppercase italic">{student?.id}</div>
                    </div>
                  </div>
                  <div className="grid lg:grid-cols-4 gap-6">
                    <BalanceBox label="Arrears" val={student?.previous_balance || 0} color="text-red-500" />
                    <BalanceBox label="Term 3 2025" val={student?.term_3_balance || 0} color="text-slate-400" />
                    <BalanceBox label="Term 1 2026" val={student?.term_1_2026_balance || 0} color="text-blue-600" />
                    {isAfterClosing && <BalanceBox label="Term 2 2026" val={TERM_2_FEE} color="text-orange-500" />}
                  </div>
                </>
             )}

             {activeTab === 'results' && (
               <div className="space-y-6">
                  {!hasReportAccess ? (
                    <div className="bg-white rounded-[3.5rem] p-16 shadow-xl border border-red-100 text-center flex flex-col items-center">
                        <div className="bg-red-50 p-6 rounded-full text-red-500 mb-6"><Lock size={48}/></div>
                        <h2 className="text-3xl font-black italic uppercase text-slate-900 leading-tight">Access Restricted</h2>
                        <p className="text-slate-400 font-bold italic mt-4 max-w-md">Your current balance of ${reportDebt} exceeds the $30 limit. Please clear your fees to view the report.</p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-[3.5rem] p-12 border border-slate-100 shadow-xl">
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="text-4xl font-black italic uppercase text-slate-900">Academic Report</h3>
                            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-full font-black text-[10px] uppercase italic"><CheckCircle2 size={14}/> Settle</div>
                        </div>
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] font-black uppercase text-slate-400 border-b border-slate-50">
                                    <th className="pb-4">Subject</th>
                                    <th className="pb-4 text-center">Mark</th>
                                    <th className="pb-4 text-right">Grade</th>
                                </tr>
                            </thead>
                            <tbody className="font-bold text-slate-900">
                                {marks.length > 0 ? marks.map((m, i) => (
                                    <tr key={i} className="border-b border-slate-50">
                                        <td className="py-5 italic uppercase">{m.subject}</td>
                                        <td className="py-5 text-center text-slate-500">{m.mark}%</td>
                                        <td className={`py-5 text-right font-black ${m.grade === 'U' ? 'text-red-500' : 'text-blue-600'}`}>{m.grade}</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={3} className="py-20 text-center text-slate-400 italic">Marks not yet uploaded.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                  )}
               </div>
             )}
          </div>
        )}
      </main>
    </div>
  );
}

function AdminBox({ title, desc, onFile, loading, icon }: any) {
  return (
    <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl text-slate-900">
        <div className="p-4 bg-blue-50 w-fit rounded-2xl mb-6 text-blue-600">{icon}</div>
        <h3 className="text-2xl font-black italic uppercase mb-2">{title}</h3>
        <p className="text-xs font-bold text-slate-400 mb-8 uppercase italic">{desc}</p>
        <label className="cursor-pointer bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 w-fit hover:bg-blue-600 transition-all">
            <Upload size={16}/> {loading ? 'Processing...' : 'Upload File'}
            <input type="file" className="hidden" accept=".xlsx" onChange={onFile} disabled={loading} />
        </label>
    </div>
  );
}

function TabBtn({ active, label, icon, onClick }: any) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
      {icon} <span className="hidden md:inline">{label}</span>
    </button>
  );
}

function BalanceBox({ label, val, color }: any) {
    return (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black uppercase text-slate-400 italic mb-2 tracking-widest">{label}</p>
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
  if (!supabase) return <div className="h-screen flex items-center justify-center font-black">DATABASE CONNECTION ERROR</div>;
  if (!session) return <AuthPage onLogin={(role, student) => {
    const s = { role, student };
    setSession(s);
    localStorage.setItem('portalSession', JSON.stringify(s));
  }} />;
  return <Dashboard role={session.role} student={session.student} />;
}