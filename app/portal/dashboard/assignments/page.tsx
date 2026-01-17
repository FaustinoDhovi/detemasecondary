"use client";

import { FileText, Clock, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';

export default function AssignmentsPage() {
  const tasks = [
    { subject: "Mathematics", title: "Quadratic Equations Set B", due: "Tomorrow", status: "Pending", priority: "High" },
    { subject: "History", title: "The Great Depression Essay", due: "Jan 25", status: "Submitted", priority: "Medium" },
    { subject: "Physics", title: "Thermodynamics Lab Report", due: "Feb 02", status: "Pending", priority: "Low" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Assignments</h1>
        <p className="text-slate-500 font-medium">Track your upcoming tasks and submissions</p>
      </div>

      <div className="grid gap-4">
        {tasks.map((task, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-blue-200 transition-all">
            <div className="flex items-start gap-4">
              <div className={`p-4 rounded-2xl ${task.status === 'Submitted' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                <FileText size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest">{task.subject}</p>
                <h3 className="font-bold text-slate-900 text-lg">{task.title}</h3>
                <div className="flex items-center gap-3 mt-1">
                   <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                     <Calendar size={12} /> Due: {task.due}
                   </span>
                   <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase ${
                     task.priority === 'High' ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-500'
                   }`}>
                     {task.priority} Priority
                   </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {task.status === 'Submitted' ? (
                <div className="flex items-center gap-2 text-green-600 font-black text-xs uppercase">
                  <CheckCircle2 size={16} /> Submitted
                </div>
              ) : (
                <button className="w-full sm:w-auto bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-blue-600 transition-all">
                  Upload Work
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}