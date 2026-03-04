import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './Route_and_tailwind/index.css'
import App from './App.jsx'
import "bootstrap/dist/css/bootstrap.min.css"; 
import 'leaflet/dist/leaflet.css';
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";



createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
