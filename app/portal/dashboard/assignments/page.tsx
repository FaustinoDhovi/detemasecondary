"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { FileText, Clock, Calendar, UploadCloud, AlertCircle } from 'lucide-react';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function AssignmentsPage() {
  const [tasks, setTasks] = useState([]);
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem('portalSession') || '{}');
    const s = session.student;
    setStudent(s);
    if (s?.student_class) {
      fetchAssignments(s.student_class);
    }
  }, []);

  async function fetchAssignments(studentClass: string) {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('target_class', studentClass)
      .order('due_date', { ascending: true });
    
    if (data) setTasks(data as any);
    setLoading(false);
  }

  if (loading) return <div className="p-20 text-center font-black italic text-slate-400 animate-pulse uppercase">Syncing Class Tasks...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 italic uppercase tracking-tighter">Assignments</h1>
          <p className="text-blue-600 font-black text-[10px] uppercase tracking-[0.3em] mt-2">Class: {student?.student_class}</p>
        </div>
      </div>

      <div className="grid gap-4">
        {tasks.map((task: any, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-blue-500 transition-all group">
            <div className="flex items-start gap-6">
              <div className="p-5 rounded-3xl bg-slate-50 text-slate-900 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <FileText size={28} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest mb-1">{task.subject}</p>
                <h3 className="font-black text-slate-900 text-xl italic uppercase tracking-tight">{task.title}</h3>
                <div className="flex items-center gap-4 mt-2">
                   <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                     <Clock size={12} /> Deadline: {task.due_date}
                   </span>
                </div>
              </div>
            </div>
            <button className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-2">
              <UploadCloud size={16} /> Upload Work
            </button>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="p-20 text-center border-2 border-dashed border-slate-100 rounded-[3rem]">
            <p className="text-slate-400 font-black italic uppercase text-xs">No assignments uploaded by teachers yet</p>
          </div>
        )}
      </div>
    </div>
  );
}