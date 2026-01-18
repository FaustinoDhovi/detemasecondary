"use client";
export const dynamic = 'force-dynamic';
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import readXlsxFile from 'read-excel-file';
import { Upload, ClipboardList, Wallet, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

// Initialize Supabase with safety fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder');

export default function AdminPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [status, setStatus] = useState<{type: 'success' | 'error', msg: string} | null>(null);

  /**
   * HANDLE FINANCE / LEDGER UPLOAD
   * Updates student profiles and fees. Handles the new DET-XXXX-XXX ID format.
   */
  const handleFinanceUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading('finance');
    setStatus(null);

    try {
      const sheets = await (readXlsxFile as any)(file, { getSheets: true });
      for (const sheet of sheets) {
        const rows = await readXlsxFile(file, { sheet: sheet.name });
        
        // Find header row containing "NAME" or "ID"
        const hIdx = rows.findIndex(r => r.some(c => c?.toString().toUpperCase().includes("NAME")));
        if (hIdx === -1) continue;

        const headers = rows[hIdx].map(h => h?.toString().toUpperCase().trim());
        const dataRows = rows.slice(hIdx + 1);
        const uniqueStudents = new Map();

        dataRows.forEach((row: any) => {
          const get = (key: string) => {
            const i = headers.findIndex(h => h && h.includes(key));
            return i !== -1 ? row[i] : null;
          };

          // Capture the new DET- format ID or Student Number
          const rawId = (get("ID") || get("STUDENT NUMBER"))?.toString().trim().toUpperCase();
          if (!rawId || rawId === "ID" || rawId === "") return;

          uniqueStudents.set(rawId, {
            id: rawId,
            name: get("NAME")?.toString().trim(),
            student_class: get("CLASS") || sheet.name.replace('FEES REGISTER', '').trim(),
            previous_balance: Number(get("PREVIOUS")) || 0,
            term_1_fees: Number(get("TERM 3 2025")) || 0,
            term_1_paid: Number(get("TERM 1 2026")) || 0
          });
        });

        const finalData = Array.from(uniqueStudents.values());
        if (finalData.length > 0) {
          const { error } = await supabase.from('student_ledger').upsert(finalData, { onConflict: 'id' });
          if (error) throw error;
        }
      }
      setStatus({ type: 'success', msg: "Student Ledger updated with new ID format (DET-)." });
    } catch (err: any) {
      setStatus({ type: 'error', msg: "Finance Sync Failed: " + err.message });
    }
    setLoading(null);
  };

  /**
   * HANDLE MARK SCHEDULE UPLOAD
   * Uses "Smart Name-Matching" to link marks to the new DET- IDs even if ID is missing.
   */
  const handleMarkUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading('marks');
    setStatus(null);

    try {
      // 1. Fetch Master Ledger to link Names to the new IDs
      const { data: studentsMaster } = await supabase.from('student_ledger').select('id, name');
      if (!studentsMaster || studentsMaster.length === 0) {
        throw new Error("Ledger is empty. Upload the Student Ledger first to register the new IDs.");
      }

      const sheets = await (readXlsxFile as any)(file, { getSheets: true });
      let skippedCount = 0;
      
      for (const sheet of sheets) {
        const rows = await readXlsxFile(file, { sheet: sheet.name });
        if (rows.length < 3) continue;

        const headerRow = rows[2] as any[]; 
        const dataRows = rows.slice(3); 
        
        const parts = sheet.name.split(' ');
        const year = parseInt(parts[parts.length - 1]) || 2026;
        const term = sheet.name.toLowerCase().includes('term 2') ? 2 : sheet.name.toLowerCase().includes('term 3') ? 3 : 1;

        const uniqueResults = new Map();

        dataRows.forEach((row: any) => {
          let studentId = row[0]?.toString().trim().toUpperCase();
          const spreadsheetName = row[1]?.toString().trim().toUpperCase() || "";

          if (!spreadsheetName) return;

          // Resolve ID: Check if spreadsheet ID exists, otherwise match by Name
          let finalId = null;
          const idExists = studentsMaster.find(s => s.id === studentId);
          
          if (idExists) {
            finalId = idExists.id;
          } else {
            // Smart Match: Find the DET- ID using the student name
            const nameMatch = studentsMaster.find(s => 
              s.name.toUpperCase().includes(spreadsheetName) || spreadsheetName.includes(s.name.toUpperCase())
            );
            if (nameMatch) finalId = nameMatch.id;
          }

          if (!finalId) {
            skippedCount++;
            return; // Skip to avoid Foreign Key error
          }

          const subjects: any = {};
          let grandTotal = 0;
          let position = 0;

          headerRow.forEach((header, idx) => {
            if (!header || idx < 3) return;
            const h = header.toString().toUpperCase().trim();
            if (h.includes("TOTAL")) grandTotal = parseInt(row[idx]) || 0;
            else if (h.includes("POS")) position = parseInt(row[idx]?.toString().replace(/\D/g, '')) || 0;
            else {
              const cleanH = h.toLowerCase().replace(/[^a-z0-9]/g, '_');
              subjects[cleanH] = row[idx];
            }
          });

          uniqueResults.set(`${finalId}-${term}-${year}`, {
            student_id: finalId,
            term,
            year,
            subjects,
            grand_total: grandTotal,
            position: position
          });
        });

        const finalBatch = Array.from(uniqueResults.values());
        if (finalBatch.length > 0) {
          const { error } = await supabase.from('results').upsert(finalBatch, { onConflict: 'student_id,term,year' });
          if (error) throw error;
        }
      }
      setStatus({ type: 'success', msg: `Marks Synced! ${skippedCount > 0 ? skippedCount + ' names skipped (not in ledger).' : ''}` });
    } catch (err: any) {
      setStatus({ type: 'error', msg: "Mark Sync Failed: " + err.message });
    }
    setLoading(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto space-y-12">
        <header>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-1 bg-blue-600"></div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">Detema Secondary School</p>
          </div>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">
            Bursar <span className="text-blue-600">Terminal</span>
          </h1>
          {status && (
            <div className={`mt-6 p-4 rounded-2xl flex items-center gap-3 font-bold text-xs uppercase tracking-widest border animate-in fade-in slide-in-from-top-1 ${
              status.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'
            }`}>
              {status.type === 'success' ? <CheckCircle2 size={16}/> : <AlertCircle size={16}/>}
              {status.msg}
            </div>
          )}
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          <UploadCard 
            title="Update Ledger" 
            subtitle="New ID format (DET-)"
            icon={<Wallet size={28}/>} 
            isLoading={loading==='finance'} 
            onUpload={handleFinanceUpload} 
            color="bg-emerald-500" 
          />
          <UploadCard 
            title="Sync Marks" 
            subtitle="Academic Results"
            icon={<ClipboardList size={28}/>} 
            isLoading={loading==='marks'} 
            onUpload={handleMarkUpload} 
            color="bg-blue-600" 
          />
        </div>

        <footer className="pt-12 border-t border-slate-200 text-center">
           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em]">
             Authorized Admin Access • Detema Cloud v2.3
           </p>
        </footer>
      </div>
    </div>
  );
}

function UploadCard({ title, subtitle, icon, isLoading, onUpload, color }: any) {
  return (
    <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 flex flex-col items-center group transition-all hover:scale-[1.02]">
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg ${color} rotate-2 group-hover:rotate-0 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-xl font-black italic uppercase text-slate-900 leading-tight">{title}</h3>
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-8">{subtitle}</p>
      
      <label className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors shadow-lg active:scale-95">
        {isLoading ? <Loader2 className="animate-spin" size={14}/> : <Upload size={14}/>}
        {isLoading ? "Processing..." : "Choose File"}
        <input type="file" className="hidden" onChange={onUpload} disabled={isLoading} accept=".xlsx,.csv" />
      </label>
    </div>
  );
}