import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import DashboardLayout from './layouts/DashboardLayout.jsx';
import AuthLayout from './layouts/AuthLayout.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

import Dashboard from './pages/Dashboard.jsx';
import Finance from './pages/Finance.jsx';
import Nutrition from './pages/Nutrition.jsx';
import SugarTracker from './pages/SugarTracker.jsx';
import DietPlanner from './pages/DietPlanner.jsx';
import Fitness from './pages/Fitness.jsx';
import Grocery from './pages/Grocery.jsx';
import AIAssistant from './pages/AIAssistant.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Settings from './pages/Settings.jsx';

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          {/* Protected Dashboard Layout */}
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="finance" element={<Finance />} />
            <Route path="nutrition" element={<Nutrition />} />
            <Route path="sugar" element={<SugarTracker />} />
            <Route path="diet-planner" element={<DietPlanner />} />
            <Route path="fitness" element={<Fitness />} />
            <Route path="grocery" element={<Grocery />} />
            <Route path="ai-insights" element={<AIAssistant />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Auth Layout */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

