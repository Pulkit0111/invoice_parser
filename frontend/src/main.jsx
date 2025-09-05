import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import * as serviceWorker from './utils/serviceWorker'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Register service worker for PWA features
serviceWorker.register({
  onSuccess: () => {
    console.log('App is ready for offline use');
  },
  onUpdate: (registration) => {
    console.log('New app version available');
    // You could show a notification here
  }
});