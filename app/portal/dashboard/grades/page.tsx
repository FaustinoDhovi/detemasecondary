"use client";

import { Award, TrendingUp, BookOpen, Download, Star } from 'lucide-react';

export default function GradesPage() {
  const subjects = [
    { name: "Mathematics", grade: "A", mark: 88, effort: "Excellent", teacher: "Mr. Phiri" },
    { name: "English Literature", grade: "B", mark: 72, effort: "Good", teacher: "Mrs. Moyo" },
    { name: "Integrated Science", grade: "A", mark: 91, effort: "Exceptional", teacher: "Mr. Dube" },
    { name: "History", grade: "C", mark: 58, effort: "Satisfactory", teacher: "Ms. Sibanda" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Academic Progress</h1>
          <p className="text-slate-500 font-medium">Detailed subject performance for Term 1</p>
        </div>
        <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-slate-800 transition-all">
          <Download size={18} /> Print Report Card
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <tr>
                  <th className="px-8 py-5">Subject</th>
                  <th className="px-8 py-5">Grade</th>
                  <th className="px-8 py-5">Percentage</th>
                  <th className="px-8 py-5 hidden sm:table-cell">Teacher</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-bold">
                {subjects.map((sub, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-8 py-6">
                      <p className="text-sm text-slate-900">{sub.name}</p>
                      <p className="text-[10px] text-blue-600 uppercase tracking-tighter">{sub.effort}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`text-xl font-black ${sub.grade === 'A' ? 'text-green-600' : 'text-blue-600'}`}>{sub.grade}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden max-w-[100px]">
                        <div className="bg-blue-600 h-full rounded-full" style={{ width: `${sub.mark}%` }} />
                      </div>
                      <span className="text-xs text-slate-400">{sub.mark}%</span>
                    </td>
                    <td className="px-8 py-6 text-sm text-slate-500 hidden sm:table-cell">{sub.teacher}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-200">
            <Star className="text-blue-200 mb-4" size={32} />
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Class Rank</p>
            <p className="text-4xl font-black">4th / 32</p>
            <p className="text-xs font-medium mt-4 opacity-80 leading-relaxed">You are in the top 15% of your grade. Keep it up!</p>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <TrendingUp className="text-green-500 mb-4" size={32} />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">GPA Trend</p>
            <p className="text-2xl font-black text-slate-900">+0.4 Increase</p>
          </div>
        </div>
      </div>
    </div>
  );
}