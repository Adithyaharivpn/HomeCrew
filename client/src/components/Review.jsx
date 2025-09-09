import React from "react";
import Slider from "react-slick";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Rating,
  Typography,
} from "@mui/material";

const Review = () => {
  const reviews = [
    {
      name: "Priya S.",
      location: "Kakkanad, Kochi",
      rating: 5,
      avatar: "P", // You can use image URLs here instead
      comment:
        "The electrician was professional and fixed the issue in under an hour. Highly recommended!",
    },
    {
      name: "Anil Kumar",
      location: "Edapally, Kochi",
      rating: 5,
      avatar: "A",
      comment:
        "Finally found a reliable plumbing service. The booking process was so easy and the work was perfect.",
    },
    {
      name: "Fatima R.",
      location: "Fort Kochi",
      rating: 4,
      avatar: "F",
      comment:
        "Good cleaning service. They were very thorough. I will definitely use this platform again.",
    },
    {
      name: "Priya S.",
      location: "Kakkanad, Kochi",
      rating: 5,
      avatar: "P", // You can use image URLs here instead
      comment:
        "The electrician was professional and fixed the issue in under an hour. Highly recommended!",
    },
    {
      name: "Anil Kumar",
      location: "Edapally, Kochi",
      rating: 5,
      avatar: "A",
      comment:
        "Finally found a reliable plumbing service. The booking process was so easy and the work was perfect.",
    },
    {
      name: "Priya S.",
      location: "Kakkanad, Kochi",
      rating: 5,
      avatar: "P", // You can use image URLs here instead
      comment:
        "The electrician was professional and fixed the issue in under an hour. Highly recommended!",
    },
    {
      name: "Anil Kumar",
      location: "Edapally, Kochi",
      rating: 5,
      avatar: "A",
      comment:
        "Finally found a reliable plumbing service. The booking process was so easy and the work was perfect.",
    },
  ];
  const settings = {
    infinite: true,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 0,
    speed: 7000,
    cssEase: "linear",
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <Box sx={{ py: { xs: 4, md: 8 } }}>
      <Typography
        variant="h4"
        component="h2"
        fontWeight="bold"
        textAlign="center"
        color="text.primary"
      >
        Trusted by Homeowners Like You
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        textAlign="center"
        mb={4}
      >
        See what our customers in Kochi are saying about our service.
      </Typography>
      <Box sx={{ py: { xs: 4, md: 8 }, overflow: "hidden" }}>
        <Slider {...settings}>
          {reviews.map((review, index) => (
            <Box
              key={index}
              sx={{
                px: 3,
                textAlign: "center",
                // maskImage:
                //   "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
                // WebkitMaskImage:
                //   "linear-gradient(to right, transparent 30%, black 50%, black 90%, transparent 100%)",
              }}
            >
              <Avatar
                sx={{
                  bgcolor: "#e3f2fd",
                  color: "primary.main",
                  width: 56,
                  height: 56,
                  mx: "auto",
                  mb: 2,
                  border: "2px solid",
                  borderColor: "primary.main",
                }}
              >
                {review.avatar}
              </Avatar>
              <Typography
                variant="h6"
                component="p"
                fontWeight="bold"
                color="black"
              >
                {review.name}
              </Typography>
              <Rating
                value={review.rating}
                readOnly
                size="small"
                sx={{ my: 1 }}
              />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontStyle: "italic", mt: 1 }}
              >
                "{review.comment}"
              </Typography>
            </Box>
          ))}
        </Slider>
      </Box>
    </Box>
  );
};

export default Review;
