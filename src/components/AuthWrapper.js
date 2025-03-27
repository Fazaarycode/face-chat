// src/components/AuthWrapper.js
'use client';

import { useEffect, useState } from 'react';
import Navbar from './Navbar';

export default function AuthWrapper({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    setIsAuthenticated(!!userData);
  }, []);

  return (
    <>
      {isAuthenticated && <Navbar />}
      {children}
    </>
  );
}