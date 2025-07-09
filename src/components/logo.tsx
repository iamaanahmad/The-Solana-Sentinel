
export function Logo() {
  return (
    <div className="flex items-center justify-center gap-3">
        <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 2Z" fill="#293B5F"/>
            <circle cx="11.5" cy="11.5" r="3" stroke="#D68430" stroke-width="1.5"/>
            <path d="M13.5 13.5L16" stroke="#D68430" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-slate-600 dark:to-slate-400 text-transparent bg-clip-text">
            The Solana Sentinel
        </h1>
    </div>
  )
}
