import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import HeadsWelcome from './components/HeadsWelcome';
import Academics from './components/Academics';
import StatsBar from './components/StatsBar';
import BackToTop from './components/BackToTop';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      
      <div className="animate-fade-in">
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
      
      {/* Final Call to Action */}
      <section className="py-24 bg-blue-600 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="max-w-4xl mx-auto px-6 text-center text-white relative z-10">
          <h2 className="text-5xl font-black mb-6 tracking-tighter">Ready to join our community?</h2>
          <p className="text-xl mb-10 opacity-90 font-medium max-w-2xl mx-auto">
            Applications for the 2026 Academic Year are currently being processed. Secure your child's future today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/apply" className="bg-white text-blue-600 px-10 py-5 rounded-2xl font-black text-lg hover:scale-105 transition-transform shadow-2xl">
              APPLY ONLINE NOW
            </Link>
            <Link href="/portal" className="bg-blue-700 text-white px-10 py-5 rounded-2xl font-black text-lg border border-white/20 hover:bg-blue-800 transition-all">
              STUDENT PORTAL
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-white py-20" id="contact">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg border border-white/20">
                  <div className="text-blue-600 font-black text-xl">D</div>
                </div>
                <div>
                  <div className="text-xl font-black tracking-tighter">DETEMA</div>
                  <div className="text-[10px] text-blue-400 font-bold uppercase tracking-widest leading-none">Secondary School</div>
                </div>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Nurturing a generation of disciplined thinkers and innovative leaders through academic excellence.
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-black uppercase tracking-widest mb-8 text-blue-400">Navigation</h4>
              <ul className="space-y-4 text-sm font-bold text-slate-300">
                <li><Link href="/apply" className="hover:text-white transition-colors">Admissions 2026</Link></li>
                <li><Link href="/portal" className="hover:text-white transition-colors">Student Portal</Link></li>
                <li><Link href="#academics" className="hover:text-white transition-colors">Curriculum</Link></li>
                <li><Link href="#facilities" className="hover:text-white transition-colors">Facilities</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-black uppercase tracking-widest mb-8 text-blue-400">Contact Us</h4>
              <p className="text-slate-400 text-sm font-bold">admin@detemasecondary.ac.zw</p>
              <p className="text-slate-400 text-sm font-bold mt-2">+263 (0) 123 456 789</p>
              <p className="text-slate-500 text-xs mt-4">P.O. Box 44, Detema Road</p>
            </div>

            <div className="bg-white/5 p-8 rounded-3xl border border-white/10">
              <h4 className="text-sm font-black uppercase tracking-widest mb-4">Newsletters</h4>
              <p className="text-xs text-slate-400 mb-4 font-medium">Get term dates and event updates.</p>
              <div className="flex flex-col gap-2">
                <input type="email" placeholder="Email" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-blue-500 outline-none" />
                <button className="bg-blue-600 py-3 rounded-xl text-xs font-black uppercase tracking-widest">Join</button>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/5 text-center">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
              © {new Date().getFullYear()} Detema Secondary School. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
      <BackToTop />
    </main>
  );
}