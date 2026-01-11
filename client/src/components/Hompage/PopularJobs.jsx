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
  { name: 'Plumbing', icon: <Droplets className="h-8 w-8 transition-colors duration-500" />, link: '/jobspage?category=plumbing' },
  { name: 'Electrical', icon: <Zap className="h-8 w-8 transition-colors duration-500" />, link: '/jobspage?category=electrical' },
  { name: 'Carpentry', icon: <Hammer className="h-8 w-8 transition-colors duration-500" />, link: '/jobspage?category=carpentry' },
  { name: 'Painting', icon: <PaintBucket className="h-8 w-8 transition-colors duration-500" />, link: '/jobspage?category=painting' },
  { name: 'AC Service', icon: <Snowflake className="h-8 w-8 transition-colors duration-500" />, link: '/jobspage?category=ac-service' },
  { name: 'Cleaning', icon: <Sparkles className="h-8 w-8 transition-colors duration-500" />, link: '/jobspage?category=cleaning' },
];

const PopularJobs = () => {
  return (
    <section className="relative overflow-hidden bg-background py-16 md:py-32 transition-all duration-500 ease-in-out">
      
      {/* Background Decoration Blob */}
      <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-gradient-to-tr from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 opacity-70 blur-3xl z-0 pointer-events-none transition-all duration-700" />

      <div className="container relative z-10 mx-auto px-4">
        
        {/* Header Section */}
        <div className="mb-16 text-center">
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 transition-colors duration-500">
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
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {servicesData.map((service) => (
            <Link 
              key={service.name} 
              to={service.link}
              className="block h-full no-underline"
            >
              <Card className="group relative flex h-full flex-col items-center justify-center border-border bg-card py-8 transition-all duration-500 hover:-translate-y-2 hover:border-blue-500/50 hover:shadow-2xl cursor-pointer">
                <CardContent className="flex flex-col items-center p-0">
                  
                  {/* Icon Box */}
                  <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted text-blue-600 dark:text-blue-400 transition-all duration-500 group-hover:bg-blue-600 group-hover:text-white group-hover:rotate-[360deg]">
                    {service.icon}
                  </div>

                  {/* Text */}
                  <span className="text-lg font-bold text-card-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-500">
                    {service.name}
                  </span>
                  
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
};

export default PopularJobs;