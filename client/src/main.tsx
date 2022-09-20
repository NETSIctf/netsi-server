import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import Webshell from './Webshell'
import NoPage from './NoPage'
import Login from './Login'
import Navbar from './components/Navbar'
import Logout from './Logout'
import AddCTF from './addCTF'
import CtfList from './CtfList'
import ViewCTF from './ViewCTF'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="webshell" element={<Webshell />} />
        <Route path="login" element={<Login />} />
        <Route path="logout" element={<Logout />} />
        <Route path="ctf/add" element={<AddCTF />} />
        <Route path="ctfs" element={<CtfList />} />
        <Route path="ctfs/*" element={<ViewCTF />} />
        <Route path="*" element={<NoPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
