import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { 
  Droplets, 
  Zap, 
  Hammer, 
  PaintBucket, 
  Snowflake, 
  Sparkles 
} from "lucide-react";

const servicesData = [
  { name: 'Plumbing', icon: <Droplets className="h-8 w-8 transition-colors duration-500" />, link: '/dashboard/jobs?category=Plumbing' },
  { name: 'Electrical', icon: <Zap className="h-8 w-8 transition-colors duration-500" />, link: '/dashboard/jobs?category=Electrical' },
  { name: 'Carpentry', icon: <Hammer className="h-8 w-8 transition-colors duration-500" />, link: '/dashboard/jobs?category=Carpentry' },
  { name: 'Painting', icon: <PaintBucket className="h-8 w-8 transition-colors duration-500" />, link: '/dashboard/jobs?category=Painting' },
  { name: 'AC Service', icon: <Snowflake className="h-8 w-8 transition-colors duration-500" />, link: '/dashboard/jobs?category=AC Service' },
  { name: 'Cleaning', icon: <Sparkles className="h-8 w-8 transition-colors duration-500" />, link: '/dashboard/jobs?category=Cleaning' },
];

import { useTheme } from '../Utils/Themeprovider';
import { Plus } from "lucide-react";

const PopularJobs = () => {
  const { theme } = useTheme();
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <section className="relative overflow-hidden bg-background py-16 md:py-32 transition-all duration-500 ease-in-out">
      
      {/* Background Decoration Blob */}
      <div className={`absolute -top-24 -right-24 h-96 w-96 rounded-full opacity-70 blur-3xl z-0 pointer-events-none transition-all duration-700 ${
        isDark ? "bg-gradient-to-tr from-blue-900/20 to-purple-900/20" : "bg-gradient-to-tr from-blue-100 to-purple-100"
      }`} />

      <div className="container relative z-10 mx-auto px-4">
        
        {/* Header Section */}
        <div className="mb-16 text-center">
          <span className={`text-sm font-bold uppercase tracking-[0.2em] transition-colors duration-500 ${
            isDark ? "text-blue-400" : "text-blue-600"
          }`}>
            Discover
          </span>
          <h2 className="mt-2 text-3xl font-extrabold text-foreground md:text-5xl transition-colors duration-500">
            Browse by Category
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground transition-colors duration-500">
            Find trusted professionals for every corner of your home.
          </p>
        </div>

        {/* Grid Section */}
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6 mt-8">
          {servicesData.map((service) => (
            <Link 
              key={service.name} 
              to={service.link}
              className="group block relative"
            >
              <div className={`flex flex-col items-center p-6 rounded-3xl border backdrop-blur-sm transition-all duration-500 hover:bg-blue-600 hover:border-blue-600 hover:shadow-[0_20px_50px_rgba(37,99,235,0.3)] hover:-translate-y-3 cursor-pointer overflow-hidden isolate ${
                isDark ? "!bg-zinc-900/50 !border-zinc-800" : "!bg-white/80 !border-slate-200"
              }`}>
                
                {/* Hover Background Accent */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />

                {/* Icon Container using Glass effect */}
                <div className={`mb-5 flex h-20 w-20 items-center justify-center rounded-2xl transition-all duration-500 group-hover:bg-white/20 group-hover:text-white group-hover:scale-110 shadow-sm border relative ${
                  isDark ? "!bg-zinc-800 !border-zinc-700/50 !text-blue-400" : "!bg-blue-50 !border-blue-100/50 !text-blue-600"
                }`}>
                  {service.icon}
                  <div className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Plus className="h-3 w-3" />
                  </div>
                </div>

                {/* Service Name */}
                <span className="text-base font-black text-foreground uppercase tracking-tight group-hover:text-white transition-colors duration-500 text-center leading-tight">
                  {service.name}
                </span>

                {/* Subtext info */}
                <span className="mt-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-blue-100 opacity-0 group-hover:opacity-100 transition-all duration-500">
                    Explore Jobs
                </span>
                
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
};

export default PopularJobs;