"use client";

import { useEffect, useState } from 'react';

const stats = [
  { id: 1, value: 350, label: 'Enrolled Students', suffix: '', color: 'from-blue-600 to-indigo-600' },
  { id: 2, value: 53, label: 'O-Level Pass Rate', suffix: '%', color: 'from-indigo-600 to-blue-600' },
  { id: 3, value: 18, label: 'Specialist Staff', suffix: '+', color: 'from-blue-600 to-indigo-600' },
  { id: 4, value: 12, label: 'Sports Disciplines', suffix: '', color: 'from-indigo-600 to-blue-600' },
];

export default function StatsBar() {
  const [animatedValues, setAnimatedValues] = useState(stats.map(() => 0));

  useEffect(() => {
    const timers = stats.map((stat, index) => {
      const duration = 2000;
      const increment = stat.value / (duration / 16);
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= stat.value) {
          current = stat.value;
          clearInterval(timer);
        }
        setAnimatedValues(prev => {
          const newValues = [...prev];
          newValues[index] = Math.floor(current);
          return newValues;
        });
      }, 16);
      return timer;
    });
    return () => timers.forEach(timer => clearInterval(timer));
  }, []);

  return (
    <div className="bg-gray-950 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={stat.id} className="text-center group">
              <div className={`text-5xl font-black mb-2 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                {animatedValues[index]}{stat.suffix}
              </div>
              <div className="text-gray-400 font-bold uppercase tracking-widest text-xs">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}