import { ShieldCheck } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center justify-center gap-3">
        <ShieldCheck className="h-10 w-10 text-primary" />
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-slate-600 dark:to-slate-400 text-transparent bg-clip-text">
            The Solana Sentinel
        </h1>
    </div>
  )
}
