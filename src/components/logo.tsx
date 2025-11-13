import { ShieldCheck } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center justify-center gap-3">
        <div className="relative">
          <ShieldCheck className="h-12 w-12 text-primary animate-pulse" aria-hidden="true" />
          <div className="absolute inset-0 h-12 w-12 text-primary animate-ping opacity-20" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-in">
            The Solana Sentinel
        </h1>
    </div>
  )
}
