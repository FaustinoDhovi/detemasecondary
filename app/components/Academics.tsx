import { BookOpen, Microscope, Palette, ChevronRight } from 'lucide-react';

const academicLevels = [
  {
    title: "Junior Secondary",
    years: "Form 1 - Form 2",
    desc: "Building a strong foundation in core sciences, humanities, and digital literacy.",
    icon: <BookOpen className="w-7 h-7" />,
    color: "from-blue-500 to-cyan-400",
    subjects: ["Mathematics", "General Science", "Computer Studies"]
  },
  {
    title: "O-Level Path",
    years: "Form 3 - Form 4",
    desc: "Specialized streams focusing on academic excellence and national examinations.",
    icon: <Microscope className="w-7 h-7" />,
    color: "from-indigo-500 to-blue-600",
    subjects: ["Physics & Chemistry", "Accounting", "Technical Drawing"]
  },
  {
    title: "A-Level Excellence",
    years: "Form 5 - Form 6",
    desc: "Advanced preparation for university entrance with a focus on critical research.",
    icon: <Palette className="w-7 h-7" />,
    color: "from-blue-600 to-indigo-800",
    subjects: ["Pure Maths", "Economics", "Literature in English"]
  }
];

export default function Academics() {
  return (
    <section className="py-24 bg-[#0a0f1d] relative overflow-hidden" id="academics">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.05),transparent_70%)]" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 uppercase tracking-tight">
            Academic <span className="text-blue-500">Pathways</span>
          </h2>
          <p className="text-blue-400 font-bold uppercase tracking-[0.3em] text-xs">Empowering Detema Scholars</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {academicLevels.map((level, index) => (
            <div 
              key={index} 
              className="group relative p-8 rounded-[2rem] bg-white/5 border border-white/10 hover:border-blue-500/50 transition-all duration-500 hover:-translate-y-3 overflow-hidden"
            >
              {/* Animated Glow on Hover */}
              <div className="absolute -right-20 -top-20 w-40 h-40 bg-blue-600/10 blur-3xl group-hover:bg-blue-600/30 transition-all duration-700" />
              
              <div className="relative z-10">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${level.color} flex items-center justify-center text-white mb-8 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                  {level.icon}
                </div>
                
                <span className="text-xs font-black tracking-widest text-blue-400 uppercase">
                  {level.years}
                </span>
                
                <h3 className="text-2xl font-bold text-white mt-3 mb-4 group-hover:text-blue-400 transition-colors">
                  {level.title}
                </h3>
                
                <p className="text-gray-400 text-sm leading-relaxed mb-8">
                  {level.desc}
                </p>

                <div className="space-y-3 mb-8">
                  {level.subjects.map((sub, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs font-semibold text-gray-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      {sub}
                    </div>
                  ))}
                </div>
                
                <button className="flex items-center gap-2 text-sm font-bold text-white group/btn hover:text-blue-400 transition-colors">
                  Learn More
                  <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Bottom Border Shimmer */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}