import React from "react";
// 1. Change Autoplay to AutoScroll
import AutoScroll from "embla-carousel-auto-scroll"; 
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Star } from "lucide-react";

const reviews = [
  // ... (Your reviews data remains the same)
  {
    name: "Priya S.",
    location: "Kakkanad, Kochi",
    rating: 5,
    initial: "P",
    comment: "The electrician was professional and fixed the issue in under an hour. Highly recommended!",
  },
  {
    name: "Anil Kumar",
    location: "Edapally, Kochi",
    rating: 5,
    initial: "A",
    comment: "Finally found a reliable plumbing service. The booking process was so easy and the work was perfect.",
  },
  {
    name: "Fatima R.",
    location: "Fort Kochi",
    rating: 4,
    initial: "F",
    comment: "Good cleaning service. They were very thorough. I will definitely use this platform again.",
  },
  {
    name: "Rahul M.",
    location: "Vyttila, Kochi",
    rating: 5,
    initial: "R",
    comment: "Very impressive service. The carpenter arrived on time and did a fantastic job with the shelves.",
  },
  {
    name: "Sneha J.",
    location: "Aluva, Kochi",
    rating: 5,
    initial: "S",
    comment: "Safe, secure, and fast. The best app for finding home services in Kerala right now.",
  },
];

const StarRating = ({ rating }) => {
  return (
    <div className="flex justify-center space-x-1 my-2">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 transition-all duration-500 ${
            i < rating 
              ? "fill-yellow-400 text-yellow-400" 
              : "fill-muted text-muted"
          }`}
        />
      ))}
    </div>
  );
};

const Reviews = () => {
  // 2. Configure AutoScroll
  const plugin = React.useRef(
    AutoScroll({ 
      speed: 1,           // Speed of scroll (higher is faster)
      stopOnInteraction: false, // Keep scrolling even if user clicks
      stopOnMouseEnter: true,   // Pause when user hovers to read
    })
  );

  return (
    <section className="py-16 md:py-24 bg-background transition-colors duration-500">
      <div className="container mx-auto px-4">
        
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground md:text-4xl transition-colors duration-500">
            Trusted by Homeowners Like You
          </h2>
          <p className="mt-4 text-lg text-muted-foreground transition-colors duration-500">
            See what our customers in Kochi are saying.
          </p>
        </div>

        <Carousel
          plugins={[plugin.current]}
          className="w-full"
          opts={{
            align: "start",
            loop: true, // 3. Required for infinite feel
            dragFree: true, // 4. Allows smooth manual dragging
          }}
        >
          {/* 5. Removed -ml-4 and pl-4 logic for tighter infinite spacing */}
          <CarouselContent>
            {reviews.map((review, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3 px-2">
                <div className="h-full">
                  <Card className="h-full border-border bg-card shadow-sm hover:shadow-md transition-all duration-500">
                    <CardContent className="flex flex-col items-center p-6 text-center h-full justify-center">
                      
                      <Avatar className="h-14 w-14 border-2 border-background shadow-sm mb-3 transition-all duration-500">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${review.initial}`} />
                        <AvatarFallback className="bg-muted text-muted-foreground">{review.initial}</AvatarFallback>
                      </Avatar>

                      <h3 className="font-bold text-card-foreground transition-colors duration-500">{review.name}</h3>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide transition-colors duration-500">{review.location}</p>

                      <StarRating rating={review.rating} />

                      <p className="mt-2 text-sm italic text-muted-foreground leading-relaxed transition-colors duration-500">
                        "{review.comment}"
                      </p>

                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          {/* Optional: Removed buttons for a cleaner marquee look */}
        </Carousel>

      </div>
    </section>
  );
};

export default Reviews;