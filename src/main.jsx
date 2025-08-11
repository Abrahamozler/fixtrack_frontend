import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom'; // Add this import back

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>  {/* Add this component back */}
      <App />
    </BrowserRouter> {/* Add this component back */}
  </React.StrictMode>,
);
