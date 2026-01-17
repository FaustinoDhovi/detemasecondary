"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, User, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handle);
    return () => window.removeEventListener('scroll', handle);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-4 group">
          {/* Official Logo Implementation */}
          <div className="relative w-12 h-12 flex items-center justify-center transition-transform group-hover:scale-110 duration-300">
            <img 
              src="/logo.png" 
              alt="Detema Secondary School Logo" 
              className={`w-full h-full object-contain ${!scrolled ? 'brightness-0 invert' : ''}`} 
              // The filter above makes the logo white when the navbar is transparent 
              // and returns it to original colors when scrolled onto the white background.
            />
          </div>
          
          <div className={`font-black tracking-tighter transition-colors duration-300 ${scrolled ? 'text-slate-900' : 'text-white'}`}>
            <div className="text-lg leading-none italic uppercase">DETEMA</div>
            <div className={`text-[9px] uppercase tracking-[0.2em] font-black ${scrolled ? 'text-blue-600' : 'text-blue-400'}`}>Secondary</div>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className={`text-[11px] font-black uppercase tracking-widest transition-colors ${scrolled ? 'text-slate-600 hover:text-blue-600' : 'text-white/80 hover:text-white'}`}>Home</Link>
          <Link href="/#academics" className={`text-[11px] font-black uppercase tracking-widest transition-colors ${scrolled ? 'text-slate-600 hover:text-blue-600' : 'text-white/80 hover:text-white'}`}>Academics</Link>
          
          <div className={`h-6 w-[1px] mx-2 transition-colors ${scrolled ? 'bg-slate-200' : 'bg-white/20'}`} />
          
          <Link href="/portal" className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all ${scrolled ? 'text-blue-600 hover:text-slate-900' : 'text-white hover:text-blue-300'}`}>
            <ShieldCheck size={18} /> Student Portal
          </Link>
          
          <Link href="/apply" className="bg-blue-600 text-white px-7 py-3 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:scale-105 transition-all shadow-xl shadow-blue-500/20">
            Enroll 2026
          </Link>
        </div>

        <button onClick={() => setOpen(!open)} className={`md:hidden p-2 transition-colors ${scrolled ? 'text-slate-900' : 'text-white'}`}>
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="absolute top-full left-0 w-full bg-white shadow-2xl p-8 flex flex-col gap-6 animate-in slide-in-from-top-5 duration-300 md:hidden">
          <Link href="/portal" onClick={() => setOpen(false)} className="text-sm font-black text-slate-900 flex items-center gap-3 uppercase tracking-widest border-b pb-4">
            <User size={20} className="text-blue-600" /> My Account Portal
          </Link>
          <Link href="/apply" onClick={() => setOpen(false)} className="bg-blue-600 text-white text-center py-5 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 active:scale-95 transition-transform">Apply for 2026</Link>
        </div>
      )}
    </nav>
  );
}