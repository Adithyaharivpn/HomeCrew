import {
  Avatar,
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
} from "@mui/material";
import NoteAddOutlinedIcon from "@mui/icons-material/NoteAddOutlined";
import QuestionAnswerOutlinedIcon from "@mui/icons-material/QuestionAnswerOutlined";
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined";
import React from "react";

const cards = [
  {
    id: 1,
    icon: <NoteAddOutlinedIcon fontSize="large" color="primary" />,
    title: "Step 1",
    subtitle: "Post Your Request for Free",
    description: "Describe your project to get matched with pros",
  },
  {
    id: 2,
    icon: <QuestionAnswerOutlinedIcon fontSize="large" color="primary" />,
    title: "Step 2",
    subtitle: "Receive Quotes from Pros",
    description: "Get estimates from vetted experts nearby.",
  },
  {
    id: 3,
    icon: <HandshakeOutlinedIcon fontSize="large" color="primary" />,
    title: "Step 3",
    subtitle: "Hire With Confidence",
    description: "Compare, chat, and hire your best match.",
  },
];

const HowItWorks = () => {
  return (
    <Box
      sx={{
        bgcolor: "#f8fafd",
        py: { xs: 5, md: 8 },
        px: { xs: 1, md: 0 },
      }}
    >
      <Typography
        variant="h4"
        component="h2"
        fontWeight="bold"
        textAlign="center"
        mb={6}
        color="primary"
      >
        How It Works
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 3,
          justifyContent: "center",
        }}
      >
        {cards.map((card, index) => (
          <Card
            key={card.id}
            sx={{
              maxWidth: 340,
              flex: 1,
              p: 3,
              borderRadius: 4,
              boxShadow: "0 4px 24px rgba(40,41,61,0.08)",
              border: "none",
              bgcolor: "#fff",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              minHeight: 260,
              transition:
                "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.08)",
              },
            }}
          >
            <Avatar
              sx={{
                bgcolor: "#e3f2fd",
                width: 64,
                height: 64,
                mx: "auto",
                mb: 3,
              }}
            >
              {card.icon}
            </Avatar>
            <Typography
              variant="subtitle2"
              color="primary"
              fontWeight={700}
              mb={0.5}
            >
              {card.title}
            </Typography>
            <Typography
              variant="h6"
              color="text.primary"
              fontWeight="bold"
              mb={1}
              align="center"
            >
              {card.subtitle}
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              {card.description}
            </Typography>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default HowItWorks;
