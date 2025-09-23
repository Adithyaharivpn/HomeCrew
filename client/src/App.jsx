
// import { useState } from 'react'
// import React ,{ useLayoutEffect, useRef } from 'react';
import "./App.css";
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
import PopularJobs from "./components/Homepage/PopularJobs.jsx";
// import gsap from 'gsap';
// import { ScrollTrigger } from 'gsap/ScrollTrigger';
// import { ScrollSmoother } from 'gsap/ScrollSmoother';
// import { useGSAP } from '@gsap/react';


// gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollSmoother);


const HomePage = () => (
  <>
    <Hero />
    <PopularJobs />
    <HowItWorks />
    <WhyChooseUs />
    <Review />
  </>
);

function App() {

  // const main = useRef();
  // const smoother = useRef();

  // useGSAP(
  //   () => {
  //     smoother.current = ScrollSmoother.create({
  //       smooth: 3, 
  //       effects: true, 
  //     });
  //   },
  //   { scope: main }
  // );

  return (

    <>
    
      {/* ref={main} */}
      <div id="smooth-wrapper" > 
        <div id="smooth-content">
          <NavBar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/jobposting" element={<JobPosting />} />
            <Route path="/jobspage" element={<JobsPage />} />
          </Routes>
          <Footer />
        </div>
      </div>
    
    </>

  );
}

export default App;