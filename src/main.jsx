// Application entry point
// Initialises i18next, wraps app in HelmetProvider and RouterProvider.
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import './i18n/index.js';
import './styles/global.css';
import './styles/utils.css';
import AppRouter from './router/index.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <Suspense fallback={<div className="page-loading" />}>
        <AppRouter />
      </Suspense>
    </HelmetProvider>
  </React.StrictMode>,
);
