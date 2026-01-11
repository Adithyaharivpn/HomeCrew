import React from "react";
import { ShieldCheck, HeartHandshake, Tag, Star } from "lucide-react";
import PlaceHolder from "../../assets/Job.jpg";
import { Card } from "@/components/ui/card";
import { useTheme } from "../Utils/Themeprovider";

const FeatureRow = ({ icon, title, desc, isDark }) => (
  <div className={`flex items-start gap-4 p-4 rounded-xl transition-all duration-500 cursor-default group ${
    isDark ? "hover:bg-zinc-900/50" : "hover:bg-blue-50"
  }`}>
    {/* Icon Box */}
    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-all duration-500 ${
      isDark 
        ? "bg-zinc-800 text-blue-400 group-hover:bg-blue-500 group-hover:text-white" 
        : "bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"
    }`}>
      {icon}
    </div>
    
    {/* Text Content */}
    <div>
      <h4 className="text-lg font-bold text-foreground mb-1 transition-colors duration-500">{title}</h4>
      <p className="text-sm text-muted-foreground leading-relaxed transition-colors duration-500">
        {desc}
      </p>
    </div>
  </div>
);

const WhyChooseUs = () => {
  const { theme } = useTheme();
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <section className="relative overflow-hidden bg-background py-16 md:py-32 transition-colors duration-500">
      <div className="container mx-auto px-4 max-w-7xl">
        
        <div className="grid gap-12 md:grid-cols-2 items-center md:gap-24">
          
          {/* Left Side: Image Composition */}
          <div className="relative">
            
            {/* Background Decorator Box - Matches Blue Theme */}
            <div className={`absolute -top-8 -left-8 w-full h-full rounded-3xl -z-10 transition-all duration-500 ${
              isDark ? "bg-zinc-900/50" : "bg-blue-100/50"
            }`} />

            {/* Main Image */}
            <div className="relative overflow-hidden rounded-3xl shadow-2xl transition-transform duration-300 hover:scale-[1.02]">
              <img
                src={PlaceHolder}
                alt="Professional tradesperson at work"
                className="h-auto w-full object-cover grayscale-[10%] dark:grayscale-[40%] transition-all duration-500"
              />
            </div>

            {/* Floating Badge (Trust Signal) */}
            <Card className="absolute -bottom-6 -right-6 md:-bottom-10 md:-right-10 p-6 shadow-xl border-border bg-card flex items-center gap-4 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
              <div className="text-4xl font-extrabold text-blue-600 dark:text-blue-400">4.9</div>
              <div>
                <span className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Customer Rating
                </span>
                <div className="flex gap-0.5 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Right Side: Content */}
          <div>
            <div className="mb-2 text-sm font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 transition-colors duration-500">
              Why Choose Us
            </div>
            
            <h2 className="mb-6 text-3xl font-extrabold text-foreground md:text-5xl leading-tight transition-colors duration-500">
              Your Peace of Mind <br className="hidden md:block" />
              <span className="text-blue-600 dark:text-blue-400">Is Our Priority</span>
            </h2>

            <p className="mb-10 text-lg text-muted-foreground leading-relaxed transition-colors duration-500">
              We are committed to providing not just expert service, but a safe 
              and transparent experience from posting a job to the final handshake.
            </p>

            <div className="flex flex-col gap-2">
              <FeatureRow 
                isDark={isDark}
                icon={<ShieldCheck className="h-6 w-6" />} 
                title="Verified Professionals" 
                desc="Every tradesperson undergoes a strict background check before joining our platform."
              />
              <FeatureRow 
                isDark={isDark}
                icon={<HeartHandshake className="h-6 w-6" />} 
                title="Satisfaction Guaranteed" 
                desc="We hold payments in escrow until you verify the job is done to your satisfaction."
              />
              <FeatureRow 
                isDark={isDark}
                icon={<Tag className="h-6 w-6" />} 
                title="Transparent Pricing" 
                desc="Get multiple quotes instantly. No hidden fees or surprise charges at the end."
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;