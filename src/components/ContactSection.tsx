"use client";

import { motion } from "framer-motion";
import { Mail, Send } from "lucide-react";
import type { ContactContent } from "@/lib/data/site";
import { createClient } from "@/lib/supabase/client";

const Github = (props: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A4.8 4.8 0 0 0 8 18v4"/><path d="M12 18v4"/><path d="M8 22v-4"/></svg>;
const Linkedin = (props: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>;
const Instagram = (props: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>;
import { useState } from "react";

export function ContactSection({ contact }: { contact?: ContactContent }) {
  const email = contact?.email ?? "hello@asietscience.club";
  const socials = contact?.socials ?? {};
  const [formState, setFormState] = useState<{
    status: "idle" | "submitting" | "success" | "error";
    error?: string;
  }>({ status: "idle" });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    const val = (id: string) =>
      formEl.querySelector<HTMLInputElement | HTMLTextAreaElement>(`#${id}`)?.value.trim() ?? "";

    if (val("hp_company")) return; // honeypot — silently ignore bots

    setFormState({ status: "submitting" });
    const { error } = await createClient().from("contact_submissions").insert({
      name: val("name") || null,
      email: val("email"),
      subject: val("subject") || null,
      message: val("message"),
    });

    if (error) {
      setFormState({ status: "error", error: "Something went wrong — please try again." });
      return;
    }
    formEl.reset();
    setFormState({ status: "success" });
    setTimeout(() => setFormState({ status: "idle" }), 4000);
  };

  return (
    <section id="contact" className="bg-navy py-24 lg:py-32 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-red/5 rounded-full blur-[120px] pointer-events-none translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-[100px] pointer-events-none -translate-x-1/3 translate-y-1/3" />

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
          
          {/* Left Column: Info & Socials */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="w-full lg:w-5/12 flex flex-col"
          >
            <div className="flex items-center gap-4 mb-6">
              <span className="w-12 h-[2px] bg-red" />
              <span className="font-oswald uppercase text-red tracking-[0.3em] font-bold text-sm">Reach Out</span>
            </div>

            <h2 className="font-oswald text-6xl lg:text-8xl font-bold uppercase tracking-tighter leading-[0.85] mb-10 text-white">
              Let&apos;s <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red to-red/70">Connect.</span>
            </h2>

            <p className="font-inter text-white/70 text-lg leading-relaxed mb-12 max-w-md">
              {contact?.blurb ?? "Have a question about joining, a partnership proposal, or just want to nerd out about science? Drop us a message."}
            </p>

            <div className="space-y-8 mb-16">
              <a href={`mailto:${email}`} className="group flex items-center gap-6 text-white hover:text-red transition-colors w-fit">
                <div className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center group-hover:border-red transition-colors">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-oswald text-sm text-white/50 tracking-widest uppercase mb-1">Email Us</p>
                  <p className="font-inter text-xl font-medium">{email}</p>
                </div>
              </a>
            </div>

            {/* Social Links */}
            <div>
              <p className="font-oswald text-sm text-white/50 tracking-widest uppercase mb-6">Socials</p>
              <div className="flex gap-4">
                {[
                  { icon: Instagram, href: socials.instagram ?? "#" },
                  { icon: Linkedin, href: socials.linkedin ?? "#" },
                  { icon: Github, href: socials.github ?? "#" },
                ].map((social, i) => (
                  <a 
                    key={i}
                    href={social.href}
                    className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-red hover:scale-110 transition-all duration-300"
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Column: Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="w-full lg:w-7/12"
          >
            <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-md border border-white/10 p-8 md:p-12 rounded-3xl flex flex-col gap-8">
              {/* Honeypot: hidden from humans, bots fill it → submission ignored */}
              <input id="hp_company" name="company" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-2 relative group">
                  <label htmlFor="name" className="font-oswald text-xs uppercase tracking-widest text-white/70">Full Name</label>
                  <input 
                    type="text" 
                    id="name"
                    required
                    className="bg-transparent border-b border-white/20 pb-2 text-white font-inter text-lg focus:outline-none focus:border-red transition-colors w-full"
                    placeholder="John Doe"
                  />
                </div>
                
                <div className="flex flex-col gap-2 relative group">
                  <label htmlFor="email" className="font-oswald text-xs uppercase tracking-widest text-white/70">Email Address</label>
                  <input 
                    type="email" 
                    id="email"
                    required
                    className="bg-transparent border-b border-white/20 pb-2 text-white font-inter text-lg focus:outline-none focus:border-red transition-colors w-full"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 relative group">
                <label htmlFor="subject" className="font-oswald text-xs uppercase tracking-widest text-white/70">Subject (Optional)</label>
                <input 
                  type="text" 
                  id="subject"
                  className="bg-transparent border-b border-white/20 pb-2 text-white font-inter text-lg focus:outline-none focus:border-red transition-colors w-full"
                  placeholder="How can we help?"
                />
              </div>

              <div className="flex flex-col gap-2 relative group">
                <label htmlFor="message" className="font-oswald text-xs uppercase tracking-widest text-white/70">Message</label>
                <textarea 
                  id="message"
                  required
                  rows={4}
                  className="bg-transparent border-b border-white/20 pb-2 text-white font-inter text-lg focus:outline-none focus:border-red transition-colors w-full resize-none"
                  placeholder="Tell us about your project or inquiry..."
                ></textarea>
              </div>

              <button 
                type="submit"
                disabled={formState.status === "submitting"}
                className="mt-4 group relative h-16 w-full sm:w-auto sm:px-12 bg-white rounded-full flex items-center justify-center overflow-hidden hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-70 disabled:hover:scale-100"
              >
                <div className="absolute inset-0 bg-red translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-[0.22,1,0.36,1] z-0" />
                
                <div className="relative z-10 flex items-center gap-3">
                  <span className={`font-oswald text-lg font-bold tracking-widest uppercase transition-colors duration-300 ${formState.status === 'idle' ? 'text-navy group-hover:text-white' : 'text-navy'}`}>
                    {formState.status === "submitting" ? "Sending..." :
                     formState.status === "success" ? "Message Sent" : "Send Message"}
                  </span>
                  {formState.status === "idle" && (
                    <Send className="w-5 h-5 text-navy group-hover:text-white transition-colors duration-300" />
                  )}
                </div>
              </button>

              {formState.status === "error" && (
                <p className="font-inter text-sm text-red">{formState.error}</p>
              )}

            </form>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
