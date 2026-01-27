import { AuthButton } from "@/components/auth-button";
import { Anchor } from "lucide-react";

export default function AuthPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Anchor size={32} />
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
