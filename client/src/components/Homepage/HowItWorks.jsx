import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Box, Typography, Container } from "@mui/material";
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from "@mui/lab";
import NoteAddOutlinedIcon from "@mui/icons-material/NoteAddOutlined";
import QuestionAnswerOutlinedIcon from "@mui/icons-material/QuestionAnswerOutlined";
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined";
import Post from "../../assets/post.gif";
import Hire from "../../assets/hired.gif";
import Mail from "../../assets/mail.gif";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const cardsData = [
  {
    id: 1,
    icon: (
      <Box
        component="img"
        src={Post}
        alt=""
        loading="lazy"
        sx={{
          width: "64px",
          height: "64px",
          borderRadius: 4,
        }}
      />
    ),
    title: "Step 1",
    subtitle: "Post Your Request for Free",
    description: "Describe your project to get matched with pros",
  },
  {
    id: 2,
    icon:  <Box
        component="img"
        src={Mail}
        alt=""
        loading="lazy"
        sx={{
          width: "64px",
          height: "64px",
          borderRadius: 4,
        }}
      />,
    title: "Step 2",
    subtitle: "Receive Quotes from Pros",
    description: "Get estimates from vetted experts nearby.",
  },
  {
    id: 3,
    icon:      <Box
        component="img"
        src={Hire}
        alt=""
        loading="lazy"
        sx={{
          width: "64px",
          height: "64px",
          borderRadius: 4,
        }}
      />,
    title: "Step 3",
    subtitle: "Hire With Confidence",
    description: "Compare, chat, and hire your best match.",
  },
];

const HowItWorks = () => {
  const main = useRef();

  useGSAP(
    () => {
      ScrollTrigger.create({
        trigger: main.current,
        start: "top top",
        end: "bottom",
        pin: true,
        // markers: true,
      });

      gsap.from(".timeline-item", {
        y: 150,
        opacity: 0,
        stagger: 0.3,
        scrollTrigger: {
          trigger: main.current,
          ease: "power1.inOut",
          start: "top top",
          end: "bottom",
          scrub: 1,
          // markers: true,
        },
      });
    },
    { scope: main }
  );

  return (
    <Box
      ref={main}
      sx={{
        bgcolor: "#f8fafd",
        py: { xs: 8, md: 15 },
        px: { xs: 2, md: 3 },
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          fontWeight="bold"
          textAlign="center"
          mb={10}
          color="primary.main"
        >
          How It Works
        </Typography>
        <Timeline position="alternate">
          {cardsData.map((card, index) => (
            <TimelineItem key={card.id} className="timeline-item">
              <TimelineSeparator>
                <TimelineDot sx={{ bgcolor: "white", p: 1, boxShadow: 3 }}>
                  {card.icon}
                </TimelineDot>
                {index < cardsData.length - 1 && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent sx={{ py: "12px", px: 2 }}>
                <Typography variant="h6" color="primary.main" fontWeight="600">
                  {card.title}
                </Typography>
                <Typography
                  variant="h5"
                  component="h2"
                  fontWeight="bold"
                  color="text.primary"
                >
                  {card.subtitle}
                </Typography>
                <Typography color="text.secondary">
                  {card.description}
                </Typography>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </Container>
    </Box>
  );
};

export default HowItWorks;
