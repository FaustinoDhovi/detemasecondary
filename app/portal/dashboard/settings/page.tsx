"use client";

import { useState } from 'react';
import { 
  User, 
  Lock, 
  Bell, 
  Shield, 
  Smartphone, 
  Mail, 
  Save, 
  Camera,
  Eye,
  EyeOff
} from 'lucide-react';

export default function SettingsPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Account Settings</h1>
        <p className="text-slate-500 font-medium">Manage your profile, security, and notification preferences</p>
      </div>

      <div className="grid gap-8">
        {/* Profile Section */}
        <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex items-center gap-2 font-black text-slate-900 uppercase text-sm tracking-tight">
            <User size={18} className="text-blue-600" /> Personal Information
          </div>
          <div className="p-8 space-y-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group">
                <div className="w-24 h-24 rounded-3xl bg-blue-600 flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-blue-100">
                  TM
                </div>
                <button className="absolute -bottom-2 -right-2 p-2 bg-white border border-slate-100 rounded-xl shadow-lg text-blue-600 hover:scale-110 transition-transform">
                  <Camera size={16} />
                </button>
              </div>
              <div className="text-center sm:text-left">
                <h3 className="font-black text-slate-900 text-xl">Tendai Moyo</h3>
                <p className="text-sm font-bold text-slate-400">Student ID: DET-2026-0442</p>
                <p className="text-xs font-black text-blue-600 uppercase mt-1 tracking-widest">Form 4-A</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <InputGroup label="Full Name" value="Tendai Moyo" disabled />
              <InputGroup label="Email Address" value="tendai.moyo@student.ac.zw" />
              <InputGroup label="Phone Number" value="+263 77 000 0000" />
              <InputGroup label="Date of Birth" value="12 June 2008" disabled />
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex items-center gap-2 font-black text-slate-900 uppercase text-sm tracking-tight">
            <Lock size={18} className="text-blue-600" /> Security & Password
          </div>
          <div className="p-8 space-y-6">
            <div className="relative">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">Current Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  placeholder="••••••••••••"
                />
                <button 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              <InputGroup label="New Password" type="password" placeholder="Min. 8 characters" />
              <InputGroup label="Confirm New Password" type="password" placeholder="Repeat password" />
            </div>
            <button className="flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-widest hover:underline">
              <Shield size={14} /> Enable Two-Factor Authentication (2FA)
            </button>
          </div>
        </section>

        {/* Notifications Section */}
        <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex items-center gap-2 font-black text-slate-900 uppercase text-sm tracking-tight">
            <Bell size={18} className="text-blue-600" /> Notification Preferences
          </div>
          <div className="p-8 space-y-4">
            <ToggleOption 
              icon={<Mail size={18} />} 
              title="Email Notifications" 
              desc="Receive weekly progress reports and fee statements." 
              checked={true} 
            />
            <ToggleOption 
              icon={<Smartphone size={18} />} 
              title="SMS Alerts" 
              desc="Get instant alerts for emergency notices and test results." 
              checked={false} 
            />
          </div>
        </section>

        {/* Save Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-8 bg-slate-900 rounded-[2rem] text-white">
          <p className="text-xs font-bold text-slate-400 mb-4 sm:mb-0 italic">Last profile update: 2 days ago</p>
          <button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-900/40">
            <Save size={18} /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function InputGroup({ label, value, type = "text", placeholder, disabled }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block ml-1">{label}</label>
      <input 
        type={type}
        defaultValue={value}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      />
    </div>
  );
}

function ToggleOption({ icon, title, desc, checked }: any) {
  return (
    <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[1.5rem] border border-transparent hover:border-slate-200 transition-all">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-white rounded-xl text-blue-600 shadow-sm">{icon}</div>
        <div>
          <p className="font-bold text-slate-900 text-sm">{title}</p>
          <p className="text-xs text-slate-400 font-medium">{desc}</p>
        </div>
      </div>
      <div className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${checked ? 'bg-blue-600' : 'bg-slate-300'}`}>
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${checked ? 'right-1' : 'left-1'}`} />
      </div>
    </div>
  );
}