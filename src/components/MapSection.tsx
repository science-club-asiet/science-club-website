"use client";

import { motion } from "framer-motion";
import { MapPin, Navigation, Clock } from "lucide-react";
import type { LocationContent } from "@/lib/data/site";

export function MapSection({ location }: { location?: LocationContent }) {
  return (
    <section id="location" className="bg-white py-24 relative overflow-hidden border-t border-gray-200/50">
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        
        <div className="flex flex-col md:flex-row gap-12 items-start">
          
          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full md:w-1/3 flex flex-col pt-4"
          >
            <div className="flex items-center gap-4 mb-6">
              <span className="w-8 h-[2px] bg-red" />
              <span className="font-oswald uppercase text-red tracking-[0.2em] font-bold text-sm">Location</span>
            </div>

            <h2 className="font-oswald text-5xl lg:text-6xl font-bold uppercase tracking-tighter leading-none mb-8 text-navy">
              Find Our<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-navy to-navy/70">Headquarters.</span>
            </h2>

            <p className="font-inter text-gray-600 mb-10 text-lg leading-relaxed">
              We operate out of the heart of Adi Shankara Institute of Engineering and Technology. Drop by for weekly meetings, guest seminars, and impromptu brainstorming sessions.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4 group">
                <div className="w-10 h-10 rounded-full bg-navy/5 flex items-center justify-center shrink-0 group-hover:bg-red/10 transition-colors">
                  <MapPin className="w-5 h-5 text-navy group-hover:text-red transition-colors" />
                </div>
                <div>
                  <h4 className="font-oswald text-lg font-bold text-navy uppercase tracking-wide">Campus Address</h4>
                  <p className="font-inter text-gray-500 mt-1">{location?.address ?? "Adi Shankara Institute of Engineering and Technology, Kalady, Kerala - 683574"}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="w-10 h-10 rounded-full bg-navy/5 flex items-center justify-center shrink-0 group-hover:bg-red/10 transition-colors">
                  <Clock className="w-5 h-5 text-navy group-hover:text-red transition-colors" />
                </div>
                <div>
                  <h4 className="font-oswald text-lg font-bold text-navy uppercase tracking-wide">Meetup Timings</h4>
                  <p className="font-inter text-gray-500 mt-1 whitespace-pre-line">{location?.hours ?? "Mon - Fri: 9:00 AM - 4:00 PM\nWeekends: Closed (Except Events)"}</p>
                </div>
              </div>
            </div>

            <a 
              href={location?.maps_url || "https://www.google.com/maps/search/?api=1&query=Adi+Shankara+Institute+of+Engineering+and+Technology+Kalady+Kerala"}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-10 inline-flex items-center gap-2 bg-navy text-white px-8 py-4 font-oswald uppercase tracking-widest font-bold hover:bg-red transition-colors duration-300 w-fit group"
            >
              Get Directions
              <Navigation className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>

          {/* Interactive Map */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="w-full md:w-2/3 h-[500px] lg:h-[600px] rounded-3xl overflow-hidden shadow-2xl relative border-4 border-white"
          >
            {/* Map styling overlay to tint it slightly blue/navy if needed, though often hard with iframes. 
                Using a pointer-events-none overlay for a subtle glass effect around the edges */}
            <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.1)] pointer-events-none z-10 rounded-3xl"></div>
            
            <iframe 
              src={location?.embed_url ?? "https://www.google.com/maps?q=Adi+Shankara+Institute+of+Engineering+and+Technology,Kalady,Kerala&output=embed"}
              width="100%" 
              height="100%" 
              style={{ border: 0, filter: "contrast(1.1) saturate(0.9)" }} 
              allowFullScreen={false} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Adi Shankara Institute of Engineering and Technology Map"
              className="absolute inset-0 z-0"
            ></iframe>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
