"use client";
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import { Wallet, Award, ArrowRight, ShieldCheck, GraduationCap, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function DashboardOverview() {
  const [student, setStudent] = useState<any>(null);

  useEffect(() => {
    const session = localStorage.getItem('portalSession');
    if (session) {
      setStudent(JSON.parse(session).student);
    }
  }, []);

  if (!student) return null;

  // --- LOGIC ---
  const idString = student.id.toString();
  const idYear = parseInt(idString.substring(0, 4));
  const isEnrolled = idYear >= 2023 && idYear <= 2026;
  const completionYear = idYear + 3;

  // --- DATA CLEANING FOR MIXED VALUES (Numbers & Text) ---
  const rawBalance = student.balance;
  let displayBalance: string;
  let isRestricted = false;

  // Check if balance is text (like BEAM, SOLON, etc.)
  if (typeof rawBalance === 'string' && isNaN(Number(rawBalance))) {
    displayBalance = rawBalance.toUpperCase();
    isRestricted = false; // Usually students on schemes have access
  } else {
    // If it's a number, format it properly
    const numericValue = Number(rawBalance || 0);
    displayBalance = `$${numericValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    
    // Restrict access if they owe more than $5
    if (numericValue > 5) {
      isRestricted = true;
    }
  }

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Welcome Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-slate-900 rounded-[2rem] flex items-center justify-center text-white rotate-3 shadow-xl">
            <GraduationCap size={40} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-blue-600 tracking-[0.3em] mb-1">Student Profile</p>
            <h2 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">
              {student.name.split(' ')[0]}
            </h2>
          </div>
        </div>
        <div className="px-6 py-3 bg-emerald-50 border border-emerald-100 rounded-2xl">
            <p className="text-[9px] font-black text-emerald-600 uppercase">Status</p>
            <p className="text-xs font-black text-slate-900 uppercase">{isEnrolled ? "Active" : "Alumni"}</p>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Account Balance</p>
            <p className="text-4xl font-black text-slate-900 tracking-tighter">
                {displayBalance}
            </p>
          </div>
          <div className={`p-4 rounded-2xl ${isEnrolled ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-300'}`}>
            <Wallet size={32} />
          </div>
        </div>
        
        <Link href="/portal/dashboard/grades" className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex items-center justify-between group">
          <div>
            <p className="text-[10px] font-black uppercase text-blue-400 mb-1">Results Access</p>
            <p className="text-2xl font-black italic uppercase">
                {isRestricted ? "Access Restricted" : "View Records"}
            </p>
          </div>
          <ArrowRight className="group-hover:translate-x-2 transition-transform text-blue-400" />
        </Link>
      </div>

      {/* Details Section */}
      <div className="grid md:grid-cols-3 gap-4">
          <DetailCard label="Student ID" value={student.id} icon={<ShieldCheck size={16}/>} />
          <DetailCard label="Class" value={student.class || student.student_class} icon={<Award size={16}/>} />
          <DetailCard label="Completion" value={completionYear} icon={<Calendar size={16}/>} />
      </div>

      {!isEnrolled && (
        <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 border-dashed">
          <h4 className="font-black text-xs uppercase text-slate-400 tracking-widest mb-2 italic">Alumni Notice</h4>
          <p className="text-sm font-medium text-slate-500 leading-relaxed">
            Records indicate you completed your studies in {completionYear}. Access remains available for result verification.
          </p>
        </div>
      )}
    </div>
  );
}

function DetailCard({ label, value, icon }: any) {
    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 text-blue-600 mb-2">
                {icon}
                <p className="text-[9px] font-black uppercase tracking-widest">{label}</p>
            </div>
            <p className="text-lg font-black text-slate-900 uppercase">{value}</p>
        </div>
    )
}