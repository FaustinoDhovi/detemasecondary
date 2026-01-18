"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Lock, Download, FileText, AlertCircle, Award, Trophy, BookOpen } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

// Grade calculation function
const getGrade = (mark: number) => {
  if (mark >= 80) return 'A+';
  if (mark >= 75) return 'A';
  if (mark >= 70) return 'A-';
  if (mark >= 65) return 'B+';
  if (mark >= 60) return 'B';
  if (mark >= 55) return 'B-';
  if (mark >= 50) return 'C+';
  if (mark >= 45) return 'C';
  if (mark >= 40) return 'C-';
  if (mark >= 35) return 'D+';
  if (mark >= 30) return 'D';
  return 'F';
};

// Grade color mapping
const getGradeColor = (grade: string) => {
  if (grade.includes('A')) return 'text-emerald-600';
  if (grade.includes('B')) return 'text-blue-600';
  if (grade.includes('C')) return 'text-amber-600';
  if (grade.includes('D')) return 'text-orange-600';
  return 'text-red-600';
};

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
      
      const numericArrears = isNaN(Number(s.previous_balance)) ? 0 : Number(s.previous_balance);
      const totalDue = numericArrears + (s.term_1_fees || 0) - (s.term_1_paid || 0);
      
      if (totalDue > 50) {
        setIsLocked(true);
      }
      
      fetchReports(s.id);
    }
  }, []);

  async function fetchReports(studentId: string) {
    const { data, error } = await supabase
      .from('results')
      .select('*')
      .eq('student_id', studentId.toUpperCase().trim())
      .order('year', { ascending: false })
      .order('term', { ascending: false });
    
    if (data) setReports(data);
    setLoading(false);
  }

  const generatePDF = async (report: any) => {
    const doc = new jsPDF();
    
    // Load and add school logo
    try {
      const logoUrl = '/logo.png';
      const logoResponse = await fetch(logoUrl);
      const logoBlob = await logoResponse.blob();
      const logoBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(logoBlob);
      });
      
      doc.addImage(logoBase64, 'PNG', 20, 15, 25, 25);
    } catch (error) {
      console.log('Logo not found, continuing without it');
    }

    // Header with gradient background
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 50, 'F');
    
    // School Name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("DETEMA SECONDARY SCHOOL", 105, 22, { align: "center" });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Academic Excellence • Integrity • Leadership", 105, 30, { align: "center" });

    // Student Info Table
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(0.5);
    doc.rect(15, 55, 180, 25);

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("STUDENT:", 20, 65);
    doc.setFont("helvetica", "normal");
    doc.text(student.name, 50, 65);
    
    doc.setFont("helvetica", "bold");
    doc.text("CLASS:", 20, 72);
    doc.setFont("helvetica", "normal");
    doc.text(report.class_name || student.student_class, 50, 72);
    
    doc.setFont("helvetica", "bold");
    doc.text("TERM:", 110, 65);
    doc.setFont("helvetica", "normal");
    doc.text(report.term.toString(), 130, 65);
    
    doc.setFont("helvetica", "bold");
    doc.text("YEAR:", 110, 72);
    doc.setFont("helvetica", "normal");
    doc.text(report.year.toString(), 130, 72);

    // Calculate grades and stats
    const subjects = Object.entries(report.subjects || {})
      .filter(([_, mark]) => mark !== null && mark !== "")
      .map(([subject, mark]) => {
        const percentage = Number(mark);
        const grade = getGrade(percentage);
        return { subject, percentage, grade };
      });

    const totalWrittenSubjects = subjects.length;
    const subjectsCPlusOrBetter = subjects.filter(s => {
      const grade = s.grade;
      if (grade === 'F' || grade === 'D' || grade === 'D+') return false;
      return true;
    }).length;

    // Subjects Table
    autoTable(doc, {
      startY: 90,
      head: [['SUBJECT', 'SCORE (%)', 'GRADE']],
      body: subjects.map(s => [
        s.subject.replace(/_/g, ' ').toUpperCase(),
        s.percentage.toFixed(1),
        s.grade
      ]),
      theme: 'striped',
      headStyles: { 
        fillColor: [37, 99, 235],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 10
      },
      bodyStyles: { fontSize: 9 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { cellWidth: 40, halign: 'center' },
        2: { cellWidth: 30, halign: 'center' }
      },
      margin: { top: 10 }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 15;

    // Performance Summary Box
    doc.setFillColor(249, 250, 251);
    doc.rect(15, finalY, 180, 35, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(15, finalY, 180, 35);

    // Summary Content
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    
    // Left Column
    doc.text("GRAND TOTAL:", 25, finalY + 10);
    doc.setFont("helvetica", "normal");
    doc.text(report.grand_total.toString(), 25, finalY + 17);
    
    doc.setFont("helvetica", "bold");
    doc.text("CLASS POSITION:", 25, finalY + 27);
    doc.setFont("helvetica", "normal");
    doc.text(`#${report.position}`, 25, finalY + 34);

    // Middle Column
    doc.setFont("helvetica", "bold");
    doc.text("TEACHER:", 80, finalY + 10);
    doc.setFont("helvetica", "normal");
    doc.text(report.teacher_name || 'Not Assigned', 80, finalY + 17);
    
    doc.setFont("helvetica", "bold");
    doc.text("SUBJECTS WRITTEN:", 80, finalY + 27);
    doc.setFont("helvetica", "normal");
    doc.text(totalWrittenSubjects.toString(), 80, finalY + 34);

    // Right Column - Performance Metrics
    doc.setFont("helvetica", "bold");
    doc.text("SUBJECTS (C+ & ABOVE):", 140, finalY + 10);
    doc.setFont("helvetica", "normal");
    doc.text(`${subjectsCPlusOrBetter} / ${totalWrittenSubjects}`, 140, finalY + 17);
    
    doc.setFont("helvetica", "bold");
    doc.text("PERFORMANCE RATE:", 140, finalY + 27);
    doc.setFont("helvetica", "normal");
    const performanceRate = totalWrittenSubjects > 0 
      ? ((subjectsCPlusOrBetter / totalWrittenSubjects) * 100).toFixed(1)
      : '0.0';
    doc.text(`${performanceRate}%`, 140, finalY + 34);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "italic");
    doc.text("This is an official transcript. Report generated electronically.", 105, 285, { align: "center" });
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 290, { align: "center" });

    // Save with teacher's name as filename
    doc.save(`${report.teacher_name || student.name}_Term${report.term}_${report.year}.pdf`);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-lg font-semibold text-slate-700 animate-pulse">Loading Academic Records...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 p-4 md:p-6">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 p-8">
        <div className="absolute inset-0 bg-grid-slate-800/[0.1]"></div>
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white italic uppercase tracking-tighter">Academic Transcripts</h1>
            <p className="text-blue-200 font-bold text-sm uppercase tracking-wider mt-2 italic">{student?.name} • Complete History</p>
            <div className="flex items-center gap-3 mt-4">
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl">
                <p className="text-xs font-bold text-white/90 uppercase tracking-wider">Student ID</p>
                <p className="text-lg font-black text-white tracking-tight">{student?.id}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl">
                <p className="text-xs font-bold text-white/90 uppercase tracking-wider">Current Class</p>
                <p className="text-lg font-black text-white tracking-tight">{student?.student_class}</p>
              </div>
            </div>
          </div>
          
          {reports.length === 0 ? (
            <div className="mt-4 md:mt-0 bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl text-sm font-bold uppercase flex items-center gap-3 border border-white/30">
              <AlertCircle size={18} />
              No Academic Records Found
            </div>
          ) : (
            <div className="mt-4 md:mt-0 bg-emerald-500/20 backdrop-blur-sm text-emerald-200 px-6 py-3 rounded-xl text-sm font-bold uppercase flex items-center gap-3 border border-emerald-500/30">
              <Trophy size={18} />
              {reports.length} Report{reports.length !== 1 ? 's' : ''} Available
            </div>
          )}
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid gap-6">
        {reports.map((report, i) => {
          const subjects = Object.entries(report.subjects || {})
            .filter(([_, mark]) => mark !== null && mark !== "")
            .map(([subject, mark]) => {
              const percentage = Number(mark);
              const grade = getGrade(percentage);
              return { subject, percentage, grade };
            });

          const totalWrittenSubjects = subjects.length;
          const subjectsCPlusOrBetter = subjects.filter(s => {
            const grade = s.grade;
            if (grade === 'F' || grade === 'D' || grade === 'D+') return false;
            return true;
          }).length;
          const performanceRate = totalWrittenSubjects > 0 
            ? ((subjectsCPlusOrBetter / totalWrittenSubjects) * 100).toFixed(1)
            : '0.0';

          return (
            <div key={i} className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden transition-all hover:shadow-2xl group-hover:-translate-y-1">
                {/* Report Header */}
                <div className="p-8 bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-100">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-white flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform">
                          <FileText size={32} />
                        </div>
                        <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs font-black px-3 py-1 rounded-full">
                          T{report.term}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase text-blue-600 tracking-wider flex items-center gap-2">
                          <Award size={12} />
                          Academic Year {report.year}
                        </p>
                        <h3 className="font-black text-slate-900 text-2xl md:text-3xl italic uppercase tracking-tighter mt-1">
                          {report.class_name || 'General Studies'}
                        </h3>
                        <p className="text-slate-500 text-sm font-medium mt-2 flex items-center gap-2">
                          <BookOpen size={14} />
                          {totalWrittenSubjects} Subject{totalWrittenSubjects !== 1 ? 's' : ''} Assessed
                        </p>
                      </div>
                    </div>
                    
                    {!isLocked ? (
                      <button 
                        onClick={() => generatePDF(report)}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-3 hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        <Download size={18} /> 
                        <span>Download PDF</span>
                      </button>
                    ) : (
                      <div className="text-right flex flex-col items-end">
                        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl flex items-center gap-3 shadow-lg">
                          <Lock size={18} />
                          <div>
                            <span className="text-sm font-black uppercase">Access Restricted</span>
                            <p className="text-xs font-medium opacity-90 mt-1">Clear outstanding fees to download</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Subjects Grid */}
                <div className="p-8">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
                    {subjects.map(({ subject, percentage, grade }) => (
                      <div key={subject} className="bg-gradient-to-br from-white to-slate-50 p-4 rounded-2xl border border-slate-100 text-center shadow-sm hover:shadow-md hover:border-blue-200 transition-all">
                        <p className="text-xs font-bold text-slate-500 uppercase truncate mb-2">{subject.replace(/_/g, ' ')}</p>
                        <div className="flex items-center justify-center gap-2">
                          <p className="text-xl font-black text-slate-900">{percentage.toFixed(1)}</p>
                          <span className={`text-lg font-black ${getGradeColor(grade)}`}>{grade}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Performance Summary */}
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6 border-t border-slate-100 pt-8">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-5 rounded-2xl border border-blue-100">
                      <p className="text-xs font-black text-blue-700 uppercase tracking-widest mb-2">Grand Total</p>
                      <p className="text-2xl font-black text-blue-900">{report.grand_total}</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-5 rounded-2xl border border-emerald-100">
                      <p className="text-xs font-black text-emerald-700 uppercase tracking-widest mb-2">Class Position</p>
                      <p className="text-2xl font-black text-emerald-900 italic">#{report.position}</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 p-5 rounded-2xl border border-purple-100">
                      <p className="text-xs font-black text-purple-700 uppercase tracking-widest mb-2">Class Teacher</p>
                      <p className="text-lg font-black text-purple-900 uppercase italic">{report.teacher_name || 'Not Assigned'}</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 p-5 rounded-2xl border border-amber-100">
                      <p className="text-xs font-black text-amber-700 uppercase tracking-widest mb-2">Subjects (C+ & Above)</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-black text-amber-900">{subjectsCPlusOrBetter}</p>
                        <p className="text-sm font-bold text-amber-600">/ {totalWrittenSubjects}</p>
                        <span className="text-xs font-black text-emerald-600 ml-auto">({performanceRate}%)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {reports.length === 0 && !loading && (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
            <FileText size={48} className="text-slate-400" />
          </div>
          <h3 className="text-2xl font-black text-slate-700 mb-3">No Records Available</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            Academic reports will appear here once they are published by the administration.
          </p>
        </div>
      )}
    </div>
  );
}