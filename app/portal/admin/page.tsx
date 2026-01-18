"use client";
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import readXlsxFile from 'read-excel-file';
import { Upload, ShieldCheck, ClipboardList } from 'lucide-react';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function AdminPage() {
  const [loading, setLoading] = useState(false);

  const handleMarkUpload = async (e: any) => {
    const file = e.target.files[0];
    setLoading(true);
    try {
      const rows = await readXlsxFile(file);
      const headers = rows[2] as string[];
      const dataRows = rows.slice(3);
      const marks: any[] = [];
      dataRows.forEach((row: any) => {
        if (!row[1]) return;
        for (let i = 3; i < headers.length; i++) {
          if (headers[i] && !['GRAND TOTAL', 'POSITION'].includes(headers[i])) {
            const val = Number(row[i]) || 0;
            marks.push({
              student_id: row[0],
              student_name: row[1],
              subject: headers[i],
              mark: val,
              grade: val >= 75 ? 'A' : val >= 60 ? 'B' : val >= 50 ? 'C' : val >= 45 ? 'D' : val >= 40 ? 'E' : 'U'
            });
          }
        }
      });
      await supabase.from('student_marks').delete().neq('student_id', 'init');
      await supabase.from('student_marks').insert(marks);
      alert("Academic Data Synced!");
    } catch (err) { alert("Error processing file."); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-12">
      <h1 className="text-4xl font-black italic uppercase mb-12">Bursar Terminal</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl w-fit mb-6"><ClipboardList /></div>
          <h2 className="text-2xl font-black italic uppercase mb-2">Sync Academic Marks</h2>
          <p className="text-xs font-bold text-slate-400 uppercase italic mb-8">Upload "Mark Schedule" Excel file</p>
          <label className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] cursor-pointer flex items-center gap-2 w-fit">
            <Upload size={16} /> {loading ? "Syncing..." : "Upload Spreadsheet"}
            <input type="file" className="hidden" onChange={handleMarkUpload} />
          </label>
        </div>
      </div>
    </div>
  );
}