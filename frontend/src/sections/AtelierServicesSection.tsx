import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Scissors, Truck, RefreshCw, Quote } from 'lucide-react';

const SERVICES = [
  {
    icon: Scissors,
    title: 'Complimentary Bespoke Tailoring',
    description: 'We offer complimentary sleeve, waist, and hem adjustments to ensure an architectural drape tailored to your proportions.',
  },
  {
    icon: ShieldCheck,
    title: 'White-Glove Styling Concierge',
    description: 'Direct consultation through our AI Styliste and private atelier stylists for black-tie galas, weddings, and executive wardrobes.',
  },
  {
    icon: Truck,
    title: 'Insured Atelier Express Dispatch',
    description: 'Packaged in plastic-free archival gift boxes made from FSC-certified recycled handmade cotton paper.',
  },
  {
    icon: RefreshCw,
    title: 'Lifetime Craft Guarantee',
    description: 'Complimentary seam reinforcement, button replacement, and garment care guidance for the entire lifetime of your piece.',
  },
];

const PRESS_QUOTES = [
  {
    publication: 'Vogue India',
    quote: 'AVELUNE redefines quiet luxury with an uncompromised devotion to handloom heritage and razor-sharp modern silhouettes.',
    edition: 'Autumn Edit 2026',
  },
  {
    publication: 'GQ Style Issue',
    quote: 'The sateen evening shirts and jacquard trousers represent the rare sweet spot between supreme Italian tailoring and accessible value.',
    edition: 'October 2026',
  },
  {
    publication: 'Architectural Digest',
    quote: 'A masterclass in restraint. Every garment feels like a considered piece of wearable architecture.',
    edition: 'Design & Living 2026',
  },
];

export const AtelierServicesSection: React.FC = () => {
  return (
    <section className="py-24 sm:py-32 bg-[#EFE9DF]/30 px-4 sm:px-6 lg:px-12 border-b border-[#E4DED4]">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest-luxury text-[#777B63] font-medium block mb-3">
            The Atelier Experience
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl text-[#242522] font-normal tracking-tight">
            The Privileged Circle
          </h2>
          <p className="text-sm text-[#5A5C55] font-light mt-3 leading-relaxed">
            Our commitment to you does not end at checkout. Every client enters our circle of lifetime service.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
          {SERVICES.map((srv, idx) => {
            const Icon = srv.icon;
            return (
              <motion.div
                key={srv.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="p-8 bg-[#F8F6F1] border border-[#E4DED4] rounded-xs shadow-xs"
              >
                <div className="w-10 h-10 rounded-full bg-[#EFE9DF] flex items-center justify-center mb-5 text-[#242522]">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg text-[#242522] font-medium mb-2">
                  {srv.title}
                </h3>
                <p className="text-xs text-[#5A5C55] font-light leading-relaxed">
                  {srv.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Press Accolades Editorial Quote Banner */}
        <div className="border-t border-[#DCD5C9] pt-16">
          <div className="text-center mb-10">
            <span className="text-[10px] uppercase tracking-widest-luxury text-[#777B63] font-mono">
              Critical Acclaim
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PRESS_QUOTES.map((item, idx) => (
              <motion.div
                key={item.publication}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                className="p-6 bg-white border border-[#E4DED4] rounded-xs relative flex flex-col justify-between"
              >
                <Quote className="w-6 h-6 text-[#D8C6AA]/40 mb-3" />
                <p className="font-serif text-sm sm:text-base text-[#242522] italic leading-relaxed">
                  "{item.quote}"
                </p>
                <div className="mt-6 pt-4 border-t border-[#EFE9DF] flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#242522]">
                    {item.publication}
                  </span>
                  <span className="text-[10px] text-[#777B63] font-mono">
                    {item.edition}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

