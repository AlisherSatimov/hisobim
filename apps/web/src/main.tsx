// Supabase client va saqlash adapteri shu importda ulanadi —
// @hisobim/shared dan hech narsa undan oldin yuklanmasligi kerak.
import './init';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/global.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
