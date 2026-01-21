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

  async function fetchData() {
    const { data: stdData } = await supabase.from('student_ledger').select('*').order('name', { ascending: true });
    if (stdData) setStudents(stdData);

    const { data: stfData } = await supabase.from('staff_profiles').select('*').eq('is_approved', false);
    if (stfData) setPendingStaff(stfData);
  }

  // --- HELPER TO CALCULATE/FORMAT BALANCE ---
  const getBalanceInfo = (s: any) => {
    const prev = s.previous_balance?.toString() || "0";
    const curr = s.term_1_2026?.toString() || "0";
    
    // If either column contains text (BEAM, SOLON), return the text
    if (isNaN(Number(prev)) && prev !== "0") return { value: prev, isNumeric: false };
    if (isNaN(Number(curr)) && curr !== "0") return { value: curr, isNumeric: false };
    
    const total = (Number(prev) || 0) + (Number(curr) || 0);
    return { value: total, isNumeric: true };
  };

  const stats = students.reduce((acc, s) => {
    const info = getBalanceInfo(s);
    if (info.isNumeric) {
      acc.totalOwed += (info.value as number);
      if ((info.value as number) > 50) acc.lockedCount += 1;
    }
    return acc;
  }, { totalOwed: 0, lockedCount: 0 });

  const filteredStudents = students.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFinanceUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading('finance');
    try {
      const sheets = await (readXlsxFile as any)(file, { getSheets: true });
      for (const sheet of sheets) {
        const rows = await readXlsxFile(file, { sheet: sheet.name });
        // Find header row containing "STUDENT NUMBER"
        const hIdx = rows.findIndex(r => r.some(c => c?.toString().toUpperCase().includes("STUDENT NUMBER")));
        if (hIdx === -1) continue;

        const headers = rows[hIdx].map(h => h?.toString().toUpperCase().trim() || "");
        const dataRows = rows.slice(hIdx + 1);

        const batch = dataRows.map(row => {
          const get = (keys: string[]) => {
            const i = headers.findIndex(h => keys.some(k => h.includes(k)));
            return i !== -1 ? row[i]?.toString().trim() : "0";
          };

          const id = get(["STUDENT NUMBER", "ID"]);
          if (!id || id === "0") return null;

          return {
            id,
            name: get(["NAME"]),
            student_class: sheet.name.replace('FEES REGISTER', '').trim(),
            // Match your specific Excel columns: "PREVIOUS BALANCE" and "2026 TERM1"
            previous_balance: get(["PREVIOUS BALANCE", "BAL B/F"]),
            term_1_2026: get(["2026 TERM1", "TERM 1 2026", "2026 TERM 1"])
          };
        }).filter(Boolean);

        if (batch.length > 0) {
          await supabase.from('student_ledger').upsert(batch, { onConflict: 'id' });
        }
      }
      setStatus({ type: 'success', msg: "Finance Ledger Synced Successfully!" });
      fetchData();
    } catch (err: any) {
      setStatus({ type: 'error', msg: "Upload Failed: " + err.message });
    }
    setLoading(null);
  };

  const generateDebtReport = () => {
    const doc = new jsPDF();
    // ... (Keep existing PDF styling logic)
    const tableData = students.map(s => {
      const info = getBalanceInfo(s);
      const display = info.isNumeric ? `$${(info.value as number).toFixed(2)}` : info.value;
      const status = info.isNumeric && (info.value as number) > 50 ? 'LOCKED' : 'ACTIVE';
      return [s.id, s.name, s.student_class, display, status];
    });

    autoTable(doc, {
      startY: 45,
      head: [['ID', 'STUDENT NAME', 'CLASS', 'TOTAL OWING', 'PORTAL']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [30, 41, 59] }
    });
    doc.save(`Debt_Report_${new Date().toLocaleDateString()}.pdf`);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans space-y-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-1">Admin Terminal</p>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">Detema <span className="text-blue-600">Finance</span></h1>
          <div className="flex gap-4 mt-6">
            <button onClick={() => setView('finance')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'finance' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-200'}`}>Financial Dashboard</button>
            <button onClick={() => setView('staff')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative ${view === 'staff' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-200'}`}>
              Staff Approvals {pendingStaff.length > 0 && <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-[8px] font-black">{pendingStaff.length}</span>}
            </button>
          </div>
        </div>
        <div className="flex gap-2">
            <button onClick={generateDebtReport} className="bg-white border-2 border-slate-900 text-slate-900 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-900 hover:text-white transition-all"><FileText size={14} /> Report</button>
            <button onClick={() => { localStorage.clear(); router.push('/portal'); }} className="bg-red-50 text-red-600 p-4 rounded-2xl hover:bg-red-600 hover:text-white transition-all"><LogOut size={20}/></button>
        </div>
      </header>

      {view === 'finance' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-500">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl">
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Total School Debt</p>
              <h2 className="text-4xl font-black italic mt-1">${stats.totalOwed.toLocaleString(undefined, {minimumFractionDigits: 2})}</h2>
            </div>
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Restricted Portals</p>
                <h2 className="text-4xl font-black italic text-red-600 mt-1">{stats.lockedCount}</h2>
              </div>
              <ShieldAlert className="text-red-100" size={60} />
            </div>
            <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-xl">
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-100">Database Status</p>
              <h2 className="text-2xl font-black uppercase italic mt-1">Live & Secure</h2>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-black uppercase italic text-sm tracking-tight">Student Ledger</h3>
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="text" placeholder="Search name or ID..." className="w-full pl-10 pr-4 py-3 bg-white border-none rounded-xl text-xs font-bold shadow-inner" onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
              </div>
              <div className="max-h-[600px] overflow-y-auto">
                <table className="w-full text-left">
                  <thead className="sticky top-0 bg-white text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
                    <tr><th className="p-6">Student</th><th className="p-6">Class</th><th className="p-6">Balance</th><th className="p-6">Access</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredStudents.map(s => {
                      const info = getBalanceInfo(s);
                      return (
                        <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-6">
                            <p className="font-black text-slate-900 uppercase text-xs">{s.name}</p>
                            <p className="text-[9px] font-bold text-slate-400 tracking-tighter">{s.id}</p>
                          </td>
                          <td className="p-6 text-[10px] font-black text-slate-500 uppercase">{s.student_class}</td>
                          <td className="p-6 font-black text-xs text-slate-900">
                            {info.isNumeric ? `$${(info.value as number).toLocaleString(undefined, {minimumFractionDigits:2})}` : info.value}
                          </td>
                          <td className="p-6">
                            {info.isNumeric && (info.value as number) > 50 ? (
                              <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-[9px] font-black uppercase">Locked</span>
                            ) : (
                              <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[9px] font-black uppercase">Active</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                <h3 className="text-xs font-black uppercase italic mb-6 text-slate-400">Sync Data</h3>
                <div className="space-y-4">
                    <UploadAction title="Finance Ledger" icon={<Wallet />} isLoading={loading==='finance'} onUpload={handleFinanceUpload} color="bg-emerald-500" />
                </div>
              </div>
              {status && (
                <div className={`p-6 rounded-[2rem] font-bold text-[10px] uppercase text-white shadow-lg ${status.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
                  {status.msg}
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        /* ... Staff Approval UI (keep your existing code here) ... */
        <div className="text-center py-20 bg-white rounded-[3rem]">Staff Approval Logic Goes Here</div>
      )}
    </div>
  );
}

function UploadAction({ title, icon, isLoading, onUpload, color }: any) {
  return (
    <label className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl cursor-pointer hover:bg-white hover:shadow-md transition-all border-2 border-transparent hover:border-slate-100 group">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg ${color} group-hover:rotate-6 transition-transform`}>{icon}</div>
      <div className="flex-1 text-left">
        <p className="text-[10px] font-black uppercase text-slate-900">{title}</p>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{isLoading ? "Syncing..." : "Upload Excel"}</p>
      </div>
      {isLoading ? <Loader2 className="animate-spin text-slate-400" size={16}/> : <Upload className="text-slate-400" size={16}/>}
      <input type="file" className="hidden" onChange={onUpload} disabled={isLoading} />
    </label>
  );
}