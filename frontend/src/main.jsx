import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
  <BrowserRouter>
    <App />
    <ToastContainer
      position="top-right"
      autoClose={3000}
      theme="dark"
    />
  </BrowserRouter>
</StrictMode>
)
