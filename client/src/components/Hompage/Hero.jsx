import React from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/Utils/Themeprovider";

const Hero = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const heroStyle = {
    background: isDark
      ? "linear-gradient(to bottom right, #18181b, #09090b, #000000)"
      : "linear-gradient(to bottom right, #1d4ed8, #2563eb, #1e40af)",
  };

  return (
    <div
      style={heroStyle}
      className="relative overflow-hidden pt-32 pb-48 md:pt-52 md:pb-64 text-center rounded-b-[3rem] md:rounded-b-[50%_8%] shadow-2xl transition-all duration-500"
    >
      <div className="container mx-auto max-w-4xl px-4">
        <h1 className="mb-6 text-4xl md:text-6xl font-black leading-tight tracking-tight text-white">
          Home Repairs,{" "}
          <span className={isDark ? "text-blue-400" : "text-blue-200"}>
            Simplified.
          </span>
        </h1>

        <p
          className={`mb-12 max-w-2xl mx-auto text-lg md:text-xl font-normal leading-relaxed ${
            isDark ? "text-zinc-400" : "text-blue-100"
          }`}
        >
          Connect with verified local tradespeople in seconds. Use our map to
          find help near you, verify work, and pay securely.
        </p>

        <div
          className="mx-auto flex max-w-150 items-center rounded-full 
  bg-white! dark:bg-zinc-900! 
  border border-slate-200 dark:border-zinc-800 
  p-2 shadow-xl transition-transform hover:scale-[1.02] duration-200 ease-out"
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
            placeholder="What do you need help with? (e.g., Plumbing)"
            className="flex-1 border-none bg-transparent py-3 
      text-slate-700 dark:text-zinc-200 
      placeholder:text-slate-400 dark:placeholder:text-zinc-500 
      focus:outline-none focus:ring-0 text-base md:text-lg"
          />

          <Button
            size="lg"
            onClick={() => navigate("/login")}
            className="rounded-full bg-blue-600 dark:bg-blue-500 px-8 py-6 text-base font-bold text-white shadow-lg hover:bg-blue-700 dark:hover:bg-blue-400 transition-all"
          >
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
