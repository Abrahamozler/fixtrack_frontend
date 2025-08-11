import React from 'react';
import { Routes, Route, Link } from 'react-router-dom'; // Add these imports

// A simple component for another page to test links
function AboutPage() {
  return (
    <div>
      <h2>About Page</h2>
      <Link to="/">Go back to Home</Link>
    </div>
  );
}

function App() {
  return (
    <div>
      <nav>
        <Link to="/">Home</Link> | <Link to="/about">About</Link>
      </nav>

      <h1>Testing React Router</h1>

      {/* This component will render the correct page based on the URL */}
      <Routes>
        {/* When the URL is "/", show this: */}
        <Route index element={<h3>This is the Home Page</h3>} />
        
        {/* When the URL is "/about", show the AboutPage component: */}
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </div>
  );
}

export default App;
