"use client";

import { Wallet, Download, Receipt, CreditCard, History, Database, ChevronRight, Clock, CheckCircle2 } from 'lucide-react';

export default function FeesPage() {
  const transactions = [
    { id: "TXN-9921", date: "Jan 12, 2026", desc: "Term 1 Tuition", amount: 850.00, status: "Paid", method: "Bank Transfer" },
    { id: "TXN-8842", date: "Jan 15, 2026", desc: "School Bus Service", amount: 120.00, status: "Paid", method: "EcoCash" },
    { id: "TXN-7710", date: "Feb 01, 2026", desc: "Laboratory Levy", amount: 45.00, status: "Pending", method: "Invoice" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard label="Account Balance" value="$45.00" icon={<Clock className="text-red-500" />} />
        <SummaryCard label="Total Paid" value="$970.00" icon={<CheckCircle2 className="text-green-600" />} />
        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex flex-col justify-between shadow-2xl">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">Action Required</p>
          <p className="text-lg font-bold mb-4 italic text-blue-400">Settle Balance</p>
          <button className="bg-blue-600 w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-500 transition-all flex items-center justify-center gap-2">
            <CreditCard size={18} /> Pay Now
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <h3 className="font-black text-slate-900 flex items-center gap-2 tracking-tighter uppercase">
              <History size={20} className="text-blue-600" /> Transaction History
            </h3>
            <button className="hidden sm:flex text-xs font-black text-blue-600 uppercase tracking-widest items-center gap-2 hover:underline">
              <Download size={16} /> Statement
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <tr>
                  <th className="px-8 py-5">Reference</th>
                  <th className="px-8 py-5">Amount</th>
                  <th className="px-8 py-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium">
                {transactions.map((txn, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-6">
                      <p className="text-sm text-slate-900 font-bold">{txn.desc}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{txn.date}</p>
                    </td>
                    <td className="px-8 py-6 text-sm font-black text-slate-900">${txn.amount.toFixed(2)}</td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                        txn.status === 'Paid' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                      }`}>
                        {txn.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm h-fit">
          <div className="flex items-center gap-2 mb-6 text-blue-600 font-black text-[10px] uppercase tracking-widest">
            <Database size={14} /> Official Banking
          </div>
          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Bank Name</p>
              <p className="font-black text-slate-900">CBZ Bank Zimbabwe</p>
            </div>
            <div className="bg-slate-50 p-5 rounded-2xl border border-dashed border-slate-200">
              <p className="text-[10px] font-black uppercase text-slate-400 text-center mb-1">Account Number</p>
              <p className="font-black text-xl text-blue-600 text-center tracking-widest leading-none">011234567890</p>
            </div>
          </div>
          <p className="mt-8 text-[10px] text-slate-400 leading-relaxed font-bold italic text-center uppercase tracking-tighter">
            * Use student ID as payment reference
          </p>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, icon }: any) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{label}</p>
        <p className="text-3xl font-black text-slate-900">{value}</p>
      </div>
      <div className="p-4 bg-slate-50 rounded-2xl">{icon}</div>
    </div>
  );
}