"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Lock, Download, FileText, AlertCircle } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function GradesPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [student, setStudent] = useState<any>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem('portalSession') || '{}');
    const s = session.student;
    
    if (s) {
      setStudent(s);
      
      // FINANCE LOCK LOGIC
      // We keep the lock logic for arrears, but remove the "Enrollment" year constraints
      const numericArrears = isNaN(Number(s.previous_balance)) ? 0 : Number(s.previous_balance);
      const totalDue = numericArrears + (s.term_1_fees || 0) - (s.term_1_paid || 0);
      
      // If arrears are high, we still lock the download, but not the view
      if (totalDue > 50) {
        setIsLocked(true);
      }
      
      fetchReports(s.id);
    }
  }, []);

  async function fetchReports(studentId: string) {
    // FETCH ALL RESULTS regardless of the current year
    const { data, error } = await supabase
      .from('results')
      .select('*')
      .eq('student_id', studentId.toUpperCase().trim()) // Ensure ID is clean
      .order('year', { ascending: false }) // Show newest first
      .order('term', { ascending: false });
    
    if (data) setReports(data);
    setLoading(false);
  }

  const generatePDF = (report: any) => {
    const doc = new jsPDF(); 
    
    // Header
    doc.setFillColor(15, 23, 42); 
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("DETEMA SECONDARY SCHOOL", 105, 20, { align: "center" });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.text("Official Academic Achievement Record", 105, 28, { align: "center" });

    // Student Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Student: ${student.name}`, 14, 55);
    doc.text(`ID: ${student.id}`, 14, 62);
    // Use report.class_name from the results table, not the student's current class
    doc.text(`Term: ${report.term} | Year: ${report.year}`, 140, 55);
    doc.text(`Class: ${report.class_name || student.student_class}`, 140, 62);

    const tableRows = Object.entries(report.subjects || {})
      .filter(([_, mark]) => mark !== null && mark !== "")
      .map(([subject, mark]) => [subject.replace(/_/g, ' ').toUpperCase(), mark]);

    autoTable(doc, {
      startY: 75,
      head: [['SUBJECT', 'PERCENTAGE (%)']],
      body: tableRows as any,
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 5 },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(11);
    doc.text(`GRAND TOTAL: ${report.grand_total}`, 14, finalY);
    doc.text(`CLASS POSITION: ${report.position}`, 14, finalY + 7);
    doc.text(`TEACHER: ${report.teacher_name || 'N/A'}`, 14, finalY + 14);

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Computer generated. Valid without signature.", 105, 285, { align: "center" });

    doc.save(`${student.name}_Term${report.term}_${report.year}.pdf`);
  };

  if (loading) return <div className="p-20 text-center font-black italic text-slate-400 animate-pulse uppercase tracking-widest">Accessing Archives...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 italic uppercase tracking-tighter">Reports Archive</h1>
          <p className="text-blue-600 font-black text-[10px] uppercase tracking-[0.3em] mt-2 italic">{student?.name} • Full History</p>
        </div>
        {reports.length === 0 && (
          <div className="bg-amber-50 text-amber-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 border border-amber-100">
            <AlertCircle size={14}/> No Results Found
          </div>
        )}
      </div>

      <div className="grid gap-6">
        {reports.map((report, i) => (
          <div key={i} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-xl group">
            <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-50">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-3xl bg-slate-900 text-blue-400 flex items-center justify-center shadow-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <FileText size={28} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest">Year {report.year} • Term {report.term}</p>
                  <h3 className="font-black text-slate-900 text-2xl italic uppercase tracking-tighter">{report.class_name || 'Academic Record'}</h3>
                </div>
              </div>
              
              {!isLocked ? (
                <button 
                  onClick={() => generatePDF(report)}
                  className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-blue-600 transition-all shadow-xl"
                >
                  <Download size={16} /> Download Report
                </button>
              ) : (
                <div className="text-right flex flex-col items-end">
                  <div className="bg-red-50 text-red-500 px-4 py-2 rounded-xl flex items-center gap-2 mb-1 border border-red-100">
                    <Lock size={14} />
                    <span className="text-[10px] font-black uppercase">Fees Outstanding</span>
                  </div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Clear balance to download</p>
                </div>
              )}
            </div>

            <div className="bg-slate-50/50 p-8">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {report.subjects && Object.entries(report.subjects).map(([subject, mark]: any) => (
                  mark !== null && mark !== "" && (
                    <div key={subject} className="bg-white p-4 rounded-2xl border border-slate-100 text-center shadow-sm hover:border-blue-200 transition-colors">
                      <p className="text-[9px] font-black text-slate-400 uppercase truncate mb-1">{subject.replace(/_/g, ' ')}</p>
                      <p className="text-lg font-black text-slate-900 italic">{mark}%</p>
                    </div>
                  )
                ))}
              </div>
              
              <div className="mt-8 flex gap-6 border-t border-slate-100 pt-6">
                 <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Grand Total</p>
                    <p className="text-sm font-black text-slate-900">{report.grand_total}</p>
                 </div>
                 <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Class Position</p>
                    <p className="text-sm font-black text-blue-600 italic">#{report.position}</p>
                 </div>
                 <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Teacher</p>
                    <p className="text-sm font-black text-slate-900 uppercase italic">{report.teacher_name || 'Unspecified'}</p>
                 </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}