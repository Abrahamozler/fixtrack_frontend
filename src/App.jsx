import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';

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

      <Routes>
        <Route index element={<h3>This is the Home Page</h3>} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </div>
  );
}

export default App;
