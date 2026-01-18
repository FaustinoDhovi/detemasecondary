"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Lock, Download, FileText } from 'lucide-react';
import { jsPDF } from 'jspdf'; // Updated import
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
      const idYear = parseInt(s.id.toString().substring(0, 4));
      const isEnrolled = idYear >= 2023 && idYear <= 2026;
      const isAfterApril2 = new Date() >= new Date('2026-04-02');
      const numericArrears = isNaN(Number(s.previous_balance)) ? 0 : Number(s.previous_balance);
      const totalDue = numericArrears + (s.term_3_balance || 0) + (isEnrolled ? 70 : 0) + (isAfterApril2 && isEnrolled ? 70 : 0);
      if (totalDue > 30 && !isNaN(Number(s.previous_balance))) {
        setIsLocked(true);
      }
      fetchReports(s.id);
    }
  }, []);

  async function fetchReports(studentId: string) {
    const { data } = await supabase
      .from('results')
      .select('*')
      .eq('student_id', studentId)
      .order('year', { ascending: true })
      .order('term', { ascending: true });
    if (data) setReports(data);
    setLoading(false);
  }

  const generatePDF = (report: any) => {
    // 1. Correct instantiation with 'new'
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
    doc.text(`Term: ${report.term} | Year: ${report.year}`, 140, 55);
    doc.text(`Class: ${student.student_class}`, 140, 62);

    // Subjects Table
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

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("This is a computer-generated report. Valid without signature.", 105, 285, { align: "center" });

    doc.save(`${student.name}_Term${report.term}_${report.year}.pdf`);
  };

  if (loading) return <div className="p-20 text-center font-black italic text-slate-400 animate-pulse uppercase tracking-widest">Compiling PDF Data...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-4xl font-black text-slate-900 italic uppercase tracking-tighter">Reports Archive</h1>
        <p className="text-blue-600 font-black text-[10px] uppercase tracking-[0.3em] mt-2 italic">{student?.name} • Academic History</p>
      </div>

      <div className="grid gap-6">
        {reports.map((report, i) => (
          <div key={i} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-xl group">
            <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-50">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-3xl bg-slate-900 text-blue-400 flex items-center justify-center shadow-lg">
                  <FileText size={28} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest">Year {report.year} • Term {report.term}</p>
                  <h3 className="font-black text-slate-900 text-2xl italic uppercase tracking-tighter">Performance Summary</h3>
                </div>
              </div>
              
              {!isLocked ? (
                <button 
                  onClick={() => generatePDF(report)}
                  className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-blue-600 transition-all shadow-xl"
                >
                  <Download size={16} /> Download PDF
                </button>
              ) : (
                <div className="text-right border-l pl-4 border-slate-100">
                  <p className="text-[10px] font-black text-red-500 uppercase tracking-tighter">Account Locked</p>
                  <Lock size={18} className="text-slate-300 mt-1" />
                </div>
              )}
            </div>

            <div className="bg-slate-50/50 p-8">
              {!isLocked && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {report.subjects && Object.entries(report.subjects).map(([subject, mark]: any) => (
                    mark !== null && mark !== "" && (
                      <div key={subject} className="bg-white p-4 rounded-2xl border border-slate-100 text-center shadow-sm">
                        <p className="text-[9px] font-black text-slate-400 uppercase truncate mb-1">{subject.replace(/_/g, ' ')}</p>
                        <p className="text-lg font-black text-slate-900 italic">{mark}</p>
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}