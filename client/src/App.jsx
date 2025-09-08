// import { useState } from 'react'
import { ThemeProvider } from '@emotion/react'
import './App.css'
import NavBar from './components/NavBar'
import theme from './theme'
import Hero from './components/Hero.jsx'

function App() {

  return (
    <>
    <ThemeProvider theme={theme}>
    <NavBar/>
    <main>
      <Hero/>
    </main>
    </ThemeProvider>
    
    </>
  )
}

export default App
