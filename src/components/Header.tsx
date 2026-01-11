import { Book } from "lucide-react";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-charcoal bg-near-black/80 backdrop-blur-xl supports-backdrop-filter:bg-near-black/60">
      <div className="flex h-16 items-center justify-between px-4 max-w-7xl mx-auto sm:px-6 lg:px-8">
        {/* Logo Section */}
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-amber rounded-lg blur opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
            <div className="relative p-2 bg-charcoal border border-charcoal rounded-lg shadow-sm ring-1 ring-charcoal group-hover:ring-amber/50 transition-all duration-300">
              <Book className="w-5 h-5 text-off-white" />
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-off-white">
              BiblioQuest
            </span>
          </div>
        </div>
        <div className="hidden md:flex items-center text-sm font-medium text-muted-gray">
          <p>Transform classic literature into epic text-based adventures</p>
        </div>
      </div>
    </header>
  );
};
