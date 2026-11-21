import React from "react";
import Link from "next/link";
import { ShieldCheck, Github, ExternalLink, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Vision */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-sky-600 flex items-center justify-center text-white font-bold text-xs">
                CW
              </div>
              <span className="font-bold text-white text-base">Collision Week</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md mb-3">
              A deterministic load balancing engine and sub-topic peer help system
              designed to resolve academic deadline clustering, prevent student burnout,
              and accelerate learning unblocking.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>
                100% Deterministic heuristic algorithms. Zero black-box LLM dependencies for scheduling.
              </span>
            </div>
          </div>

          {/* Col 2: Competition */}
          <div>
            <h4 className="text-slate-200 font-semibold mb-3 uppercase tracking-wider text-[11px]">
              Competition Entry
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <span className="text-slate-200 font-medium">STACK 2026 by GDGoC ITB</span>
              </li>
              <li>
                <span className="text-emerald-400">Case 1: Smarter Campus & Learning</span>
              </li>
              <li>
                <span>Theme: &quot;Agent of the Ocean: Vibing Beyond the Code&quot;</span>
              </li>
              <li>
                <span>Target: Semifinal Phase (Nov 2026)</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Team & Links */}
          <div>
            <h4 className="text-slate-200 font-semibold mb-3 uppercase tracking-wider text-[11px]">
              Team &quot;daftar krna gratis&quot;
            </h4>
            <ul className="space-y-1.5 text-slate-400 mb-4">
              <li>• Aldiansyah Fayruz (Lead / Core Logic)</li>
              <li>• Khadijah Passa (Frontend &amp; UI/UX)</li>
              <li>• Khalisha Kaylanasywa (Research &amp; Data)</li>
              <li>• Shiti Azzahra (PM, Proposal &amp; Video)</li>
            </ul>
            <a
              href="https://github.com/FayruzAldi/CollisionWeek.git"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sky-400 hover:text-sky-300 font-medium"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub Repository</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p>© 2026 Collision Week Team. Built for GDGoC ITB STACK 2026 Hackathon.</p>
          <div className="flex items-center gap-4">
            <Link href="/about" className="hover:text-slate-200 transition-colors">
              Empirical Research Evidence (53 Students Survey)
            </Link>
            <span className="text-slate-700">•</span>
            <Link href="/import" className="hover:text-slate-200 transition-colors">
              Final Day Milestones
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
