import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ShieldCheck, SunMedium } from 'lucide-react';

export const BrandValuesSection: React.FC = () => {
  const values = [
    {
      icon: Sparkles,
      title: 'Thoughtful Design',
      description:
        'Every line, proportion, and texture is considered with calm intentionality. We eliminate excess to reveal enduring character.',
    },
    {
      icon: ShieldCheck,
      title: 'Quality Over Quantity',
      description:
        'Crafted in limited small-batch firings and ethical ateliers using raw Japanese cotton, Mongolian cashmere, and solid brass.',
    },
    {
      icon: SunMedium,
      title: 'Made for Everyday Living',
      description:
        'Objects and garments engineered not to be placed on pedestals, but to develop richer beauty and patina with constant daily use.',
    },
  ];

  return (
    <section id="brand-values" className="scroll-mt-24 py-20 sm:py-28 bg-[#F8F6F1] px-4 sm:px-6 lg:px-8 border-t border-[#E4DED4]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-14">
          {values.map((v, i) => {
            const Icon = v.icon;
            return (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.6, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-start p-6 bg-white border border-[#E4DED4]/70 rounded-xs hover:border-[#D8C6AA] transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-[#EFE9DF] flex items-center justify-center text-[#777B63] mb-6">
                  <Icon className="w-5 h-5 stroke-[1.5]" />
                </div>
                <h3 className="font-serif text-2xl text-[#242522] font-normal">
                  {v.title}
                </h3>
                <p className="mt-3 text-xs sm:text-sm text-[#5A5C55] font-light leading-relaxed">
                  {v.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

