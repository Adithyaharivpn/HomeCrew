import React from "react";
import { Link } from "react-router-dom";
import { Hammer, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "../Utils/Themeprovider";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { motion } from "framer-motion";

const CTA = () => {
  const { theme } = useTheme();
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <div className="absolute inset-0 z-0">
          <div className={`absolute inset-0 ${isDark ? "bg-zinc-950" : "bg-blue-50"} opacity-90`} />
          <BackgroundBeams className="opacity-20" />
      </div>

      <div className="container relative z-10 mx-auto px-4 max-w-5xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6 bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
            Ready to Get Your Job Done?
          </h2>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Join thousands of satisfied homeowners and expert tradespeople connecting every day on HomeCrew.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-8">
            <Link to="/signup">
                <Button 
                    size="lg" 
                    className="w-full sm:w-auto text-lg h-14 px-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 font-bold"
                >
                    <Search className="mr-2 h-5 w-5" />
                    Find a Professional
                </Button>
            </Link>
            
            <Link to="/signup">
                <Button 
                    size="lg" 
                    variant="outline"
                    className="w-full sm:w-auto text-lg h-14 px-8 rounded-full border-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-bold"
                >
                    <Hammer className="mr-2 h-5 w-5" />
                    Join as a Pro
                </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
