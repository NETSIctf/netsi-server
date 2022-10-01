import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import Webshell from './webshell/Webshell'
import NoPage from './NoPage'
import Login from './Login'
import Navbar from './components/Navbar'
import Logout from './Logout'
import CTFs from "./ctfs/Index";
import Admin from './admin/Admin';
import Register from './Register'
import "./scss/main.scss";


ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="webshell/*" element={<Webshell />} />
        <Route path="login" element={<Login />} />
        <Route path="logout" element={<Logout />} />
        <Route path="register" element={<Register />} />
        <Route path="ctfs/*" element={<CTFs />} />
        <Route path="admin/*" element={<Admin />} />
        <Route path="*" element={<NoPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
