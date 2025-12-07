import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import PopUp from './PopUp.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PopUp />
  </StrictMode>
);
