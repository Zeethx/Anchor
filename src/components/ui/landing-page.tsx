"use client";

import { Anchor, ArrowRight, Zap, Target, Music, StickyNote, Flame, Smartphone, Apple, Share, MoreVertical, PlusSquare, Download, Compass } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function LandingPage() {
  const [platform, setPlatform] = useState<"ios" | "android">("ios");

  return (
    <div className="relative bg-background text-foreground selection:bg-primary/20">
      {/* Meditative Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -left-[10%] -top-[10%] h-[40%] w-[40%] rounded-full bg-primary/5 blur-[120px] animate-pulse" />
        <div className="absolute -right-[10%] -bottom-[10%] h-[40%] w-[40%] rounded-full bg-blue-500/5 blur-[120px] animate-pulse shadow-2xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-6 py-8 sm:py-12">
        {/* Navigation / Logo */}
        <nav className="mb-12 flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 overflow-hidden items-center justify-center rounded-xl text-primary-foreground shadow-lg shadow-primary/20 border border-primary/70">
              <img src="/logo.png" alt="Anchor Logo" className="h-full w-full object-cover animate-in zoom-in duration-700 delay-300" />
            </div>
            <span className="text-xl font-bold tracking-tight">Anchor</span>
          </div>
          <button 
            onClick={() => document.getElementById('install')?.scrollIntoView({ behavior: 'smooth' })}
            className="group flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-5 py-2 text-sm font-medium transition-all hover:bg-primary hover:text-white"
          >
            <Download size={16} className="text-primary group-hover:text-white transition-colors" />
            Install Guide
          </button>
        </nav>

        {/* Hero Section */}
        <section className="mb-32 text-center">
          <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-7xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
            Stay Grounded. <br />
            <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              Build Quietly.
            </span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-xl text-muted-foreground animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            A ritualistic space for daily reflection, habit tracking, and deep recall. 
            No noise. Just your progress, anchored.
          </p>
          <div className="animate-in fade-in zoom-in duration-1000 delay-500">
            <Link 
              href="/auth" 
              className="inline-flex h-14 items-center justify-center rounded-2xl bg-primary px-10 text-lg font-semibold text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
            >
              Anchor Your Day
            </Link>
          </div>
        </section>

        {/* Pillars / Features */}
        <section className="grid gap-6 sm:grid-cols-3 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-700">
          <Pillar 
            icon={<Zap className="text-amber-500" />} 
            title="Ritual" 
            description="Build consistent habits with a low-pressure, calming interface."
          />
          <Pillar 
            icon={<StickyNote className="text-blue-500" />} 
            title="Reflection" 
            description="Capture your day with guided notes and intentional word choices."
          />
          <Pillar 
            icon={<Flame className="text-orange-500" />} 
            title="Recall" 
            description="Navigate your history through a beautiful, island-style log view."
          />
        </section>

        {/* Feature Tease (Glassmorphism) */}
        <div className="mt-32 rounded-[2.5rem] border border-primary/10 bg-gradient-to-br from-primary/5 to-transparent p-8 sm:p-12 animate-in fade-in duration-1000 delay-1000">
          <div className="grid gap-12 sm:grid-cols-2 items-center">
             <div>
                <h2 className="mb-4 text-3xl font-bold tracking-tight">The Art of Consistency</h2>
                <p className="text-lg text-muted-foreground">
                  Anchor isn't just a tracker. It's a meditative experience. From your "Anchor for Today" to the song that stayed with you, every detail is designed for recall.
                </p>
             </div>
             <div className="relative">
                {/* Mockup / Abstract visual representing the Log UI */}
                <div className="rounded-2xl border border-white/20 bg-background/50 p-6 backdrop-blur-xl shadow-2xl skew-y-3 rotate-3 transition-transform hover:skew-y-0 hover:rotate-0 duration-700">
                  <div className="mb-4 h-2 w-12 rounded-full bg-primary/20" />
                  <div className="mb-2 h-4 w-3/4 rounded-full bg-foreground/10" />
                  <div className="mb-6 h-4 w-1/2 rounded-full bg-foreground/5" />
                  <div className="flex gap-2">
                    <div className="h-6 w-16 rounded-full bg-blue-500/10" />
                    <div className="h-6 w-20 rounded-full bg-primary/10" />
                  </div>
                </div>
                <div className="absolute -bottom-6 -left-6 rounded-2xl border border-white/20 bg-background/80 p-6 backdrop-blur-xl shadow-2xl -skew-y-6 -rotate-6 transition-transform hover:skew-y-0 hover:rotate-0 duration-1000">
                   <Music className="mb-2 text-primary" size={20} />
                   <div className="h-3 w-32 rounded-full bg-foreground/10" />
                </div>
             </div>
          </div>
        </div>

        {/* Installation Guide */}
        <section id="install" className="mt-40 scroll-mt-24 animate-in fade-in duration-1000 delay-[1100ms]">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Install Anchor</h2>
            <p className="text-muted-foreground">Add it to your home screen for a seamless experience.</p>
          </div>

          <div className="mx-auto max-w-xl">
            <div className="flex justify-center gap-4 mb-8">
              <button 
                onClick={() => setPlatform("ios")}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 rounded-2xl transition-all border",
                  platform === "ios" 
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" 
                    : "bg-muted/50 border-border hover:border-primary/50"
                )}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.96.95-2.04 2.14-3.41 2.14-1.31 0-1.76-.79-3.29-.79-1.54 0-2.05.77-3.29.79-1.35.02-2.5-1.24-3.41-2.14C2 18.67 1 15.65 1 12.83c0-4.59 2.97-7.01 5.86-7.01 1.54 0 2.89.84 3.79.84.9 0 2.44-.99 4.22-.81.75.03 2.85.3 4.19 2.26-1.1.66-1.85 1.74-1.85 3.33 0 1.94 1.58 3.32 3.65 4.1a12.65 12.65 0 0 1-1.86 3.74zM12.03 5.37c.81-1 1.34-2.39 1.19-3.77-1.18.05-2.61.79-3.46 1.79-.76.88-1.42 2.31-1.24 3.66 1.31.1 2.65-.63 3.51-1.68z"/>
                </svg>
                iOS
              </button>
              <button 
                onClick={() => setPlatform("android")}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 rounded-2xl transition-all border",
                  platform === "android" 
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" 
                    : "bg-muted/50 border-border hover:border-primary/50"
                )}
              >
                <Smartphone size={18} />
                Android
              </button>
            </div>

            <div className="p-8 rounded-[2rem] border border-border bg-card/50 backdrop-blur-sm">
              {platform === "ios" ? (
                <ul className="space-y-6">
                  <InstructionStep 
                    number="1" 
                    icon={<Compass size={18} className="text-primary" />} 
                    text="Open Anchor in Safari browser." 
                  />
                  <InstructionStep 
                    number="2" 
                    icon={<Share size={18} className="text-blue-500" />} 
                    text="Tap the Share button at the bottom of the screen." 
                  />
                  <InstructionStep 
                    number="3" 
                    icon={<PlusSquare size={18} className="text-amber-500" />} 
                    text="Scroll down and select 'Add to Home Screen'." 
                  />
                </ul>
              ) : (
                <ul className="space-y-6">
                  <InstructionStep 
                    number="1" 
                    icon={<Smartphone size={18} className="text-primary" />} 
                    text="Open Anchor in Chrome browser." 
                  />
                  <InstructionStep 
                    number="2" 
                    icon={<MoreVertical size={18} className="text-muted-foreground" />} 
                    text="Tap the menu (three dots) in the top right corner." 
                  />
                  <InstructionStep 
                    number="3" 
                    icon={<PlusSquare size={18} className="text-primary" />} 
                    text="Select 'Install App' or 'Add to Home Screen'." 
                  />
                </ul>
              )}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-40 border-t border-border/50 pt-12 text-center text-sm text-muted-foreground animate-in fade-in duration-1000 delay-[1200ms]">
          <p>© {new Date().getFullYear()} Anchor. Stay grounded.</p>
        </footer>
      </div>
    </div>
  );
}

function Pillar({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="group rounded-3xl border border-border bg-card p-8 transition-all hover:border-primary/50 hover:bg-muted/50 hover:shadow-2xl hover:shadow-primary/5">
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-background shadow-sm transition-transform group-hover:scale-110">
        {icon}
      </div>
      <h3 className="mb-3 text-xl font-bold tracking-tight">{title}</h3>
      <p className="leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}

function InstructionStep({ number, icon, text }: { number: string, icon: React.ReactNode, text: string }) {
  return (
    <li className="flex items-start gap-4 animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
        {number}
      </div>
      <div className="flex items-center gap-3 py-1">
        <span className="shrink-0">{icon}</span>
        <span className="text-base text-foreground/90 leading-snug">{text}</span>
      </div>
    </li>
  );
}
