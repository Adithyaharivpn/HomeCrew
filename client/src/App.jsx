// import { useState } from 'react'
import { ThemeProvider } from "@emotion/react";
import "./App.css";
import NavBar from "./components/NavBar";
import theme from "./theme";
import Hero from "./components/Hero.jsx";
import HowItWorks from "./components/HowItWorks.jsx";
import WhyChooseUs from "./components/WhyChooseUs.jsx";
import Review from "./components/Review.jsx";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Footer from "./components/Footer.jsx";
import Signup from "./components/Signup.jsx";
import Login from "./components/Login.jsx";
import {Routes,Route} from 'react-router-dom'
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
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
        </Routes>
        <Footer />
      </ThemeProvider>
    </>
  );
}

export default App;
