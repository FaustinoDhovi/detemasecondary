"use client";

import { useState } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  ChevronLeft, 
  User, 
  BookOpen, 
  Users, 
  CheckCircle, 
  ArrowRight,
  Upload
} from 'lucide-react';
import Navbar from '../components/Navbar';

export default function ApplicationPage() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[3rem] p-12 text-center shadow-2xl border border-slate-100">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4">Application Received!</h2>
          <p className="text-slate-500 mb-8">Our admissions team will review your application and contact you within 3-5 business days.</p>
          <Link href="/" className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all">
            Return Home <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          
          {/* Progress Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-black text-slate-900 mb-2">Student Application</h1>
            <p className="text-slate-500">Academic Year 2026 Enrollment</p>
            
            <div className="flex items-center justify-between mt-10 relative">
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-10" />
              {[1, 2, 3].map((num) => (
                <div 
                  key={num}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold transition-all duration-500 ${
                    step >= num ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-400 border-2 border-slate-200'
                  }`}
                >
                  {step > num ? <CheckCircle size={20} /> : num}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 text-xs font-black uppercase tracking-widest text-slate-400">
              <span className={step >= 1 ? 'text-blue-600' : ''}>Student Info</span>
              <span className={step >= 2 ? 'text-blue-600' : ''}>Academics</span>
              <span className={step >= 3 ? 'text-blue-600' : ''}>Guardian</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-slate-100">
            {step === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-8 text-blue-600">
                  <User size={24} />
                  <h3 className="text-xl font-bold">Personal Details</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <InputGroup label="First Name" placeholder="e.g. Tendai" />
                  <InputGroup label="Last Name" placeholder="e.g. Moyo" />
                  <InputGroup label="Date of Birth" type="date" />
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Gender</label>
                    <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                      <option>Select Gender</option>
                      <option>Male</option>
                      <option>Female</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-8 text-blue-600">
                  <BookOpen size={24} />
                  <h3 className="text-xl font-bold">Academic History</h3>
                </div>
                <InputGroup label="Previous School Name" placeholder="Enter school name" />
                <div className="grid md:grid-cols-2 gap-6">
                  <InputGroup label="Last Grade Completed" placeholder="e.g. Grade 7" />
                  <InputGroup label="Applying For" placeholder="e.g. Form 1" />
                </div>
                <div className="p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 text-center cursor-pointer hover:border-blue-500 transition-colors">
                  <Upload className="mx-auto text-slate-400 mb-2" />
                  <p className="text-sm font-bold text-slate-600">Upload Latest Report Card (PDF)</p>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-8 text-blue-600">
                  <Users size={24} />
                  <h3 className="text-xl font-bold">Guardian Information</h3>
                </div>
                <InputGroup label="Full Name of Guardian" placeholder="e.g. John Moyo" />
                <div className="grid md:grid-cols-2 gap-6">
                  <InputGroup label="Phone Number" placeholder="+263..." />
                  <InputGroup label="Email Address" placeholder="guardian@email.com" />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-12 pt-8 border-t border-slate-100">
              {step > 1 ? (
                <button type="button" onClick={prevStep} className="flex items-center gap-2 font-bold text-slate-500 hover:text-slate-800">
                  <ChevronLeft size={20} /> Back
                </button>
              ) : <div />}
              
              {step < 3 ? (
                <button type="button" onClick={nextStep} className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold hover:bg-slate-800 flex items-center gap-2">
                  Continue <ChevronRight size={20} />
                </button>
              ) : (
                <button type="submit" className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200">
                  Submit Application
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

function InputGroup({ label, placeholder, type = "text" }: { label: string, placeholder?: string, type?: string }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-slate-700">{label}</label>
      <input 
        type={type}
        placeholder={placeholder}
        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
      />
    </div>
  );
}