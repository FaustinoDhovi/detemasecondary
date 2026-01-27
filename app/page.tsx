"use client";

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import HeadsWelcome from './components/HeadsWelcome';
import Academics from './components/Academics';
import StatsBar from './components/StatsBar';
import BackToTop from './components/BackToTop';
import Link from 'next/link';
import { 
  ArrowRight, 
  Sparkles, 
  Users, 
  Clock, 
  ChevronRight, 
  BookOpen, 
  Globe, 
  Trophy, 
  Star, 
  Phone, 
  Mail, 
  MapPin 
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Home() {
  const [countdown, setCountdown] = useState({
    days: 28,
    hours: 14,
    minutes: 45,
    seconds: 22
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        let { days, hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else {
          seconds = 59;
          if (minutes > 0) {
            minutes--;
          } else {
            minutes = 59;
            if (hours > 0) {
              hours--;
            } else {
              hours = 23;
              if (days > 0) {
                days--;
              }
            }
          }
        }
        
        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <main className="min-h-screen bg-white overflow-hidden">
      {/* Simplified Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-50 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-blue-50 rounded-full blur-3xl" />
      </div>

      <Navbar />
      
      {/* Enhanced Floating Actions */}
      <div className="fixed right-6 bottom-24 z-40 flex flex-col gap-4">
        <div className="relative group">
          <Link 
            href="/portal?force=true" 
            className="relative bg-gradient-to-br from-blue-600 to-blue-800 text-white p-4 rounded-xl shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300"
          >
            <Sparkles size={24} />
            <div className="absolute -top-2 -right-2 bg-white text-blue-600 text-[10px] font-black px-2 py-1 rounded-full">
              PORTAL
            </div>
          </Link>
        </div>
        
        <div className="relative group">
          <Link 
            href="/apply" 
            className="relative bg-gradient-to-br from-white to-slate-100 text-blue-700 p-4 rounded-xl shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 border-2 border-blue-100"
          >
            <Users size={24} />
          </Link>
        </div>
        
        <div className="relative group">
          <Link 
            href="#contact" 
            className="relative bg-gradient-to-br from-slate-800 to-slate-900 text-white p-4 rounded-xl shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 border border-slate-700"
          >
            <Phone size={24} />
          </Link>
        </div>
      </div>

      {/* Live Stats Badge */}
      <div className="fixed top-24 left-6 z-30">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-2xl border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Portal Live</p>
              <p className="text-[10px] text-slate-500 font-bold">24/7 Access</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <Hero />
      </div>

      <StatsBar />
      
      <div id="facilities">
        <Features />
      </div>

      <HeadsWelcome />
      
      <div id="academics">
        <Academics />
      </div>

      {/* Realistic Alumni Testimonials */}
      <section className="py-32 bg-gradient-to-b from-white via-blue-50/30 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 px-6 py-3 rounded-full text-sm font-black uppercase tracking-widest mb-8 shadow-lg">
              <Star className="fill-yellow-400 text-yellow-400" size={16} />
              Success Stories
              <Star className="fill-yellow-400 text-yellow-400" size={16} />
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-slate-900 mb-8 tracking-tighter">
              Our <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Achievers</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-cyan-400 mx-auto rounded-full mb-8" />
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Discover how Detema has shaped successful careers and futures
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Dr. Tariro Moyo",
                year: "Class of 2012",
                quote: "The science program at Detema gave me the foundation for my medical career. The teachers were exceptional mentors.",
                achievement: "Medical Doctor",
                current: "Parirenyatwa Hospital",
                color: "from-blue-500 to-blue-700"
              },
              {
                name: "Tendai Chikwava",
                year: "Class of 2015",
                quote: "The ICT department sparked my passion for technology. Today I lead a software development team.",
                achievement: "Tech Lead",
                current: "Econet Wireless",
                color: "from-purple-500 to-purple-700"
              },
              {
                name: "Rumbidzai Ndlovu",
                year: "Class of 2018",
                quote: "The business studies program taught me practical skills that I use daily in my accounting practice.",
                achievement: "Chartered Accountant",
                current: "Deloitte Zimbabwe",
                color: "from-emerald-500 to-emerald-700"
              }
            ].map((alumni, index) => (
              <div 
                key={index}
                className="group relative"
              >
                <div className="relative bg-white rounded-3xl p-8 border border-slate-200 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-4">
                  {/* Alumni Badge */}
                  <div className={`absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r ${alumni.color} text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-lg`}>
                    {alumni.achievement}
                  </div>
                  
                  <div className="flex items-center gap-4 mb-8">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${alumni.color} flex items-center justify-center shadow-xl`}>
                      <span className="text-white font-black text-xl">{alumni.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-lg">{alumni.name}</h4>
                      <p className="text-sm text-slate-500">{alumni.year}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Globe size={12} className="text-blue-500" />
                        <p className="text-xs font-bold text-slate-600">{alumni.current}</p>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-slate-700 italic mb-8 leading-relaxed text-lg relative">
                    <span className="absolute -left-4 -top-2 text-4xl text-blue-200 font-serif">"</span>
                    {alumni.quote}
                    <span className="absolute -right-2 -bottom-4 text-4xl text-blue-200 font-serif">"</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Practical Quick Links - REMOVED STAFF LOGIN */}
      <section className="py-20 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
              Quick <span className="text-blue-600">Links</span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Essential resources for students and parents
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Student Portal",
                description: "Access assignments, grades, and resources",
                icon: <Sparkles size={24} />,
                color: "from-blue-500 to-cyan-500",
                href: "/portal?force=true"
              },
              {
                title: "Admissions",
                description: "Apply for enrollment and view requirements",
                icon: <Users size={24} />,
                color: "from-emerald-500 to-green-500",
                href: "/apply"
              },
              {
                title: "Sports & Activities",
                description: "View fixtures and club information",
                icon: <Trophy size={24} />,
                color: "from-purple-500 to-pink-500",
                href: "#"
              }
            ].map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className="group relative overflow-hidden"
              >
                <div className="relative bg-white rounded-3xl p-8 border border-slate-200 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 h-full">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${link.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                    <div className="text-white">
                      {link.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-3">{link.title}</h3>
                  <p className="text-slate-600 text-sm mb-6">{link.description}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Access Now</span>
                    <ArrowRight size={16} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Final CTA */}
      <section className="relative overflow-hidden py-32 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="absolute top-1/4 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl" />
        
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          {/* Countdown Timer */}
          <div className="max-w-md mx-auto mb-12 bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-300 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-4">
                <Clock size={12} />
                Term 1 Starts In
              </div>
              <p className="text-white/80 text-sm font-medium">2026 Academic Year</p>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[
                { value: countdown.days.toString().padStart(2, '0'), label: "Days" },
                { value: countdown.hours.toString().padStart(2, '0'), label: "Hours" },
                { value: countdown.minutes.toString().padStart(2, '0'), label: "Minutes" },
                { value: countdown.seconds.toString().padStart(2, '0'), label: "Seconds" }
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="bg-gradient-to-b from-white/10 to-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="text-2xl font-black text-white">{item.value}</div>
                    <div className="text-xs text-white/60 font-bold uppercase tracking-widest mt-2">{item.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="text-center">
            <h2 className="text-5xl md:text-7xl font-black mb-10 tracking-tighter">
              <span className="text-white">Your Education </span>
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
                Our Commitment
              </span>
            </h2>
            
            <p className="text-xl mb-14 text-blue-100/90 font-medium max-w-3xl mx-auto leading-relaxed">
              Join our community of learners and achievers at Detema Secondary School.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <Link 
                href="/apply" 
                className="group relative overflow-hidden bg-gradient-to-r from-white to-slate-100 text-blue-900 px-16 py-6 rounded-2xl font-black text-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 min-w-[280px]"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  <Sparkles />
                  APPLY NOW
                  <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-300 opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
              </Link>
              
              <Link 
                href="/portal?force=true" 
                className="group bg-transparent text-white px-16 py-6 rounded-2xl font-black text-lg border-2 border-white/30 hover:border-white/60 hover:bg-white/10 transition-all duration-300 min-w-[280px] relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  <Sparkles />
                  STUDENT PORTAL
                  <ChevronRight className="group-hover:translate-x-2 transition-transform" />
                </span>
              </Link>
            </div>
            
            <div className="flex flex-wrap justify-center gap-8 text-sm text-blue-200/70 font-medium">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                <span>✓ Quality Education</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                <span>✓ Modern Facilities</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                <span>✓ Secure Digital Portal</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simplified Footer */}
      <footer className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-black text-white py-24" id="contact">
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-12 mb-20">
            {/* Brand Column */}
            <div className="space-y-8">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-2xl flex items-center justify-center shadow-2xl">
                    <div className="text-white font-black text-3xl">D</div>
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-black tracking-tighter text-white">
                    DETEMA SECONDARY
                  </div>
                  <div className="text-sm text-blue-400 font-bold uppercase tracking-widest leading-none mt-2">
                    Excellence Through Education
                  </div>
                </div>
              </div>
              
              <p className="text-slate-300 text-lg leading-relaxed max-w-md">
                Committed to academic excellence and holistic development of every student.
              </p>
            </div>
            
            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-black uppercase tracking-widest mb-8 text-blue-400">
                Quick Links
              </h4>
              <ul className="space-y-4">
                {[
                  { label: "Student Portal", href: "/portal?force=true" },
                  { label: "Admissions", href: "/apply" },
                  { label: "School News", href: "#" },
                  { label: "Contact Us", href: "#contact" }
                ].map((item) => (
                  <li key={item.label}>
                    <Link 
                      href={item.href} 
                      className="text-slate-300 hover:text-white transition-colors font-medium flex items-center gap-3 group text-sm"
                    >
                      <div className="w-1 h-1 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                      {item.label}
                      <ArrowRight size={12} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-sm font-black uppercase tracking-widest mb-8 text-blue-400">
                Contact Us
              </h4>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Phone size={16} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-300 mb-1">Phone</p>
                    <p className="text-blue-300 font-medium">
                      +263 (0) 123 456 789
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Mail size={16} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-300 mb-1">Email</p>
                    <p className="text-blue-300 font-medium">
                      info@detemasecondary.ac.zw
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <MapPin size={16} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-300 mb-1">Address</p>
                    <p className="text-slate-400 text-sm font-medium">Harare, Zimbabwe</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer Bottom */}
          <div className="pt-10 border-t border-white/10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-center md:text-left">
                <p className="text-slate-500 text-xs font-black uppercase tracking-[0.2em]">
                  © {new Date().getFullYear()} Detema Secondary School. All rights reserved.
                </p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-6 text-xs text-slate-500 font-medium">
                <a href="#" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  Terms of Service
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
      
      <BackToTop />
    </main>
  );
}