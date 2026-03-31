"use client";

import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { motion } from "framer-motion";
import { Shield, Scale, Zap, FileText, CheckCircle, ArrowRight } from "lucide-react";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fbf9f6] text-stone-900 selection:bg-[#9a7b4f]/20 selection:text-stone-900">
      <Navbar />

      <main className="relative">
        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-[#9a7b4f]/5 to-transparent rounded-full blur-[120px]" />
        </div>

        {/* Hero Section */}
        <section className="relative max-w-7xl mx-auto px-6 pt-32 pb-40">
          <motion.div 
            initial="initial"
            animate="animate"
            variants={stagger}
            className="text-center"
          >
            <motion.div 
              variants={fadeIn}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-stone-200 bg-white shadow-sm mb-10"
            >
              <Scale className="w-4 h-4 text-[#9a7b4f]" />
              <span className="text-xs font-semibold text-stone-600 tracking-wide uppercase">
                AI-Powered Legal Intelligence
              </span>
            </motion.div>

            <motion.h1 
              variants={fadeIn}
              className="text-6xl sm:text-7xl lg:text-8xl font-serif font-medium tracking-tight leading-[1.05] mb-8 text-stone-950"
            >
              Understand contracts.
              <br />
              <span className="text-[#9a7b4f] italic">Without the degree.</span>
            </motion.h1>

            <motion.p 
              variants={fadeIn}
              className="max-w-2xl mx-auto text-xl text-stone-600 leading-relaxed mb-12"
            >
              LexAI uses state-of-the-art legal models to identify risks, spot hidden clauses, 
              and explain complex jargon in seconds.
            </motion.p>

            <motion.div 
              variants={fadeIn}
              className="flex flex-col sm:flex-row items-center justify-center gap-5"
            >
              <Link
                href="/sign-up"
                className="group relative inline-flex items-center gap-2.5 px-10 py-4 bg-stone-900 text-white font-semibold rounded-full shadow-2xl shadow-stone-900/20 hover:scale-[1.03] transition-all duration-300"
              >
                Analyze Your First Document
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/dashboard"
                className="px-10 py-4 text-stone-600 font-medium rounded-full border border-stone-200 hover:bg-stone-50 transition-all duration-300"
              >
                Explore Demo
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* Trust Logos / Badge */}
        <section className="max-w-5xl mx-auto px-6 pb-40">
          <div className="flex flex-col items-center">
            <p className="text-sm font-medium text-stone-400 uppercase tracking-widest mb-10">Trusted for precision</p>
            <div className="flex flex-wrap justify-center items-center gap-12 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
               {/* Placeholders for partner logos if any */}
               <div className="text-2xl font-serif font-bold">Lexington</div>
               <div className="text-2xl font-serif font-bold">Veritas</div>
               <div className="text-2xl font-serif font-bold">Aequitas</div>
               <div className="text-2xl font-serif font-bold">Justitia</div>
            </div>
          </div>
        </section>

        {/* Core Features */}
        <section className="max-w-7xl mx-auto px-6 pb-40">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <FileText className="w-7 h-7" />,
                title: "Deep Clause Extraction",
                description: "LexAI breaks down complex PDFs into individual, searchable clauses for granular analysis."
              },
              {
                icon: <Shield className="w-7 h-7" />,
                title: "Automated Risk Scoring",
                description: "Our legal-tuned model assigns risk levels to each clause based on industry standards."
              },
              {
                icon: <Zap className="w-7 h-7" />,
                title: "Instant Summarization",
                description: "Get a plain-English summary of hundred-page contracts in under ten seconds."
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                className="p-10 rounded-3xl bg-white border border-stone-100 shadow-sm shadow-stone-200/50 hover:shadow-xl hover:shadow-stone-200/40 transition-all duration-500"
              >
                <div className="inline-flex p-4 rounded-2xl bg-stone-50 text-[#9a7b4f] mb-8 ring-1 ring-stone-100">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-serif font-medium text-stone-950 mb-4">
                  {feature.title}
                </h3>
                <p className="text-stone-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Visual Showcase (Mock Dashboard) */}
        <section className="max-w-6xl mx-auto px-6 pb-40">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative rounded-[32px] overflow-hidden border border-stone-200 shadow-2xl bg-white p-4"
          >
            <div className="absolute top-0 left-0 right-0 h-12 bg-stone-50 border-b border-stone-100 flex items-center px-6 gap-2">
              <div className="w-3 h-3 rounded-full bg-stone-200" />
              <div className="w-3 h-3 rounded-full bg-stone-200" />
              <div className="w-3 h-3 rounded-full bg-stone-200" />
            </div>
            <div className="mt-12 h-[500px] bg-stone-50/50 flex items-center justify-center">
              <div className="text-stone-300 font-serif italic text-3xl">Visual Intelligence Suite</div>
            </div>
          </motion.div>
        </section>

        {/* Process Steps */}
        <section className="max-w-4xl mx-auto px-6 pb-40">
          <span className="block text-[#9a7b4f] font-semibold text-center uppercase tracking-widest text-sm mb-4">The Workflow</span>
          <h2 className="text-4xl font-serif text-center mb-20 text-stone-950">Simple. Rigorous. Proven.</h2>
          <div className="space-y-12">
            {[
              {
                step: "01",
                title: "Upload",
                desc: "Drag any PDF or Word document into our secure portal."
              },
              {
                step: "02",
                title: "Analyze",
                desc: "Our neural engine scans for pitfalls, liabilities, and opportunities."
              },
              {
                step: "03",
                title: "Navigate",
                desc: "Review highlights and expert recommendations in a unified view."
              }
            ].map((item, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-10 items-start group"
              >
                <div className="text-5xl font-serif italic text-stone-100 transition-colors group-hover:text-[#9a7b4f]/10">{item.step}</div>
                <div>
                  <h3 className="text-2xl font-serif font-medium text-stone-900 mb-2">{item.title}</h3>
                  <p className="text-stone-500 text-lg leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Footer CTA */}
        <section className="relative px-6 py-40 text-center overflow-hidden">
          <div className="absolute inset-0 bg-stone-950 -z-10" />
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl font-serif text-white mb-8">
              Protect your interests today.
            </h2>
            <p className="text-stone-400 mb-12 max-w-xl mx-auto text-lg leading-relaxed">
              Join thousands of professionals who use LexAI to navigate the complexities of legal language.
            </p>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 px-10 py-4 bg-[#9a7b4f] text-white font-semibold rounded-full shadow-2xl shadow-[#9a7b4f]/20 hover:bg-[#b08e5a] transition-all duration-300 hover:scale-[1.03]"
            >
              Get Started Free
            </Link>
          </motion.div>
        </section>
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-20 border-t border-stone-100">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-[#9a7b4f]" />
            <span className="text-lg font-serif font-bold text-stone-950">LexAI</span>
          </div>
          <div className="flex gap-8 text-sm text-stone-500 font-medium">
            <Link href="#" className="hover:text-stone-900 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-stone-900 transition-colors">Terms</Link>
            <Link href="#" className="hover:text-stone-900 transition-colors">Contact</Link>
          </div>
          <p className="text-sm text-stone-400">© 2026 LexAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
