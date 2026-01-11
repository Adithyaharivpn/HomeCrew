import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Mail, Handshake } from "lucide-react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const cardsData = [
  {
    id: 1,
    icon: <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />,
    title: "Step 1",
    subtitle: "Post a Job",
    description: "Describe your project details to get matched with the best pros in your area.",
  },
  {
    id: 2,
    icon: <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />,
    title: "Step 2",
    subtitle: "Get Quotes",
    description: "Receive estimates from vetted experts. Compare prices, profiles, and reviews.",
  },
  {
    id: 3,
    icon: <Handshake className="h-8 w-8 text-blue-600 dark:text-blue-400" />,
    title: "Step 3",
    subtitle: "Hire & Relax",
    description: "Choose your pro and get the job done. Use our secure code system for payment.",
  },
];

const HowItWorks = () => {
  const containerRef = useRef();

  useGSAP(() => {
    const items = gsap.utils.toArray(".timeline-item");
    let mm = gsap.matchMedia();

    mm.add({
      isDesktop: "(min-width: 768px)",
      isMobile: "(max-width: 767px)",
    }, (context) => {
      let { isDesktop } = context.conditions;
      items.forEach((item, index) => {
        let xStart = isDesktop ? (index % 2 === 0 ? -100 : 100) : 50;

        gsap.fromTo(item,
          { opacity: 0, x: xStart },
          {
            opacity: 1,
            x: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: item,
              start: "top 80%",
              end: "bottom 20%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    });
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="bg-background py-16 md:py-32 overflow-hidden transition-colors duration-500">
      <div className="container mx-auto px-4 relative">
        
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-24">
          <h2 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-500">
            How It Works
          </h2>
          <p className="mt-4 text-muted-foreground transition-colors duration-500">3 simple steps to get your home fixed.</p>
        </div>

        {/* Vertical Line (The Spine) - Adjusted colors for dark mode */}
        <div className="absolute left-8 md:left-1/2 top-32 bottom-32 w-1 bg-blue-100 dark:bg-zinc-800 -translate-x-1/2 hidden md:block transition-colors duration-500" />
        <div className="absolute left-8 top-32 bottom-0 w-1 bg-blue-100 dark:bg-zinc-800 -translate-x-1/2 md:hidden transition-colors duration-500" />

        <div className="space-y-12 md:space-y-24">
          {cardsData.map((card, index) => (
            <div 
              key={card.id} 
              className={`timeline-item relative flex flex-col md:flex-row items-center gap-8 ${
                index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              }`}
            >
              
              <div className="w-full md:w-5/12 pl-16 md:pl-0">
                <Card className={`relative shadow-lg border-border bg-card transition-all duration-500 hover:shadow-xl ${index % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                  
                  {/* Decorative Arrow (Desktop Only) - Background matches Card bg */}
                  <div className={`hidden md:block absolute top-1/2 -translate-y-1/2 h-4 w-4 rotate-45 border-t border-l border-border bg-card transition-all duration-500 ${
                    index % 2 === 0 ? "-right-2 border-r-0 border-b-0" : "-left-2 border-t-0 border-l-0 border-r border-b"
                  }`} />

                  <CardHeader>
                    <div className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-1 uppercase tracking-wider transition-colors duration-500">
                      {card.title}
                    </div>
                    <CardTitle className="text-2xl font-bold text-card-foreground transition-colors duration-500">
                      {card.subtitle}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed transition-colors duration-500">
                      {card.description}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* The Center Dot (Icon) - Adjusted for Dark Mode */}
              <div className="absolute left-8 md:left-1/2 -translate-x-1/2 flex h-16 w-16 items-center justify-center rounded-full bg-card border-4 border-muted shadow-lg z-10 transition-all duration-500">
                {card.icon}
              </div>

              <div className="hidden md:block w-5/12" />

            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;