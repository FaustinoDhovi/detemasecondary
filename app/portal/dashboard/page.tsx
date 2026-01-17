"use client";

import { TrendingUp, Wallet, Bell, Award, ArrowRight, CheckCircle2, ChevronRight, BookOpen, Clock } from 'lucide-react';
import Link from 'next/link';

export default function DashboardOverview() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* Dynamic Welcome Hero */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-[2.5rem] p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl shadow-blue-200">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> Term 1 Active
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4 italic">Welcome back, Tendai!</h1>
          <p className="text-blue-100 text-sm sm:text-lg font-medium leading-relaxed opacity-90">
            You are currently ranked <span className="text-white font-black">4th in your class</span>. 
            You have a Physics lab report due in 2 days. Ready to get started?
          </p>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-400/20 blur-[40px] rounded-full -ml-10 -mb-10" />
      </div>

      {/* Visual Analytics / Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Avg. Mark" value="84.5%" sub="A- Grade" icon={<TrendingUp className="text-blue-600" />} />
        <StatCard label="Attendance" value="98%" sub="Excellent" icon={<CheckCircle2 className="text-green-600" />} />
        <StatCard label="Assignments" value="2 Pending" sub="Due this week" icon={<Clock className="text-orange-500" />} />
        <StatCard label="Balance" value="$45.00" sub="Due Feb 15" icon={<Wallet className="text-red-500" />} />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left: Notices & Activity (From Sanity) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight">Academic Notices</h3>
              <Bell size={20} className="text-slate-300" />
            </div>
            
            <div className="space-y-3">
              <NoticeCard title="Mid-Term Consultation Day" date="Feb 05, 2026" category="Events" color="blue" />
              <NoticeCard title="New Biology Lab Equipment" date="Jan 28, 2026" category="Academic" color="green" />
              <NoticeCard title="Sports Inter-house Trials" date="Jan 20, 2026" category="Sports" color="purple" />
            </div>

            <button className="w-full mt-6 py-4 rounded-2xl border-2 border-slate-50 text-slate-400 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">
              View All Announcements
            </button>
          </div>
        </div>

        {/* Right: Quick Action Portal */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white">
            <h3 className="font-bold text-xl mb-6 italic tracking-tight">Quick Portal</h3>
            <div className="space-y-2">
              <PortalLink label="Download Report Card" href="/portal/dashboard/grades" />
              <PortalLink label="Pay Outstanding Fees" href="/portal/dashboard/fees" />
              <PortalLink label="View Class Schedule" href="/portal/dashboard/timetable" />
              <PortalLink label="Assignment Submission" href="/portal/dashboard/assignments" />
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4">Teacher Contact</h3>
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-black text-xs">AM</div>
              <div>
                <p className="text-xs font-black text-slate-900">Mrs. A. Moyo</p>
                <p className="text-[10px] font-bold text-slate-400">Class Teacher</p>
              </div>
              <button className="ml-auto p-2 text-blue-600 bg-white rounded-lg shadow-sm">
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// UI Components
function StatCard({ label, value, sub, icon }: any) {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:border-blue-500/20 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-slate-50 rounded-xl group-hover:scale-110 transition-transform">{icon}</div>
      </div>
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-black text-slate-900">{value}</p>
      <p className="text-[10px] font-bold text-slate-400 mt-1">{sub}</p>
    </div>
  );
}

function NoticeCard({ title, date, category, color }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group hover:bg-white hover:shadow-md hover:border-transparent border border-transparent transition-all cursor-pointer">
      <div className="flex gap-4 items-center">
        <div className={`w-1 h-8 rounded-full bg-${color}-500`} />
        <div>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">{category} • {date}</p>
          <p className="font-bold text-slate-900 text-sm">{title}</p>
        </div>
      </div>
      <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
    </div>
  );
}

function PortalLink({ label, href }: { label: string; href: string }) {
  return (
    <Link href={href} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 hover:border-blue-500/50 transition-all group">
      <span className="text-sm font-bold text-slate-300 group-hover:text-white">{label}</span>
      <ArrowRight size={16} className="text-slate-600 group-hover:text-blue-400" />
    </Link>
  );
}