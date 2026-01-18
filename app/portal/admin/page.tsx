"use client";
export const dynamic = 'force-dynamic';
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import readXlsxFile from 'read-excel-file';
import { Upload, ClipboardList, Wallet, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co', 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
);

export default function AdminPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [status, setStatus] = useState<{type: 'success' | 'error', msg: string} | null>(null);

  const handleMarkUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading('marks');
    setStatus(null);

    try {
      const teacherName = file.name.split('.')[0].replace(/_/g, ' ');
      const sheets = await (readXlsxFile as any)(file, { getSheets: true });
      
      for (const sheet of sheets) {
        const rows = await readXlsxFile(file, { sheet: sheet.name });
        const headerRow = rows[2] as any[]; 
        const dataRows = rows.slice(3); 
        
        // Parse metadata from Sheet Name (e.g., "Form 4 South Term 2 2025")
        const parts = sheet.name.split(' ');
        const year = parseInt(parts[parts.length - 1]) || 2025;
        const term = sheet.name.toLowerCase().includes('term 2') ? 2 : sheet.name.toLowerCase().includes('term 3') ? 3 : 1;
        const className = sheet.name.split(/term/i)[0].trim();

        const results = dataRows.map((row: any) => {
          if (!row[0] || row[0] === 'No.') return null;

          const subjects: any = {};
          let grandTotal = 0;
          let position = 0;

          headerRow.forEach((header, idx) => {
            if (!header || idx < 3) return;
            const h = header.toString().toUpperCase().trim();
            
            if (h.includes("GRAND TOTAL") || h === "TOTAL") {
              grandTotal = parseInt(row[idx]) || 0;
            } else if (h.includes("POSITION") || h === "POS") {
              // Strip letters (e.g., "1st" becomes 1) for integer schema
              position = parseInt(row[idx]?.toString().replace(/\D/g, '')) || 0;
            } else {
              const cleanH = h.toLowerCase().replace(/[^a-z0-9]/g, '_');
              subjects[cleanH] = row[idx];
            }
          });

          return {
            student_id: row[0]?.toString().toUpperCase().trim(),
            term,
            year,
            subjects,
            grand_total: grandTotal,
            position: position,
            // Note: If you added these columns to Supabase:
            // class_name: className,
            // teacher_name: teacherName
          };
        }).filter(r => r !== null);

        // Upsert handles the unique constraint: student_id, term, year
        const { error } = await supabase.from('results').upsert(results, { 
          onConflict: 'student_id,term,year' 
        });
        if (error) throw error;
      }
      setStatus({ type: 'success', msg: "Mark Schedule synced to Database" });
    } catch (err: any) {
      setStatus({ type: 'error', msg: "Sync Failed: " + err.message });
    }
    setLoading(null);
  };

  const handleFinanceUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading('finance');
    setStatus(null);

    try {
      const sheets = await (readXlsxFile as any)(file, { getSheets: true });
      for (const sheet of sheets) {
        const rows = await readXlsxFile(file, { sheet: sheet.name });
        const hIdx = rows.findIndex(r => r.some(c => c?.toString().toUpperCase().includes("NAME")));
        if (hIdx === -1) continue;

        const headers = rows[hIdx].map(h => h?.toString().toUpperCase().trim());
        const dataRows = rows.slice(hIdx + 1);

        const students = dataRows.map((row: any) => {
          const get = (key: string) => {
            const i = headers.findIndex(h => h && h.includes(key));
            return i !== -1 ? row[i] : null;
          };

          const id = (get("ID") || get("STUDENT NUMBER"))?.toString().trim().toUpperCase();
          if (!id || id === "ID") return null;

          return {
            id,
            name: get("NAME"),
            student_class: get("CLASS") || sheet.name.replace('FEES REGISTER', '').trim(),
            previous_balance: Number(get("PREVIOUS")) || 0,
            term_1_fees: Number(get("TERM 3 2025")) || 0,
            term_1_paid: Number(get("TERM 1 2026")) || 0
          };
        }).filter(s => s !== null);

        await supabase.from('student_ledger').upsert(students, { onConflict: 'id' });
      }
      setStatus({ type: 'success', msg: "Finance Ledger updated" });
    } catch (err: any) {
      setStatus({ type: 'error', msg: "Finance Sync Error" });
    }
    setLoading(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto space-y-12">
        <header>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter text-slate-900">
            Bursar <span className="text-blue-600">Terminal</span>
          </h1>
          {status && (
            <div className={`mt-6 p-4 rounded-2xl flex items-center gap-3 font-bold text-xs uppercase tracking-widest ${
              status.type === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
            }`}>
              {status.type === 'success' ? <CheckCircle2 size={16}/> : <AlertCircle size={16}/>}
              {status.msg}
            </div>
          )}
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          <UploadCard title="Fees" icon={<Wallet />} isLoading={loading==='finance'} onUpload={handleFinanceUpload} color="bg-emerald-500" />
          <UploadCard title="Marks" icon={<ClipboardList />} isLoading={loading==='marks'} onUpload={handleMarkUpload} color="bg-blue-600" />
        </div>
      </div>
    </div>
  );
}

function UploadCard({ title, icon, isLoading, onUpload, color }: any) {
  return (
    <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 flex flex-col items-center">
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-6 ${color}`}>{icon}</div>
      <h3 className="text-xl font-black italic uppercase mb-8">{title}</h3>
      <label className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2">
        {isLoading ? <Loader2 className="animate-spin" size={14}/> : <Upload size={14}/>}
        {isLoading ? "Syncing..." : "Upload Spreadsheet"}
        <input type="file" className="hidden" onChange={onUpload} disabled={isLoading} />
      </label>
    </div>
  );
}