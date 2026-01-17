"use client";

import { Clock, MapPin, Calendar as CalendarIcon } from 'lucide-react';

export default function TimetablePage() {
  const schedule = [
    { time: "08:00 - 09:00", subject: "Mathematics", room: "Lab 2", tutor: "Mr. Phiri" },
    { time: "09:00 - 10:00", subject: "English", room: "Room 4A", tutor: "Mrs. Moyo" },
    { time: "10:30 - 11:30", subject: "Physics", room: "Lab 1", tutor: "Mr. Dube" },
    { time: "11:30 - 12:30", subject: "History", room: "Room 2", tutor: "Ms. Sibanda" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Timetable</h1>
          <p className="text-slate-500 font-medium">Monday, Jan 19, 2026</p>
        </div>
        <div className="flex bg-white p-1 rounded-xl border border-slate-100 shadow-sm">
           <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-widest">Today</button>
           <button className="px-4 py-2 text-slate-400 text-xs font-bold uppercase tracking-widest">Week</button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <tr>
                <th className="px-8 py-5">Time</th>
                <th className="px-8 py-5">Subject / Tutor</th>
                <th className="px-8 py-5">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-medium">
              {schedule.map((item, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-slate-900 font-black text-sm">
                      <Clock size={14} className="text-blue-600" /> {item.time}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm text-slate-900 font-bold">{item.subject}</p>
                    <p className="text-[10px] text-slate-400 uppercase">{item.tutor}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
                      <MapPin size={14} /> {item.room}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}