import { StrictMode } from 'react'
// @ts-ignore
import { createRoot } from 'react-dom/client'
import './styles';
// @ts-ignore
import App from './App.jsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
