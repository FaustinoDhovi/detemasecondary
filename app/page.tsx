import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import HeadsWelcome from './components/HeadsWelcome';
import Academics from './components/Academics';
import StatsBar from './components/StatsBar';
import BackToTop from './components/BackToTop';
import Link from 'next/link';
import { ArrowRight, Sparkles, Users, Clock, Award, ChevronRight } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute top-1/3 -left-40 w-80 h-80 bg-purple-100 rounded-full blur-3xl opacity-20 animate-pulse delay-1000" />
        <div className="absolute -bottom-40 right-1/4 w-80 h-80 bg-slate-100 rounded-full blur-3xl opacity-20 animate-pulse delay-500" />
      </div>

      <Navbar />
      
      {/* Floating Quick Actions */}
      <div className="fixed right-6 bottom-24 z-40 flex flex-col gap-3 animate-slide-up">
        <Link 
          href="/portal" 
          className="bg-blue-600 text-white p-3 rounded-xl shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 group"
        >
          <Sparkles size={20} />
        </Link>
        <Link 
          href="/apply" 
          className="bg-white text-blue-600 p-3 rounded-xl shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 group border border-blue-100"
        >
          <Users size={20} />
        </Link>
      </div>

      <div className="animate-fade-in">
        <Hero />
      </div>

      {/* Enhanced Stats Bar with Animations */}
      <div className="relative">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent" />
        <StatsBar />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent" />
      </div>
      
      <div id="facilities">
        <Features />
      </div>

      <HeadsWelcome />
      
      <div id="academics">
        <Academics />
      </div>

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-widest mb-6">
              <Award size={16} />
              Student Voices
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
              Our Students <span className="text-blue-600">Achieve</span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Hear from the brilliant minds shaping our school&apos;s legacy
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Tendai Moyo",
                year: "Class of 2025",
                quote: "The robotics club opened doors to opportunities I never imagined. Now I'm headed to study Computer Science at university.",
                achievement: "National Science Fair Winner"
              },
              {
                name: "Sarah Chikomo",
                year: "Class of 2024",
                quote: "The mentorship from teachers here doesn't just prepare you for exams, it prepares you for life.",
                achievement: "8 A* at A-Level"
              },
              {
                name: "Blessing Ndlovu",
                year: "Class of 2023",
                quote: "From debating competitions to community projects, Detema teaches leadership through experience.",
                achievement: "Student Council President"
              }
            ].map((testimonial, index) => (
              <div 
                key={index}
                className="bg-white rounded-3xl p-8 border border-slate-200 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                    <span className="text-white font-black text-lg">{testimonial.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900">{testimonial.name}</h4>
                    <p className="text-sm text-slate-500">{testimonial.year}</p>
                  </div>
                </div>
                <p className="text-slate-700 italic mb-6 leading-relaxed">"{testimonial.quote}"</p>
                <div className="pt-6 border-t border-slate-100">
                  <span className="inline-flex items-center gap-2 text-sm font-bold text-blue-600">
                    <Sparkles size={14} />
                    {testimonial.achievement}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { label: "Term Calendar", desc: "View academic dates", icon: Clock },
              { label: "Sports Fixtures", desc: "Upcoming matches", icon: Award },
              { label: "Parent Portal", desc: "Access reports", icon: Users },
              { label: "School Blog", desc: "Latest news", icon: Sparkles }
            ].map((item, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-white/10 group-hover:bg-white/20 transition-all">
                    <item.icon size={24} />
                  </div>
                  <div>
                    <p className="font-black text-lg">{item.label}</p>
                    <p className="text-sm text-blue-200 font-medium">{item.desc}</p>
                  </div>
                  <ChevronRight className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final Call to Action - Enhanced */}
      <section className="py-32 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-hidden relative">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-500" />
        </div>
        
        <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full mb-8">
            <Sparkles size={18} className="text-yellow-300" />
            <span className="text-sm font-bold text-white uppercase tracking-widest">Admissions Open</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tighter">
            <span className="text-white">Shape Your </span>
            <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">Brilliant Future</span>
          </h2>
          
          <p className="text-xl mb-12 text-blue-100/90 font-medium max-w-3xl mx-auto leading-relaxed">
            Join a community where academic excellence meets character development. 
            Limited spaces available for the 2026 Academic Year—secure your place today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link 
              href="/apply" 
              className="group relative overflow-hidden bg-gradient-to-r from-white to-slate-100 text-blue-900 px-12 py-6 rounded-2xl font-black text-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 min-w-[240px]"
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                APPLY NOW
                <ArrowRight className="group-hover:translate-x-2 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-300 opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
            </Link>
            
            <Link 
              href="/portal" 
              className="group bg-transparent text-white px-12 py-6 rounded-2xl font-black text-lg border-2 border-white/30 hover:border-white/60 hover:bg-white/10 transition-all duration-300 min-w-[240px]"
            >
              <span className="flex items-center justify-center gap-3">
                ACCESS PORTAL
                <ChevronRight className="group-hover:translate-x-2 transition-transform" />
              </span>
            </Link>
          </div>
          
          <p className="text-sm text-blue-200/70 mt-10 font-medium">
            Need assistance? Contact admissions at{" "}
            <a href="mailto:admissions@detemasecondary.ac.zw" className="text-white font-bold hover:underline">
              admissions@detemasecondary.ac.zw
            </a>
          </p>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gradient-to-b from-slate-950 to-black text-white py-20 relative overflow-hidden" id="contact">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-4 gap-12 mb-16">
            <div className="space-y-8">
              <div className="flex items-center gap-4 group">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-105 transition-transform">
                  <div className="text-white font-black text-2xl">D</div>
                </div>
                <div>
                  <div className="text-2xl font-black tracking-tighter bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                    DETEMA
                  </div>
                  <div className="text-xs text-blue-400 font-bold uppercase tracking-widest leading-none mt-1">
                    Secondary School
                  </div>
                </div>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                Nurturing a generation of disciplined thinkers and innovative leaders through academic excellence.
              </p>
              <div className="flex gap-4">
                {['Facebook', 'Twitter', 'Instagram', 'LinkedIn'].map((social) => (
                  <a 
                    key={social}
                    href="#" 
                    className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors"
                    aria-label={social}
                  >
                    <span className="text-xs font-bold">{social.charAt(0)}</span>
                  </a>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-black uppercase tracking-widest mb-8 text-blue-400 flex items-center gap-2">
                <ChevronRight size={16} />
                Navigation
              </h4>
              <ul className="space-y-4">
                {[
                  { label: "Admissions 2026", href: "/apply" },
                  { label: "Student Portal", href: "/portal" },
                  { label: "Curriculum Overview", href: "#academics" },
                  { label: "School Facilities", href: "#facilities" },
                  { label: "Sports & Activities", href: "#" },
                  { label: "Contact Directory", href: "#contact" }
                ].map((item) => (
                  <li key={item.label}>
                    <Link 
                      href={item.href} 
                      className="text-slate-300 hover:text-white transition-colors font-medium flex items-center gap-2 group"
                    >
                      <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-black uppercase tracking-widest mb-8 text-blue-400 flex items-center gap-2">
                <ChevronRight size={16} />
                Contact Us
              </h4>
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-bold text-slate-300 mb-2">General Inquiries</p>
                  <a href="mailto:admin@detemasecondary.ac.zw" className="text-blue-300 hover:text-blue-200 transition-colors font-medium">
                    admin@detemasecondary.ac.zw
                  </a>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-300 mb-2">Admissions Office</p>
                  <a href="tel:+2630123456789" className="text-blue-300 hover:text-blue-200 transition-colors font-medium">
                    +263 (0) 123 456 789
                  </a>
                </div>
                <div className="pt-4 border-t border-white/10">
                  <p className="text-slate-500 text-xs font-bold">P.O. Box 44, Detema Road</p>
                  <p className="text-slate-500 text-xs font-medium mt-1">Office Hours: Mon-Fri, 8AM-4PM</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] p-8 rounded-3xl border border-white/10 backdrop-blur-sm">
              <h4 className="text-sm font-black uppercase tracking-widest mb-4 text-blue-400">Stay Updated</h4>
              <p className="text-sm text-slate-300 mb-6 font-medium">
                Subscribe to receive term dates, event announcements, and school news.
              </p>
              <div className="space-y-4">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-500"
                />
                <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 py-3 rounded-xl text-sm font-black uppercase tracking-widest hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg">
                  Subscribe
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-4 font-medium">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </div>
          </div>
          
          <div className="pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-slate-500 text-xs font-black uppercase tracking-[0.2em]">
              © {new Date().getFullYear()} Detema Secondary School. All rights reserved.
            </p>
            <div className="flex gap-8 text-xs text-slate-500 font-medium">
              <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-slate-300 transition-colors">Accessibility</a>
            </div>
          </div>
        </div>
      </footer>
      
      <BackToTop />
    </main>
  );
}