import React from "react";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";

const testimonials = [
  {
    name: "Priya S.",
    title: "Kakkanad, Kochi",
    quote: "The electrician was professional and fixed the issue in under an hour. Highly recommended!",
  },
  {
    name: "Anil Kumar",
    title: "Edapally, Kochi",
    quote: "Finally found a reliable plumbing service. The booking process was so easy and the work was perfect.",
  },
  {
    name: "Fatima R.",
    title: "Fort Kochi",
    quote: "Good cleaning service. They were very thorough. I will definitely use this platform again.",
  },
  {
    name: "Rahul M.",
    title: "Vyttila, Kochi",
    quote: "Very impressive service. The carpenter arrived on time and did a fantastic job with the shelves.",
  },
  {
    name: "Sneha J.",
    title: "Aluva, Kochi",
    quote: "Safe, secure, and fast. The best app for finding home services in Kerala right now.",
  },
];

const Reviews = () => {
  return (
    <section className="py-24 bg-background transition-colors duration-1000 overflow-hidden">
      <div className="container mx-auto px-4 mb-16">
        <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-foreground mb-6">
                Loved by Kochi
            </h2>
            <p className="text-lg text-muted-foreground font-medium italic">
                Join thousands of homeowners who trust HomeCrew for their daily essentials.
            </p>
        </div>
      </div>

      <div className="flex flex-col antialiased items-center justify-center relative overflow-hidden">
        <InfiniteMovingCards
          items={testimonials}
          direction="right"
          speed="slow"
          className="pb-10"
        />
        <InfiniteMovingCards
          items={testimonials}
          direction="left"
          speed="slow"
          className="pb-10 hidden md:flex"
        />
      </div>
    </section>
  );
};

export default Reviews;