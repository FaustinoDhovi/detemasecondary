import { Brain, Users, Trophy, Shield } from 'lucide-react';

const features = [
  {
    icon: <Brain />,
    title: "Academic Rigor",
    desc: "A curriculum designed to challenge and inspire critical thinking.",
    accent: "bg-blue-600"
  },
  {
    icon: <Users />,
    title: "Mentorship",
    desc: "Small class sizes ensuring every student receives personal guidance.",
    accent: "bg-indigo-600"
  },
  {
    icon: <Trophy />,
    title: "Excellence",
    desc: "A history of 100% pass rates in national examinations.",
    accent: "bg-cyan-600"
  },
  {
    icon: <Shield />,
    title: "Discipline",
    desc: "Fostering character and responsibility in a safe environment.",
    accent: "bg-blue-800"
  }
];

export default function Features() {
  return (
    <section className="py-24 bg-white" id="facilities">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 uppercase tracking-tighter">
              The Detema <span className="text-blue-600">Difference</span>
            </h2>
            <p className="text-gray-500 mt-4 text-lg">
              Providing modern facilities and traditional values to create well-rounded citizens.
            </p>
          </div>
          <div className="hidden md:block h-px flex-1 bg-gray-100 mx-12 mb-4" />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div 
              key={i} 
              className="group p-8 rounded-[2.5rem] bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] transition-all duration-500"
            >
              <div className={`w-14 h-14 rounded-2xl ${f.accent} text-white flex items-center justify-center mb-8 shadow-lg group-hover:rotate-[10deg] transition-transform`}>
                {f.icon}
              </div>
              <h3 className="text-xl font-extrabold text-gray-900 mb-4">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                {f.desc}
              </p>
              <div className={`h-1.5 w-8 rounded-full ${f.accent} group-hover:w-full transition-all duration-500`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}