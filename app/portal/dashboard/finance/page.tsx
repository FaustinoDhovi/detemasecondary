"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Database, Clock, Wallet, History, ArrowDownCircle, Banknote, PhoneCall, ShieldCheck } from 'lucide-react';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function FeesPage() {
  const [student, setStudent] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = localStorage.getItem('portalSession');
    if (session) {
      const studentData = JSON.parse(session).student;
      setStudent(studentData);
      fetchTransactions(studentData.id);
    }
  }, []);

  async function fetchTransactions(studentId: string) {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('student_id', studentId)
      .order('date', { ascending: false });

    if (data) setTransactions(data);
    setLoading(false);
  }

  if (!student || loading) return <div className="p-20 text-center font-black italic text-slate-400 animate-pulse uppercase">Syncing Financial Records...</div>;

  // --- LOGIC ENGINE ---
  const idYear = parseInt(student.id.toString().substring(0, 4));
  const isValidForBilling = idYear >= 2023 && idYear <= 2026; //
  
  // Handle Donor/Organization Arrears
  const isDonorFunded = isNaN(Number(student.previous_balance));
  const numericArrears = isDonorFunded ? 0 : Number(student.previous_balance);

  // Fee Rules
  const isAfterApril2 = new Date() >= new Date('2026-04-02');
  const TERM_FEE = isValidForBilling ? 70 : 0;
  const totalBilled = numericArrears + (student.term_3_balance || 0) + TERM_FEE + (isAfterApril2 && isValidForBilling ? 70 : 0);

  // Real-time Balance Calculation
  const totalPaid = transactions.reduce((sum, txn) => sum + (Number(txn.amount) || 0), 0);
  const currentBalance = totalBilled - totalPaid;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl">
          <p className="text-blue-400 font-black text-[10px] uppercase tracking-widest mb-1 italic">Outstanding</p>
          <p className="text-5xl font-black italic">${currentBalance.toLocaleString()}</p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Total Paid</p>
            <p className="text-3xl font-black text-green-600">${totalPaid.toLocaleString()}</p>
          </div>
          <ArrowDownCircle className="text-green-500" size={32} />
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Status</p>
                <p className={`text-2xl font-black italic uppercase ${currentBalance > 30 ? 'text-red-500' : 'text-green-600'}`}>
                    {currentBalance > 30 ? 'Locked' : 'Cleared'}
                </p>
            </div>
            <ShieldCheck className={currentBalance > 30 ? 'text-red-500' : 'text-green-600'} size={32}/>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEDGER */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
           <h3 className="text-xl font-black italic uppercase mb-6 flex items-center gap-2 italic">
             <Database size={20} className="text-blue-600"/> Fee Ledger
           </h3>
           <div className="space-y-2">
              <div className={`flex justify-between py-4 px-4 rounded-xl border ${isDonorFunded ? 'bg-emerald-50 border-emerald-100' : 'border-transparent'}`}>
                <span className="text-sm font-bold text-slate-600 uppercase">Previous Arrears</span>
                <span className={`font-black text-lg ${isDonorFunded ? 'text-emerald-600' : 'text-red-500'}`}>
                   {isDonorFunded ? student.previous_balance : `$${numericArrears}`}
                </span>
              </div>
              <FeeRow label="Term 3 2025 Balance" amount={student.term_3_balance} />
              {isValidForBilling && <FeeRow label="Term 1 2026 Tuition" amount={70} highlight />}
              {isAfterApril2 && isValidForBilling && <FeeRow label="Term 2 2026 Tuition" amount={70} color="text-orange-600" />}
              <div className="mt-8 pt-6 border-t-2 border-slate-100 flex justify-between font-black text-slate-400 uppercase text-xs">
                <span>Gross Billed</span>
                <span>${totalBilled.toLocaleString()}</span>
              </div>
           </div>
        </div>

        {/* UPLOADED TRANSACTION HISTORY */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
           <h3 className="text-xl font-black italic uppercase mb-6 flex items-center gap-2 italic">
             <History size={20} className="text-blue-600"/> Payment History
           </h3>
           <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {transactions.map((txn: any) => (
                <div key={txn.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-xl text-blue-600 shadow-sm">
                      {txn.method === "Ecocash" ? <PhoneCall size={18}/> : txn.method === "Bank Transfer" ? <Database size={18}/> : <Banknote size={18}/>}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">{txn.method}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{txn.date} • Ref: {txn.reference}</p>
                    </div>
                  </div>
                  <p className="font-black text-green-600">-${Number(txn.amount).toLocaleString()}</p>
                </div>
              ))}
              {transactions.length === 0 && (
                <div className="text-center py-20">
                    <p className="text-slate-400 font-black italic uppercase text-xs">No payments found in history</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}

function FeeRow({ label, amount, color, highlight }: any) {
  if (!amount || amount === 0) return null;
  return (
    <div className={`flex justify-between py-4 px-4 rounded-xl ${highlight ? 'bg-blue-50/40' : ''}`}>
      <span className="text-sm font-bold text-slate-600 uppercase">{label}</span>
      <span className={`font-black text-lg ${color || 'text-slate-900'}`}>${amount.toLocaleString()}</span>
    </div>
  );
}