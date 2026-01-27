import { AuthButton } from "@/components/auth-button";
import { Anchor } from "lucide-react";

export default function AuthPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="mb-8 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-primary/5">
        <img src="/logo.png" alt="Anchor Logo" className="h-full w-full object-cover" />
      </div>
      <h1 className="mb-2 text-2xl font-bold tracking-tight">Welcome to Anchor</h1>
      <p className="mb-8 max-w-xs text-muted-foreground">
        Your quiet daily operating system. Sign in to sync your progress.
      </p>
      
      <div className="w-full max-w-sm">
        <AuthButton />
      </div>
    </div>
  );
}
