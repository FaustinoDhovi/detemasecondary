"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Calendar, Clock, MapPin } from 'lucide-react';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function TimetablePage() {
  const [schedule, setSchedule] = useState<any>([]);
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem('portalSession') || '{}');
    const s = session.student;
    setStudent(s);
    if (s?.student_class) {
      fetchTimetable(s.student_class);
    }
  }, []);

  async function fetchTimetable(studentClass: string) {
    const { data } = await supabase
      .from('timetables')
      .select('*')
      .eq('target_class', studentClass)
      .order('start_time', { ascending: true });
    
    if (data) setSchedule(data);
    setLoading(false);
  }

  if (loading) return <div className="p-20 text-center font-black italic text-slate-400 animate-pulse uppercase">Syncing Weekly Schedule...</div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div>
        <h1 className="text-4xl font-black text-slate-900 italic uppercase tracking-tighter">School Timetable</h1>
        <p className="text-blue-600 font-black text-[10px] uppercase tracking-[0.3em] mt-2">Viewing: {student?.student_class}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {days.map((day) => (
          <div key={day} className="space-y-4">
            <div className="bg-slate-900 text-white p-4 rounded-2xl text-center shadow-lg">
              <p className="text-[10px] font-black uppercase tracking-widest italic">{day}</p>
            </div>
            
            <div className="space-y-3">
              {schedule.filter((item: any) => item.day === day).map((slot: any, idx: number) => (
                <div key={idx} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm hover:border-blue-500 transition-all">
                  <p className="text-[10px] font-black text-blue-600 uppercase mb-1">{slot.subject}</p>
                  <p className="font-bold text-slate-900 leading-tight">{slot.topic || 'Regular Lesson'}</p>
                  <div className="mt-3 space-y-1">
                    <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase">
                      <Clock size={10} /> {slot.start_time} - {slot.end_time}
                    </div>
                  </div>
                </div>
              ))}
              {schedule.filter((item: any) => item.day === day).length === 0 && (
                <div className="h-24 rounded-[2rem] border border-dashed border-slate-100 flex items-center justify-center">
                  <span className="text-[9px] font-black text-slate-300 uppercase italic">No Lessons</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}