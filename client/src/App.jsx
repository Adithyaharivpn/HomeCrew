// import { useState } from 'react'
import { ThemeProvider } from "@emotion/react";
import "./App.css";
import theme from "./theme";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Routes, Route } from "react-router-dom";
import Hero from "./components/Homepage/Hero.jsx";
import HowItWorks from "./components/Homepage/HowItWorks.jsx";
import WhyChooseUs from "./components/Homepage/WhyChooseUs.jsx";
import Review from "./components/Homepage/Review.jsx";
import NavBar from "./components/Homepage/NavBar.jsx";
import SignUp from "./components/Homepage/SignUp.jsx";
import Footer from "./components/Homepage/Footer.jsx";
import Login from "./components/Homepage/Login.jsx";
import JobPosting from "./components/User/JobPosting.jsx";
import JobsPage from "./components/User/JobsPage.jsx";
function App() {
  const HomePage = () => (
    <>
      <Hero />
      <HowItWorks />
      <WhyChooseUs />
      <Review />
    </>
  );
  return (
    <>
      <ThemeProvider theme={theme}>
        <NavBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/jobposting" element={<JobPosting />} />
          <Route path="/jobspage" element={<JobsPage />} />
        </Routes>
        <Footer />
      </ThemeProvider>
    </>
  );
}

export default App;
