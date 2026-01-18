"use client";
export const dynamic = 'force-dynamic';
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import readXlsxFile from 'read-excel-file';
import { Upload, ClipboardList, Wallet, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '', 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function AdminPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [status, setStatus] = useState<{type: 'success' | 'error', msg: string} | null>(null);

  // 1. LEDGER UPLOAD (Master List)
  const handleFinanceUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading('finance');
    setStatus(null);

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
          if (!id || id.length < 5) return null;

          return {
            id,
            name: get(["NAME"]),
            student_class: sheet.name.replace('FEES REGISTER', '').trim(),
            parent_number: get(["PARENT NUMBER"]),
            previous_balance: get(["PREVIOUS BALANCE", "BAL B/F"]),
            term_3_2025: get(["TERM 3"]),
            term_1_2026: get(["2026 TERM 1", "2026 TERM1", "TERM 1 2026"])
          };
        }).filter(Boolean);

        if (batch.length > 0) {
          const { error } = await supabase.from('student_ledger').upsert(batch, { onConflict: 'id' });
          if (error) throw error;
        }
      }
      setStatus({ type: 'success', msg: "Ledger Synced! New DET- IDs & Donor info ready." });
    } catch (err: any) {
      setStatus({ type: 'error', msg: "Finance Sync Error: " + err.message });
    }
    setLoading(null);
  };

  // 2. MARK SCHEDULE UPLOAD (With Fuzzy Name Matching)
  const handleMarkUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading('marks');
    setStatus(null);

    try {
      // Fetch Master Ledger to find student IDs by name
      const { data: master } = await supabase.from('student_ledger').select('id, name');
      if (!master || master.length === 0) throw new Error("Please upload the Ledger FIRST to register students.");

      const rows = await readXlsxFile(file);
      // Headers are on Row 3 (Index 2)
      const headers = (rows[2] as any[]).map(h => h?.toString().toUpperCase().trim());
      const dataRows = rows.slice(3);
      const resultsBatch = [];
      let missingCount = 0;

      for (const row of dataRows) {
        const surname = row[1]?.toString().trim() || "";
        const firstName = row[2]?.toString().trim() || "";
        if (!surname && !firstName) continue;

        // MATCHING LOGIC: Combine names and compare against ledger
        const student = master.find(s => {
          const mName = s.name.toUpperCase();
          const sur = surname.toUpperCase();
          const fir = firstName.toUpperCase();
          return (mName.includes(sur) && mName.includes(fir));
        });

        if (!student) {
          missingCount++;
          continue;
        }

        // Parse Subjects
        const subjects: any = {};
        headers.forEach((h, i) => {
          if (i > 2 && h && h !== "GRAND TOTAL" && h !== "POSITION" && row[i] !== null) {
            subjects[h.toLowerCase()] = row[i];
          }
        });

        resultsBatch.push({
          student_id: student.id,
          term: 2, // From your specific file: Term 2 2025
          year: 2025,
          subjects,
          grand_total: row[headers.indexOf("GRAND TOTAL")],
          position: row[headers.indexOf("POSITION")]
        });
      }

      if (resultsBatch.length > 0) {
        const { error } = await supabase.from('results').upsert(resultsBatch, { onConflict: 'student_id,term,year' });
        if (error) throw error;
        setStatus({ 
          type: 'success', 
          msg: `Synced ${resultsBatch.length} students! (Note: ${missingCount} names didn't match and were skipped)` 
        });
      } else {
        throw new Error("Zero matches found. Check if Ledger names match Mark Schedule names.");
      }
    } catch (err: any) {
      setStatus({ type: 'error', msg: "Mark Sync Error: " + err.message });
    }
    setLoading(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto space-y-12">
        <header>
          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.4em] mb-2">Detema Secondary School</p>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">
            Bursar <span className="text-blue-600">Terminal</span>
          </h1>
          {status && (
            <div className={`mt-6 p-4 rounded-2xl flex items-center gap-3 font-bold text-xs uppercase tracking-widest border ${
              status.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'
            }`}>
              {status.type === 'success' ? <CheckCircle2 size={16}/> : <AlertCircle size={16}/>}
              {status.msg}
            </div>
          )}
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          <UploadCard title="1. Finance" subtitle="Ledger & Donors" icon={<Wallet />} isLoading={loading==='finance'} onUpload={handleFinanceUpload} color="bg-emerald-500" />
          <UploadCard title="2. Academics" subtitle="Mark Schedules" icon={<ClipboardList />} isLoading={loading==='marks'} onUpload={handleMarkUpload} color="bg-blue-600" />
        </div>
      </div>
    </div>
  );
}

function UploadCard({ title, subtitle, icon, isLoading, onUpload, color }: any) {
  return (
    <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 flex flex-col items-center">
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg ${color}`}>{icon}</div>
      <h3 className="text-xl font-black italic uppercase text-slate-900">{title}</h3>
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-8">{subtitle}</p>
      <label className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors">
        {isLoading ? <Loader2 className="animate-spin" size={14}/> : <Upload size={14}/>}
        {isLoading ? "Syncing..." : "Choose File"}
        <input type="file" className="hidden" onChange={onUpload} disabled={isLoading} />
      </label>
    </div>
  );
}