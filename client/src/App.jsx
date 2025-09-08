// import { useState } from 'react'
import { ThemeProvider } from '@emotion/react'
import './App.css'
import NavBar from './components/NavBar'
import theme from './theme'
import Hero from './components/Hero.jsx'
import HowItWorks from './components/HowItWorks.jsx'
import WhyChooseUs from './components/WhyChooseUs.jsx'
import Review from './components/Review.jsx'
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import Footer from './components/Footer.jsx'



function App() {

  return (
    <>
    <ThemeProvider theme={theme}>
    <NavBar/>
    <main>
      <Hero/>
      <HowItWorks/>
      <WhyChooseUs/>
      <Review/>
      <Footer/>
    </main>
    </ThemeProvider>
    
    </>
  )
}

export default App
