import React from 'react';
import {BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import UserHome from './pages/userHome';
import LoanApplication from './pages/loanForm';
import { OfficerDashboard } from './pages/verifier';
import AdminDashboard from './pages/admin';
import SignInPage from './components/signin';
import SignUpPage from './components/signup';

const App = () => {
  return (
    <Router>
        <Routes>
          <Route path="/" element={<SignInPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route path="/user" element={<UserHome />} />
          <Route path="/loan-application" element={<LoanApplication />} />
          <Route path="/officer-dashboard" element={<OfficerDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Routes>
    </Router>
  );
};

export default App;
