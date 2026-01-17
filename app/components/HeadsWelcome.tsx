import { Quote, Star } from 'lucide-react';

export default function HeadsWelcome() {
  return (
    <section className="py-24 bg-white" id="about">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gray-200 aspect-[4/5]">
              {/* FIXED: Replaced plain text with an <img> tag */}
              <img 
                src="/head.jpg" 
                alt="Mr. J. Dube - Headmaster" 
                className="w-full h-full object-cover"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 to-transparent" />
              <div className="absolute bottom-8 left-8 text-white">
                <p className="text-2xl font-bold">Mr. J. Dube</p>
                <p className="text-blue-200 uppercase tracking-widest text-sm font-bold">Headmaster</p>
              </div>
            </div>
            <div className="absolute -top-6 -right-6 bg-blue-600 text-white p-8 rounded-2xl shadow-xl hidden md:block">
              <div className="text-4xl font-black">20+</div>
              <div className="text-xs font-bold uppercase tracking-widest opacity-80">Years of Service</div>
            </div>
          </div>

          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight uppercase">
              A Word from our <span className="text-blue-600">Headmaster</span>
            </h2>
            <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
              <p className="italic font-medium text-gray-900 border-l-4 border-blue-600 pl-6">
                "At Detema Secondary School, we believe that every student has the potential to excel. Our goal is to provide the discipline and support needed to turn that potential into reality."
              </p>
              <p>
                We are committed to maintaining a high standard of academic achievement while fostering a sense of community and responsibility. Our facilities are designed to support both classroom learning and personal growth.
              </p>
              <p>
                Welcome to our school community, where we build futures together.
              </p>
            </div>
            <button className="bg-gray-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-600 transition-colors">
              Our Mission & Vision
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}