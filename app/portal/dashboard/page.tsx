"use client";
import { useState, useEffect } from 'react';
import { Wallet, Award, ArrowRight, ShieldCheck, GraduationCap } from 'lucide-react';
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

  // --- CORE LOGIC ---
  const idString = student.id.toString();
  const idYear = parseInt(idString.substring(0, 4));
  
  // Enrolled if ID starts with 2023, 2024, 2025, or 2026
  const isEnrolled = idYear >= 2023 && idYear <= 2026;
  
  // Logic: Completed Form 4 in (Candidate Year + 3)
  const completionYear = idYear + 3;

  // Financials
  const isAfterApril2 = new Date() >= new Date('2026-04-02');
  const TERM_FEE = isEnrolled ? 70 : 0;
  
  // totalDue uses the session balance + term fee (only for active students)
  const totalDue = (student.previous_balance || 0) + (student.term_3_balance || 0) + TERM_FEE + (isAfterApril2 && isEnrolled ? 70 : 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Hero Section */}
      <div className={`rounded-[2.5rem] p-12 text-white shadow-2xl relative overflow-hidden ${isEnrolled ? 'bg-gradient-to-br from-blue-600 to-blue-800' : 'bg-gradient-to-br from-slate-800 to-slate-950'}`}>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6">
            {isEnrolled ? (
              <><span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> Active Student</>
            ) : (
              <><GraduationCap size={14} className="text-blue-400" /> Completed Form 4 in {completionYear}</>
            )}
          </div>
          
          <h1 className="text-5xl font-black italic uppercase tracking-tighter">
            {student.name.split(' ')[0]}
          </h1>
          
          <p className="text-blue-100 mt-2 font-bold uppercase text-[10px] tracking-[0.3em] opacity-80">
             Candidate ID: {student.id} • {isEnrolled ? student.student_class : `Class of ${completionYear}`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Account Balance</p>
            <p className="text-4xl font-black text-slate-900">${totalDue.toLocaleString()}</p>
          </div>
          <Wallet className={isEnrolled ? "text-blue-600" : "text-slate-300"} size={32} />
        </div>
        
        <Link href="/portal/dashboard/grades" className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex items-center justify-between group">
          <div>
            <p className="text-[10px] font-black uppercase text-blue-400 mb-1">Results Access</p>
            <p className="text-2xl font-black italic uppercase">
                {totalDue > 30 ? "Access Restricted" : "View Records"}
            </p>
          </div>
          <ArrowRight className="group-hover:translate-x-2 transition-transform text-blue-400" />
        </Link>
      </div>

      {!isEnrolled && (
        <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 border-dashed">
          <h4 className="font-black text-xs uppercase text-slate-400 tracking-widest mb-2 italic">Alumni Notice</h4>
          <p className="text-sm font-medium text-slate-500 leading-relaxed">
            Records indicate you completed your Form 4 studies in <strong>{completionYear}</strong>. This portal remains open for you to view your payment history and historical grades. No further term fees are being applied to this account.
          </p>
        </div>
      )}
    </div>
  );
}