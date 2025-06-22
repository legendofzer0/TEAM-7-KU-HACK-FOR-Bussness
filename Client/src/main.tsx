import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter } from 'react-router-dom'; 
import PageRoutes from './page_routes.tsx';
import "./css/index.css";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Toaster position="top-right" reverseOrder={false} />
    <BrowserRouter>
      <PageRoutes/>
      <App />
    </BrowserRouter>
  </StrictMode>
);
