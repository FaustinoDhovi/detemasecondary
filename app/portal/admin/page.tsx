"use client";
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import readXlsxFile from 'read-excel-file';
import { Upload, ClipboardList, Wallet, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

// Initialize Supabase with build-time safety
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder');

export default function AdminPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [status, setStatus] = useState<{type: 'success' | 'error', msg: string} | null>(null);

  const handleFinanceUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading('finance');
    setStatus(null);

    try {
      const sheets = await (readXlsxFile as any)(file, { getSheets: true });
      
      for (const sheet of sheets) {
        const rows = await readXlsxFile(file, { sheet: sheet.name });
        
        // Find the header row (the row that contains "NAME" or "STUDENT NUMBER")
        const headerRowIndex = rows.findIndex(row => 
          row.some(cell => cell?.toString().toUpperCase().includes("NAME"))
        );

        if (headerRowIndex === -1) continue;

        const headers = rows[headerRowIndex].map(h => h?.toString().toUpperCase().trim());
        const dataRows = rows.slice(headerRowIndex + 1);

        const students = dataRows.map((row: any) => {
          // Identify columns by name instead of fixed numbers
          const getVal = (name: string) => {
            const idx = headers.findIndex(h => h && h.includes(name));
            return idx !== -1 ? row[idx] : null;
          };

          const id = (getVal("STUDENT NUMBER") || getVal("ID"))?.toString().trim().toUpperCase();
          const name = getVal("NAME")?.toString().trim();
          
          if (!id || !name || id === "STUDENT NUMBER") return null;

          // Helper to clean numeric values (removes "BEAM", "CAMFED", etc)
          const cleanNum = (val: any) => {
            if (!val || typeof val === 'string') return 0;
            return Number(val) || 0;
          };

          return {
            id: id,
            name: name,
            student_class: getVal("CLASS")?.toString() || sheet.name.replace('FEES REGISTER', '').trim(),
            previous_balance: cleanNum(getVal("PREVIOUS BALANCE")),
            term_1_fees: cleanNum(getVal("TERM 3 2025")), // Mapping your specific sheet names
            term_1_paid: cleanNum(getVal("TERM 1 2026"))
          };
        }).filter(s => s !== null);

        if (students.length > 0) {
          const { error } = await supabase.from('student_ledger').upsert(students, { onConflict: 'id' });
          if (error) throw error;
        }
      }
      setStatus({ type: 'success', msg: "Finance Ledger updated successfully!" });
    } catch (err: any) {
      console.error(err);
      setStatus({ type: 'error', msg: "Finance Sync Failed: " + err.message });
    }
    setLoading(null);
  };

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
        
        // Logic for "Mr F Nyangari" style sheets (Title on Row 1, Headers on Row 3)
        const headerRow = rows[2] as any[]; 
        const dataRows = rows.slice(3); 
        
        const parts = sheet.name.split(' ');
        const year = parseInt(parts[parts.length - 1]) || 2025;
        const term = sheet.name.includes('Term 2') ? 2 : sheet.name.includes('Term 3') ? 3 : 1;
        const className = sheet.name.split('Term')[0].trim();

        const results = dataRows.map((row: any) => {
          if (!row[1]) return null; // Skip if no name

          const subjects: any = {};
          let grandTotal = 0;
          let position = "N/A";

          headerRow.forEach((header, idx) => {
            if (!header || idx < 3) return;
            const h = header.toString().toUpperCase();
            if (h.includes("TOTAL")) grandTotal = row[idx];
            else if (h.includes("POS")) position = row[idx]?.toString();
            else {
              const cleanH = h.toLowerCase().replace(/[^a-z0-9]/g, '_');
              subjects[cleanH] = row[idx];
            }
          });

          return {
            student_id: row[0]?.toString().toUpperCase().trim() || "UNKNOWN",
            teacher_name: teacherName,
            class_name: className,
            term: term,
            year: year,
            subjects: subjects,
            grand_total: grandTotal,
            position: position
          };
        }).filter(r => r !== null);

        await supabase.from('results').delete().eq('class_name', className).eq('term', term).eq('year', year);
        const { error } = await supabase.from('results').insert(results);
        if (error) throw error;
      }
      setStatus({ type: 'success', msg: "Mark Schedule synced successfully!" });
    } catch (err: any) {
      setStatus({ type: 'error', msg: "Mark Sync Failed." });
    }
    setLoading(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-5xl font-black italic uppercase tracking-tighter text-slate-900">
              Bursar <span className="text-blue-600">Terminal</span>
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-2">Detema Secondary Cloud v2.0</p>
          </div>
        </header>

        {status && (
          <div className={`p-6 rounded-[2rem] border flex items-center gap-4 animate-in fade-in slide-in-from-top-4 ${
            status.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'
          }`}>
            {status.type === 'success' ? <CheckCircle2 /> : <AlertCircle />}
            <span className="font-black uppercase text-xs tracking-widest">{status.msg}</span>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          <UploadCard 
            title="Fees Ledger" 
            icon={<Wallet size={32}/>}
            isLoading={loading === 'finance'}
            onUpload={handleFinanceUpload}
            color="bg-emerald-500"
          />
          <UploadCard 
            title="Mark Schedule" 
            icon={<ClipboardList size={32}/>}
            isLoading={loading === 'marks'}
            onUpload={handleMarkUpload}
            color="bg-blue-600"
          />
        </div>
      </div>
    </div>
  );
}

function UploadCard({ title, icon, isLoading, onUpload, color }: any) {
  return (
    <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 flex flex-col items-center text-center group hover:scale-[1.02] transition-transform">
      <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-white mb-8 shadow-2xl ${color} rotate-3 group-hover:rotate-0 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-2xl font-black italic uppercase text-slate-900 mb-2">{title}</h3>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-10">Upload Excel or CSV</p>
      
      <label className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] cursor-pointer flex items-center justify-center gap-3 hover:bg-blue-600 transition-colors shadow-lg">
        {isLoading ? <Loader2 className="animate-spin" size={18}/> : <Upload size={18}/>}
        {isLoading ? "Processing..." : "Select File"}
        <input type="file" className="hidden" onChange={onUpload} disabled={isLoading} accept=".xlsx,.csv" />
      </label>
    </div>
  );
}