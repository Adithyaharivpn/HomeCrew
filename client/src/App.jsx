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
import AdminDashboard from "./components/Admin/AdminDashboard.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import UserProfile from "./components/User/UserProfile.jsx";
import ViewDetails from "./components/User/ViewDetails.jsx";
import ChatBox from "./components/User/Chatbox.jsx";
import Chatroom from "./components/User/Chatroom.jsx";
import TradespersonActiveJobs from "./components/User/TradespersonActiveJobs.jsx";
import MapSearch from "./components/User/MapSearch.jsx";
import PaymentPage from "./components/Payment/PaymentPage.jsx";
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
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <NavBar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/jobposting"
              element={
                <ProtectedRoute allowedRoles={["customer"]}>
                  <JobPosting />
                </ProtectedRoute>
              }
            />
            <Route
              path="/jobspage"
              element={
                <ProtectedRoute
                  allowedRoles={["customer", "tradesperson", "admin"]}
                >
                  <JobsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/admin-dashboard"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/:id"
              element={
                <ProtectedRoute
                  allowedRoles={["customer", "tradesperson", "admin"]}
                >
                  <UserProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/job/:jobId"
              element={
                <ProtectedRoute
                  allowedRoles={["customer", "tradesperson", "admin"]}
                >
                  <ViewDetails />
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-job-proposals/:jobId"
              element={
                <ProtectedRoute allowedRoles={["customer"]}>
                  <Chatroom />
                </ProtectedRoute>
              }
            />

            <Route
              path="/chat/:roomId"
              element={
                <ProtectedRoute
                  allowedRoles={["customer", "tradesperson", "admin"]}
                >
                  <ChatBox />
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-works"
              element={
                <ProtectedRoute allowedRoles={["tradesperson"]}>
                  <TradespersonActiveJobs />
                </ProtectedRoute>
              }
            />

            <Route
              path="/map-search"
              element={
                <ProtectedRoute allowedRoles={["tradesperson"]}>
                  <MapSearch />
                </ProtectedRoute>
              }
            />

            <Route path="/payment"
              element={
                <ProtectedRoute allowedRoles={["customer", "tradesperson"]}>
                  <PaymentPage />
                </ProtectedRoute>
              }
            />

          </Routes>
          <Footer />
        </div>
      </div>
    </>
  );
}

export default App;
