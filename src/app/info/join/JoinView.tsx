"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import type { Faq } from "@/lib/data/content";
import { createClient } from "@/lib/supabase/client";

// perks (string list) + faqs are fetched from Supabase and passed in as props.

export function JoinView({ perks, faqs }: { perks: string[]; faqs: Faq[] }) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", dept: "", year: "", why: "" });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // honeypot — silently ignore bots
    if ((e.currentTarget.querySelector<HTMLInputElement>("#hp_website")?.value ?? "").trim()) return;

    setSubmitting(true);
    setError(null);
    const { error } = await createClient().from("membership_applications").insert({
      name: form.name,
      email: form.email,
      department: form.dept || null,
      year_of_study: form.year || null,
      motivation: form.why || null,
    });
    setSubmitting(false);

    if (error) {
      setError("Something went wrong — please try again.");
      return;
    }
    setSubmitted(true);
  };

  return (
    <div className="font-inter text-navy">

      {/* Hero */}
      <section className="bg-navy text-white py-32 md:py-44 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-1/2 h-full opacity-10 pointer-events-none">
          <Image src="https://images.unsplash.com/photo-1581093450021-4a7360e9a6b5?q=80&w=1200&auto=format&fit=crop" fill sizes="50vw" className="object-cover" alt="" />
        </div>
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 text-red font-oswald uppercase tracking-[0.3em] text-sm font-bold mb-6">
              <span className="w-8 h-[2px] bg-red" /> Info
            </span>
            <h1 className="font-oswald text-6xl md:text-8xl lg:text-[9rem] font-bold uppercase leading-[0.9] tracking-tight mb-8">
              Join<br /><span className="text-red">The Club</span>
            </h1>
            <p className="text-white/60 text-lg max-w-xl leading-relaxed">
              Membership is open to all ASIET students. Fill out the form and we will be in touch within 48 hours.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Perks + Form */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* Left — perks */}
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <span className="flex items-center gap-2 text-red font-oswald uppercase tracking-[0.25em] text-xs font-bold mb-8">
              <span className="w-6 h-[2px] bg-red" /> What You Get
            </span>
            <h2 className="font-oswald text-4xl font-bold uppercase text-navy mb-10">Member Benefits</h2>
            <ul className="flex flex-col gap-5">
              {perks.map((p, i) => (
                <motion.li key={p} initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, delay: i * 0.07 }} className="flex items-start gap-4">
                  <CheckCircle2 className="w-5 h-5 text-red flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600 text-base">{p}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Right — form */}
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}>
            {submitted ? (
              <div className="flex flex-col items-center justify-center text-center gap-6 py-20 border-2 border-dashed border-red/30 rounded-3xl">
                <CheckCircle2 className="w-16 h-16 text-red" />
                <h3 className="font-oswald text-3xl font-bold uppercase text-navy">Application Received!</h3>
                <p className="text-gray-500 max-w-xs">We review applications every Monday. Expect a reply within 48 hours at {form.email}.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-8 rounded-3xl border border-gray-100 shadow-sm">
                <input id="hp_website" name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
                <span className="flex items-center gap-2 text-red font-oswald uppercase tracking-[0.25em] text-xs font-bold mb-2">
                  <span className="w-6 h-[2px] bg-red" /> Application Form
                </span>

                {[
                  { id: "name",  label: "Full Name",               type: "text",  placeholder: "e.g. Arjun Menon" },
                  { id: "email", label: "College Email",            type: "email", placeholder: "you@asiet.ac.in" },
                  { id: "dept",  label: "Department",               type: "text",  placeholder: "e.g. Computer Science" },
                  { id: "year",  label: "Year of Study",            type: "text",  placeholder: "e.g. 2nd Year" },
                ].map((field) => (
                  <div key={field.id} className="flex flex-col gap-1.5">
                    <label htmlFor={field.id} className="text-xs font-semibold uppercase tracking-widest text-gray-400">{field.label}</label>
                    <input
                      id={field.id}
                      type={field.type}
                      required
                      placeholder={field.placeholder}
                      value={form[field.id as keyof typeof form]}
                      onChange={(e) => setForm(f => ({ ...f, [field.id]: e.target.value }))}
                      className="border border-gray-200 rounded-xl px-4 py-3 text-navy text-sm focus:outline-none focus:border-red transition-colors placeholder:text-gray-300"
                    />
                  </div>
                ))}

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="why" className="text-xs font-semibold uppercase tracking-widest text-gray-400">Why do you want to join?</label>
                  <textarea
                    id="why"
                    rows={4}
                    required
                    placeholder="Tell us what drives your curiosity..."
                    value={form.why}
                    onChange={(e) => setForm(f => ({ ...f, why: e.target.value }))}
                    className="border border-gray-200 rounded-xl px-4 py-3 text-navy text-sm focus:outline-none focus:border-red transition-colors placeholder:text-gray-300 resize-none"
                  />
                </div>

                {error && <p className="text-red text-sm font-inter -mb-1">{error}</p>}
                <button type="submit" disabled={submitting} className="mt-2 bg-navy text-white py-3.5 rounded-full font-oswald uppercase tracking-widest text-sm font-bold hover:bg-red transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                  {submitting ? "Submitting..." : "Submit Application"} <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-[#FAFAFA]">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <span className="flex items-center gap-2 text-red font-oswald uppercase tracking-[0.25em] text-xs font-bold mb-12">
            <span className="w-6 h-[2px] bg-red" /> FAQs
          </span>
          <div className="flex flex-col divide-y divide-gray-100">
            {faqs.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, delay: i * 0.08 }} className="py-7">
                <h3 className="font-oswald text-xl font-bold uppercase text-navy mb-3">{f.q}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
