// Application entry point
// Initialises i18next, wraps app in HelmetProvider and RouterProvider.
import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import './i18n/index.js';
import './styles/global.css';
import './styles/utils.css';

// Router is imported here once implemented
// import router from './router/index.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      {/* <RouterProvider router={router} /> */}
      <div id="app-placeholder" />
    </HelmetProvider>
  </React.StrictMode>,
);
