import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import CropPriceApp from './CropPriceApp.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CropPriceApp />
  </StrictMode>,
)
