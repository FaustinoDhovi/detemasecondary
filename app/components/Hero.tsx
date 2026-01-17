import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black pt-20">
      
      {/* Cinematic Background Image Layer */}
      <div className="absolute inset-0 z-0">
        <div className="relative w-full h-full overflow-hidden">
          <Image
            src="/detema_cover.jpg"
            alt="Detema Secondary School"
            fill
            className="object-cover animate-ken-burns"
            priority
          />
          {/* Gradient Overlays for Readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 z-10" />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column */}
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-white/80 text-sm font-bold tracking-wide uppercase">Leading Excellence in Education</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-black leading-none text-white">
              DETEMA<br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent italic">SECONDARY</span><br />
              SCHOOL
            </h1>

            <p className="text-xl text-gray-300 max-w-xl leading-relaxed font-medium drop-shadow-md">
              Empowering the next generation of thinkers and leaders through a rigorous academic environment focused on discipline and character development.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/apply"
                className="group relative bg-blue-600 text-white px-8 py-5 rounded-2xl font-bold text-lg overflow-hidden flex items-center justify-center gap-2 shadow-2xl hover:bg-blue-500 transition-all"
              >
                Enroll for 2026
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#about"
                className="px-8 py-5 rounded-2xl font-bold text-lg border-2 border-white/20 text-white backdrop-blur-sm hover:bg-white/10 transition-all text-center"
              >
                Learn More
              </Link>
            </div>
          </div>

          {/* Right Column - Large Logo Badge */}
          <div className="relative hidden lg:block animate-float">
            <div className="relative w-80 h-80 mx-auto">
              <div className="absolute inset-0 bg-white rounded-[3rem] shadow-[0_0_60px_rgba(37,99,235,0.3)] flex items-center justify-center p-12 transition-transform hover:rotate-3 duration-700">
                <Image
                  src="/logo.png"
                  alt="Detema Secondary School Logo"
                  width={240} 
                  height={240} 
                  className="object-contain"
                />
              </div>
              {/* Floating pass rate badge */}
              <div className="absolute -bottom-8 -right-8 bg-blue-600 text-white p-6 rounded-3xl shadow-2xl border-4 border-white">
                <div className="text-4xl font-black italic">53%</div>
                <div className="text-[10px] font-black uppercase tracking-tighter opacity-80">O-Level Pass Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}