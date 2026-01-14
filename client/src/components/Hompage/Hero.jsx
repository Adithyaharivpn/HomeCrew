import React from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/Utils/Themeprovider";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";
import { BackgroundBeams } from "@/components/ui/background-beams";

const Hero = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const [searchQuery, setSearchQuery] = React.useState("");

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/dashboard/jobs?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/dashboard/jobs");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const heroStyle = {
    background: isDark
      ? "linear-gradient(to bottom right, #18181b, #09090b, #000000)"
      : "linear-gradient(to bottom right, #1d4ed8, #2563eb, #1e40af)",
  };

  return (
    <div
      style={heroStyle}
      className="relative overflow-hidden pt-32 pb-48 md:pt-52 md:pb-64 text-center shadow-2xl transition-all duration-500"
    >
      <BackgroundBeams className="absolute top-0 left-0 w-full h-full z-0 opacity-70" />
      <div className="container mx-auto max-w-4xl pl-2 relative z-10">
        <TypewriterEffectSmooth
          words={[
            { text: "Home" },
            { text: "Repairs," },
            { 
              text: "Simplified.", 
              className: isDark ? "text-blue-400" : "text-white underline decoration-white/20 underline-offset-8" 
            }
          ]}
          className="mb-8 justify-center"
        />

        <p
          className={`mb-12 max-w-2xl mx-auto text-lg md:text-xl font-normal leading-relaxed ${
            isDark ? "text-zinc-400" : "text-blue-100"
          }`}
        >
          Connect with verified local tradespeople in seconds. Use our marketplace to
          find help near you, verify work, and pay securely.
        </p>
          {/* Search Bar */}
        <div
          className={`mx-auto flex max-w-2xl items-center rounded-full border p-2 shadow-2xl transition-all duration-300 focus-within:ring-4 focus-within:ring-blue-500/20 ${
            isDark 
              ? "!bg-zinc-900 !border-zinc-800" 
              : "!bg-white !border-slate-200"
          }`}
        >
          <div className="pl-4 pr-2">
            <Search
              className={`h-6 w-6 ${
                isDark ? "text-blue-400" : "text-blue-600"
              }`}
            />
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search services..."
            className="flex-1 border-none bg-transparent py-3 
      text-slate-700 dark:text-zinc-200 
      placeholder:text-slate-400 dark:placeholder:text-zinc-500 
      focus:outline-none focus:ring-0 text-base md:text-lg md:pr-0"
          />

          <Button
            onClick={handleSearch}
            className="rounded-full bg-blue-600 dark:bg-blue-500 px-6 py-3 md:px-10 md:py-6 text-base font-bold text-white shadow-lg hover:bg-blue-700 dark:hover:bg-blue-400 transition-all transform hover:scale-105 active:scale-95"
          >
            Search
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
