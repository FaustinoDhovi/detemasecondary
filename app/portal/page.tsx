"use client";
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import readXlsxFile from 'read-excel-file';
import { 
  Upload, ClipboardList, Wallet, Loader2, CheckCircle2, 
  Users, Search, DollarSign, ShieldAlert, FileText, UserCheck, XCircle, LogOut 
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '', 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

const SCHOOL_LOGO_BASE64 = "PASTE_YOUR_BASE64_CODE_HERE";

export default function AdminPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [pendingStaff, setPendingStaff] = useState<any[]>([]);
  const [view, setView] = useState<'finance' | 'staff'>('finance');
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [status, setStatus] = useState<{type: 'success' | 'error', msg: string} | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: st } = await supabase.from('student_ledger').select('*').order('name');
    const { data: ps } = await supabase.from('staff_profiles').select('*').eq('is_approved', false);
    if (st) setStudents(st);
    if (ps) setPendingStaff(ps);
  };

  // --- SIGN OUT LOGIC ---
  const handleSignOut = () => {
    localStorage.removeItem('portalSession');
    router.push('/portal');
  };

  const handleFileUpload = async (e: any, type: 'ledger' | 'balances') => {
    setLoading(type);
    try {
      const rows = await readXlsxFile(e.target.files[0]);
      const dataRows = rows.slice(1);

      if (type === 'ledger') {
        const { error } = await supabase.from('student_ledger').upsert(
          dataRows.map(r => ({
            id: String(r[0]),
            name: String(r[1]),
            class: String(r[2]),
            total_fees: Number(r[3]),
            paid: Number(r[4]),
            balance: Number(r[5]),
            is_locked: Number(r[5]) > 0
          }))
        );
        if (error) throw error;
      }
      
      setStatus({ type: 'success', msg: `${type === 'ledger' ? 'Ledger' : 'Balances'} updated successfully!` });
      fetchData();
    } catch (err: any) {
      setStatus({ type: 'error', msg: err.message });
    } finally {
      setLoading(null);
    }
  };

  const approveStaff = async (id: string) => {
    const { error } = await supabase.from('staff_profiles').update({ is_approved: true }).eq('id', id);
    if (!error) fetchData();
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalDebt = students.reduce((acc, curr) => acc + (curr.balance || 0), 0);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 pb-20">
      {/* HEADER NAV */}
      <nav className="bg-slate-900 text-white p-6 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-2xl rotate-3">
              <ShieldAlert className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black italic uppercase tracking-tighter leading-none">Management Center</h1>
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.3em] mt-1 text-center md:text-left">DeteMa Cloud v2.0</p>
            </div>
          </div>

          <div className="flex bg-slate-800 p-1.5 rounded-2xl border border-slate-700 w-full md:w-auto">
            <button onClick={() => setView('finance')} className={`flex-1 md:flex-none px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'finance' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
              Financials
            </button>
            <button onClick={() => setView('staff')} className={`flex-1 md:flex-none px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'staff' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
              Staff Approval ({pendingStaff.length})
            </button>
          </div>

          {/* ADDED SIGN OUT BUTTON */}
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-2 px-6 py-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-red-500/20 group"
          >
            <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" /> 
            Sign Out
          </button>
        </div>
      </nav>

      {status && (
        <div className="max-w-7xl mx-auto mt-8 px-6">
          <div className={`p-4 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase border ${status.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
            <CheckCircle2 size={18} /> {status.msg}
          </div>
        </div>
      )}

      {view === 'finance' ? (
        <div className="max-w-7xl mx-auto p-6 space-y-8">
          {/* STATS & UPLOADS */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-slate-900 rounded-[2.5rem] p-10 text-white flex flex-col justify-between shadow-2xl relative overflow-hidden group">
              <div className="relative z-10">
                <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Total School Debt</p>
                <h2 className="text-6xl font-black italic leading-none tracking-tighter">${totalDebt.toLocaleString()}</h2>
              </div>
              <DollarSign className="absolute -bottom-10 -right-10 text-white/5 w-64 h-64 group-hover:scale-110 transition-transform duration-700" />
            </div>

            <div className="lg:col-span-2 grid md:grid-cols-2 gap-4">
              <UploadAction 
                title="Update Fee Ledger" 
                icon={<ClipboardList />} 
                color="bg-indigo-600"
                isLoading={loading === 'ledger'}
                onUpload={(e: any) => handleFileUpload(e, 'ledger')}
              />
              <UploadAction 
                title="Sync Daily Balances" 
                icon={<Wallet />} 
                color="bg-emerald-600"
                isLoading={loading === 'balances'}
                onUpload={(e: any) => handleFileUpload(e, 'balances')}
              />
            </div>
          </div>

          {/* TABLE SECTION */}
          <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
              <h3 className="text-2xl font-black italic uppercase tracking-tighter">Student Accounts</h3>
              <div className="relative w-full md:w-96">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="SEARCH BY NAME OR ID..." 
                  className="w-full pl-16 pr-8 py-4 rounded-2xl bg-white border border-slate-200 font-bold text-xs outline-none focus:ring-4 focus:ring-blue-500/10 shadow-sm"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="px-6 py-2 text-left">Student Info</th>
                    <th className="px-6 py-2 text-left">Status</th>
                    <th className="px-6 py-2 text-right">Balance</th>
                    <th className="px-6 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((s) => (
                    <tr key={s.id} className="bg-white group hover:shadow-md transition-all rounded-2xl border border-slate-100">
                      <td className="px-6 py-5 rounded-l-2xl">
                        <p className="font-black text-slate-900 uppercase text-sm">{s.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">ID: {s.id} • Class: {s.class}</p>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase ${s.is_locked ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-emerald-50 text-emerald-500 border border-emerald-100'}`}>
                          {s.is_locked ? 'Locked' : 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right font-black text-slate-900 tabular-nums">
                        ${s.balance?.toLocaleString()}
                      </td>
                      <td className="px-6 py-5 rounded-r-2xl text-right">
                        <button className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white transition-all"><FileText size={18} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto p-6 mt-12">
          <div className="bg-slate-50 rounded-[3rem] p-12 border border-slate-100 shadow-sm text-center">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-4">Pending Access Requests</h2>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] mb-12">Verify and authorize school staff accounts</p>
            
            {pendingStaff.length === 0 ? (
              <div className="py-20 flex flex-col items-center opacity-20">
                <Users size={64} className="mb-4" />
                <p className="font-black uppercase tracking-widest text-xs">No pending requests</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingStaff.map(staff => (
                  <div key={staff.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 hover:scale-[1.02] transition-transform">
                    <div className="text-center md:text-left">
                      <p className="text-lg font-black uppercase text-slate-900 leading-none">{staff.full_name}</p>
                      <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-2">{staff.role} • EC: {staff.ec_number}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{staff.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => approveStaff(staff.id)}
                        className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-md active:scale-95"
                      >
                        <UserCheck size={16} /> Approve Account
                      </button>
                      <button className="p-4 rounded-2xl bg-white border border-red-100 text-red-500 hover:bg-red-50 transition-all">
                        <XCircle size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function UploadAction({ title, icon, isLoading, onUpload, color }: any) {
  return (
    <label className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl cursor-pointer hover:bg-white hover:shadow-md hover:scale-[1.02] transition-all border-2 border-transparent hover:border-slate-100 group">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg ${color} group-hover:rotate-6 transition-transform`}>{icon}</div>
      <div className="flex-1 text-left">
        <p className="text-[10px] font-black uppercase text-slate-900">{title}</p>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{isLoading ? "Syncing..." : "Upload Excel"}</p>
      </div>
      {isLoading ? <Loader2 className="animate-spin text-blue-600" /> : <Upload size={18} className="text-slate-300" />}
      <input type="file" className="hidden" accept=".xlsx" onChange={onUpload} disabled={isLoading} />
    </label>
  );
}