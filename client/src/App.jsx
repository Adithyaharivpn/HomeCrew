import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@emotion/react'
import './App.css'
import NavBar from './components/NavBar'
import theme from './theme'
import Body from './components/Body';
import SignUp from './components/SignUp';

function App() {

  return (
    <Router>
      <ThemeProvider theme={theme}>
        <NavBar/>
        <main>
          <Routes>
            <Route path="/" element={<Body/>} />
            <Route path="/signup" element={<SignUp/>} />
          </Routes>
        </main>
      </ThemeProvider>
    </Router>
  )
}

export default App
