"use client";
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import readXlsxFile from 'read-excel-file';
import { 
  Upload, ClipboardList, Wallet, Loader2, CheckCircle2, 
  Users, Search, DollarSign, ShieldAlert, FileText, UserCheck, XCircle 
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '', 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

/**
 * PASTE YOUR ENTIRE BASE64 LOGO STRING BETWEEN THE QUOTES BELOW
 */
const SCHOOL_LOGO_BASE64 = "PASTE_YOUR_BASE64_CODE_HERE";

export default function AdminPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [pendingStaff, setPendingStaff] = useState<any[]>([]);
  const [view, setView] = useState<'finance' | 'staff'>('finance');
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [status, setStatus] = useState<{type: 'success' | 'error', msg: string} | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    // 1. Fetch Students for Financial Dashboard
    const { data: stdData } = await supabase.from('student_ledger').select('*').order('name', { ascending: true });
    if (stdData) setStudents(stdData);

    // 2. Fetch Unapproved Staff for Approval Queue
    const { data: stfData } = await supabase.from('staff_profiles').select('*').eq('is_approved', false);
    if (stfData) setPendingStaff(stfData);
  }

  const approveStaff = async (id: string) => {
    setLoading('approving');
    const { error } = await supabase.from('staff_profiles').update({ is_approved: true }).eq('id', id);
    if (!error) {
      setStatus({ type: 'success', msg: "Staff Member Approved!" });
      fetchData(); // Refresh the list after approval
    } else {
      setStatus({ type: 'error', msg: "Approval failed." });
    }
    setLoading(null);
  };

  // FINANCE CALCULATIONS
  const stats = students.reduce((acc, s) => {
    const bal = (Number(s.previous_balance) || 0) + (Number(s.term_1_2026) || 0);
    acc.totalOwed += bal;
    if (bal > 50) acc.lockedCount += 1;
    return acc;
  }, { totalOwed: 0, lockedCount: 0 });

  const filteredStudents = students.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // PDF DEBT REPORT GENERATOR
  const generateDebtReport = () => {
    const doc = new jsPDF();
    doc.setFillColor(15, 23, 42); 
    doc.rect(0, 0, 210, 40, 'F');
    
    if (SCHOOL_LOGO_BASE64.length > 100) {
        try {
            const imageType = SCHOOL_LOGO_BASE64.startsWith('data:image/jpeg') ? 'JPEG' : 'PNG';
            doc.addImage(SCHOOL_LOGO_BASE64, imageType, 15, 5, 25, 25);
        } catch (e) { console.error("Logo failed", e); }
    }

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text("DETEMA SECONDARY SCHOOL", 105, 18, { align: "center" });
    doc.setFontSize(10);
    doc.text("MASTER DEBTOR LIST - 2026 TERM 1", 105, 26, { align: "center" });

    const tableData = students.map(s => {
      const bal = (Number(s.previous_balance) || 0) + (Number(s.term_1_2026) || 0);
      return [s.id, s.name, s.student_class, `$${bal.toFixed(2)}`, bal > 50 ? 'LOCKED' : 'ACTIVE'];
    });

    autoTable(doc, {
      startY: 45,
      head: [['ID', 'STUDENT NAME', 'CLASS', 'TOTAL OWING', 'PORTAL']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [30, 41, 59] },
      didParseCell: (data) => {
        if (data.column.index === 3 && data.cell.text[0].includes('$')) {
            const val = parseFloat(data.cell.text[0].replace('$', ''));
            if (val > 50) data.cell.styles.textColor = [220, 38, 38];
        }
      }
    });
    doc.save(`Debt_Report_${new Date().toLocaleDateString()}.pdf`);
  };

  const handleFinanceUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading('finance');
    try {
      const sheets = await (readXlsxFile as any)(file, { getSheets: true });
      for (const sheet of sheets) {
        const rows = await readXlsxFile(file, { sheet: sheet.name });
        const hIdx = rows.findIndex(r => r.some(c => c?.toString().toUpperCase().includes("STUDENT NUMBER")));
        if (hIdx === -1) continue;
        const headers = rows[hIdx].map(h => h?.toString().toUpperCase().trim());
        const dataRows = rows.slice(hIdx + 1);
        const batch = dataRows.map(row => {
          const get = (keys: string[]) => {
            const i = headers.findIndex(h => h && keys.some(k => h.includes(k)));
            return i !== -1 ? row[i]?.toString().trim() : null;
          };
          const id = get(["STUDENT NUMBER", "ID"]);
          if (!id) return null;
          return {
            id,
            name: get(["NAME"]),
            student_class: sheet.name.replace('FEES REGISTER', '').trim(),
            previous_balance: get(["PREVIOUS BALANCE", "BAL B/F"]),
            term_1_2026: get(["2026 TERM 1", "TERM 1 2026"])
          };
        }).filter(Boolean);
        if (batch.length > 0) await supabase.from('student_ledger').upsert(batch, { onConflict: 'id' });
      }
      setStatus({ type: 'success', msg: "Finance Ledger Synced!" });
      fetchData();
    } catch (err: any) { setStatus({ type: 'error', msg: err.message }); }
    setLoading(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans space-y-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-1">Detema Secondary School</p>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">Admin <span className="text-blue-600">Terminal</span></h1>
          
          <div className="flex gap-4 mt-6">
            <button 
              onClick={() => setView('finance')}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'finance' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-200'}`}
            >
              Financial Dashboard
            </button>
            <button 
              onClick={() => setView('staff')}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative ${view === 'staff' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-200'}`}
            >
              Staff Approvals
              {pendingStaff.length > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-[8px] font-black animate-pulse">
                  {pendingStaff.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {view === 'finance' && (
          <button 
            onClick={generateDebtReport}
            className="bg-white border-2 border-slate-900 text-slate-900 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
          >
            <FileText size={14} /> Generate Debt Report
          </button>
        )}
      </header>

      {view === 'finance' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-500">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
              <DollarSign className="text-white/10 absolute -right-4 -bottom-4" size={100} />
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Total School Debt</p>
              <h2 className="text-4xl font-black italic mt-1">${stats.totalOwed.toLocaleString()}</h2>
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
              <div className="p-8 border-b border-slate-100 flex justify-between items-center gap-4 bg-slate-50/50">
                <h3 className="font-black uppercase italic text-sm tracking-tight">Student Ledger</h3>
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search name or ID..."
                    className="w-full pl-10 pr-4 py-3 bg-white border-none rounded-xl text-xs font-bold shadow-inner"
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="max-h-[600px] overflow-y-auto">
                <table className="w-full text-left">
                  <thead className="sticky top-0 bg-white text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
                    <tr>
                      <th className="p-6">Student Details</th>
                      <th className="p-6">Class</th>
                      <th className="p-6">Balance</th>
                      <th className="p-6">Access</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredStudents.map(s => {
                      const bal = (Number(s.previous_balance) || 0) + (Number(s.term_1_2026) || 0);
                      return (
                        <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-6">
                            <p className="font-black text-slate-900 uppercase text-xs">{s.name}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{s.id}</p>
                          </td>
                          <td className="p-6 text-[10px] font-black text-slate-500 uppercase">{s.student_class || 'N/A'}</td>
                          <td className="p-6 font-black text-xs text-slate-900">${bal.toFixed(2)}</td>
                          <td className="p-6">
                            {bal > 50 ? (
                              <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-[9px] font-black uppercase border border-red-100">Locked</span>
                            ) : (
                              <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[9px] font-black uppercase border border-emerald-100">Active</span>
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
                <h3 className="text-xs font-black uppercase italic mb-6 text-slate-400">Data Sync Center</h3>
                <div className="space-y-4">
                    <UploadAction title="Finance Ledger" icon={<Wallet />} isLoading={loading==='finance'} onUpload={handleFinanceUpload} color="bg-emerald-500" />
                    <UploadAction title="Academic Marks" icon={<ClipboardList />} isLoading={loading==='marks'} onUpload={() => {}} color="bg-blue-600" />
                </div>
              </div>
              {status && (
                <div className={`p-6 rounded-[2rem] font-bold text-[10px] uppercase tracking-widest border shadow-lg animate-in slide-in-from-bottom-4 duration-500 ${status.type === 'success' ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-red-600 border-red-400 text-white'}`}>
                  {status.msg}
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-[3rem] border border-slate-200 shadow-xl overflow-hidden animate-in slide-in-from-bottom-8 duration-700">
          <div className="p-10 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <div>
              <h3 className="font-black uppercase italic text-xl">Staff Approval Queue</h3>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Verify teacher identities before granting system access</p>
            </div>
            <Users size={32} className="text-slate-200" />
          </div>
          
          <div className="p-10">
            {pendingStaff.length === 0 ? (
              <div className="py-20 text-center">
                <CheckCircle2 size={48} className="mx-auto text-emerald-100 mb-4" />
                <p className="text-slate-300 font-black uppercase italic text-sm tracking-widest">No pending staff registrations</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {pendingStaff.map(staff => (
                  <div key={staff.id} className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-blue-500 transition-all">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-black text-2xl uppercase italic shadow-lg">
                        {staff.full_name ? staff.full_name[0] : 'T'}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 uppercase text-lg leading-tight">{staff.full_name}</p>
                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em] mt-1">
                          {staff.role} • {staff.subject_taught}
                        </p>
                        {staff.is_class_teacher_of && (
                           <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Class Teacher: {staff.is_class_teacher_of}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <button 
                        onClick={() => approveStaff(staff.id)}
                        disabled={loading === 'approving'}
                        className="flex-1 md:flex-none bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all shadow-md active:scale-95"
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
    <label className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl cursor-pointer hover:bg-white hover:shadow-md hover:scale-[1.02] transition-all border-2 border-transparent hover:border-slate-100">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg ${color}`}>{icon}</div>
      <div className="flex-1">
        <p className="text-[10px] font-black uppercase text-slate-900">{title}</p>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{isLoading ? "Syncing..." : "Upload Excel"}</p>
      </div>
      {isLoading ? <Loader2 className="animate-spin text-slate-400" size={16}/> : <Upload className="text-slate-400" size={16}/>}
      <input type="file" className="hidden" onChange={onUpload} disabled={isLoading} />
    </label>
  );
}