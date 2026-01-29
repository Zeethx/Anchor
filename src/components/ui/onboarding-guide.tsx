// "use client";

// import { useEffect, useState } from "react";
// import { Check, Info, X } from "lucide-react";
// import { cn } from "@/lib/utils";

// export function OnboardingGuide() {
//   const [show, setShow] = useState(false);

//   useEffect(() => {
//     const seen = localStorage.getItem("anchor_onboarding_seen");
//     if (!seen) {
//       setShow(true);
//     }
//   }, []);

//   const dismiss = () => {
//     localStorage.setItem("anchor_onboarding_seen", "true");
//     setShow(false);
//   };

//   if (!show) return null;

//   return (
//     <div className="fixed inset-x-4 top-24 z-[100] animate-in fade-in slide-in-from-top-4 duration-500">
//       <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-background/95 p-6 shadow-2xl backdrop-blur-xl">
//         <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/5 blur-2xl" />
        
//         <div className="flex items-center justify-between mb-4">
//           <div className="flex items-center gap-2 text-primary font-bold">
//             <Info size={18} />
//             Getting Started
//           </div>
//           <button onClick={dismiss} className="text-muted-foreground hover:text-foreground p-1">
//             <X size={18} />
//           </button>
//         </div>

//         <div className="space-y-4">
//           <div className="flex items-start gap-3">
//             <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">1</div>
//             <p className="text-sm leading-relaxed text-muted-foreground">
//               <strong className="text-foreground">Internalize:</strong> Hold down on an affirmation until the progress bar completes.
//             </p>
//           </div>
//           <div className="flex items-start gap-3">
//             <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">2</div>
//             <p className="text-sm leading-relaxed text-muted-foreground">
//               <strong className="text-foreground">Habit Flow:</strong> Tap to complete a habit, or <strong className="text-foreground">swipe left</strong> to skip it for today.
//             </p>
//           </div>
//           <div className="flex items-start gap-3">
//             <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">3</div>
//             <p className="text-sm leading-relaxed text-muted-foreground">
//               <strong className="text-foreground">Anchor:</strong> Set one goal for the day and reflect in your daily note.
//             </p>
//           </div>
//         </div>

//         <button 
//           onClick={dismiss}
//           className="mt-6 w-full rounded-xl bg-primary py-3 font-bold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98]"
//         >
//           Got it
//         </button>
//       </div>
//     </div>
//   );
// }
