"use client";
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import readXlsxFile from 'read-excel-file';
import { Upload, ClipboardList, Wallet, Calendar, Loader2, CheckCircle2 } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminPage() {
  const [loading, setLoading] = useState<string | null>(null);

  // 1. SYNC ACADEMIC MARKS (Results Table)
  const handleMarkUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading('marks');
    try {
      const teacherName = file.name.split('.')[0].replace(/_/g, ' ');
      const sheets = await (readXlsxFile as any)(file, { getSheets: true });
      
      for (let i = 0; i < sheets.length; i++) {
        const sheet = sheets[i];
        const parts = sheet.name.split(' ');
        const year = parseInt(parts[parts.length - 1]);
        const termIndex = parts.indexOf('Term');
        const term = termIndex !== -1 ? parseInt(parts[termIndex + 1]) : 1;
        const className = sheet.name.split('Term')[0].trim();

        const rows = await readXlsxFile(file, { sheet: sheet.name });
        const headers = rows[2] as any[]; 
        const dataRows = rows.slice(3); 

        const results = dataRows.map((row: any) => {
          if (!row[0]) return null; 
          const subjects: any = {};
          let grandTotal = 0;
          let position = "N/A";

          headers.forEach((header, index) => {
            if (header && index > 1) { 
              const cleanHeader = header.toString().toUpperCase().trim();
              if (['TOTAL', 'GRAND TOTAL', 'G.TOTAL'].includes(cleanHeader)) {
                grandTotal = row[index];
              } else if (['POS', 'POSITION', 'RANK'].includes(cleanHeader)) {
                position = row[index]?.toString();
              } else {
                subjects[header.toString().toLowerCase().replace(/ /g, '_')] = row[index];
              }
            }
          });

          return {
            student_id: row[0]?.toString().toUpperCase().trim(),
            teacher_name: teacherName,
            class_name: className,
            term: term || 1,
            year: year || 2026,
            subjects: subjects,
            grand_total: grandTotal,
            position: position
          };
        }).filter(r => r !== null);

        await supabase.from('results').delete().eq('class_name', className).eq('term', term).eq('year', year);
        const { error } = await supabase.from('results').insert(results);
        if (error) throw error;
      }
      alert(`Successfully generated reports for ${teacherName}`);
    } catch (err) {
      alert("Error processing Mark Schedule.");
    }
    setLoading(null);
  };

  // 2. SYNC FINANCIAL LEDGER (Matches your FEES REGISTER Excel)
  const handleFinanceUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading('finance');

    try {
      const sheets = await (readXlsxFile as any)(file, { getSheets: true });
      
      for (let i = 0; i < sheets.length; i++) {
        const sheet = sheets[i];
        const rows = await readXlsxFile(file, { sheet: sheet.name });
        
        // Row 2 (index 1) contains the Headers: NAME, STUDENT NUMBER, etc.
        // Data starts from Row 3 (index 2)
        const dataRows = rows.slice(2);

        const students = dataRows.map((row: any) => {
          if (!row[1]) return null; // Skip if no Student Number

          // Helper to clean numeric values (handles "BEAM", "CAMFED", or empty cells)
          const cleanNum = (val: any) => {
            if (!val || typeof val === 'string') return 0;
            return Number(val) || 0;
          };

          return {
            id: row[1]?.toString().toUpperCase().trim(), // STUDENT NUMBER
            name: row[0]?.toString().trim(),            // NAME
            student_class: sheet.name.replace('FEES REGISTER', '').trim(), 
            previous_balance: cleanNum(row[3]),          // PREVIOUS BALANCE
            term_1_fees: cleanNum(row[4]),               // TERM 3 / Current Fees
            term_1_paid: cleanNum(row[5])                // 2026 term1 / Paid
          };
        }).filter(s => s !== null);

        const { error } = await supabase.from('student_ledger').upsert(students, { onConflict: 'id' });
        if (error) throw error;
      }
      alert("Financial Ledger Updated Successfully across all sheets!");
    } catch (err) {
      console.error(err);
      alert("Finance Upload Error: Ensure the Excel follows the 'NAME, STUDENT NUMBER, PREVIOUS BALANCE' format.");
    }
    setLoading(null);
  };

  // 3. SYNC TIMETABLE
  const handleTimetableUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading('timetable');
    try {
      const rows = await readXlsxFile(file);
      const timetableData = rows.slice(1).map((row: any) => ({
        class_name: row[0]?.toString().trim(),
        day: row[1],
        period_1: row[2],
        period_2: row[3],
        period_3: row[4],
        period_4: row[5],
        period_5: row[6],
        search_slug: row[0]?.toString().toLowerCase().replace(/ /g, '')
      }));
      await supabase.from('timetables').delete().neq('id', 0);
      await supabase.from('timetables').insert(timetableData);
      alert("Timetables Published!");
    } catch (err) {
      alert("Timetable Error.");
    }
    setLoading(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-12">
        <header>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter text-slate-900">
            Bursar <span className="text-blue-600">Terminal</span>
          </h1>
          <p className="text-xs font-black uppercase text-slate-400 tracking-[0.4em] mt-2">
            Central Management System • Detema Cloud v2.0
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-6">
          <AdminCard 
            title="Finance Ledger" 
            desc="Sync Fees Register Excel"
            icon={<Wallet />}
            isLoading={loading === 'finance'}
            onUpload={handleFinanceUpload}
            color="bg-emerald-500"
          />
          <AdminCard 
            title="Mark Schedules" 
            desc="Auto-Generate Reports"
            icon={<ClipboardList />}
            isLoading={loading === 'marks'}
            onUpload={handleMarkUpload}
            color="bg-blue-600"
          />
          <AdminCard 
            title="Timetables" 
            desc="Publish Schedules"
            icon={<Calendar />}
            isLoading={loading === 'timetable'}
            onUpload={handleTimetableUpload}
            color="bg-purple-600"
          />
        </div>
      </div>
    </div>
  );
}

function AdminCard({ title, desc, icon, isLoading, onUpload, color }: any) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col justify-between group transition-all hover:-translate-y-1">
      <div>
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg ${color}`}>
          {icon}
        </div>
        <h3 className="text-xl font-black italic uppercase text-slate-900">{title}</h3>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{desc}</p>
      </div>
      <label className="mt-8 bg-slate-900 text-white p-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] cursor-pointer flex items-center justify-center gap-3 hover:bg-slate-800 transition-all">
        {isLoading ? <Loader2 className="animate-spin" size={16}/> : <Upload size={16}/>}
        {isLoading ? "Processing..." : "Sync Spreadsheet"}
        <input type="file" className="hidden" onChange={onUpload} disabled={isLoading} />
      </label>
    </div>
  );
}