import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import FeedbackManager from './pages/FeedbackManager';
import FeedbackDetailPage from './pages/FeedbackDetailPage';
import Analytics from './pages/Analytics';
import AIInsights from './pages/AIInsights';
import Settings from './pages/Settings';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SandboxPage from './pages/SandboxPage';
import NotFoundPage from './pages/NotFoundPage';
import CommandPalette from './components/CommandPalette';
import TourGuide from './components/TourGuide';
import AIChatAnalyst from './components/AIChatAnalyst';
import client from './api/client';

function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  // Dark/Light Mode Theme State
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true; // Default to dark mode
  });

  // Guided Tour State
  const [tourActive, setTourActive] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Command palette and tour control triggers
  const triggerTour = () => {
    navigate('/dashboard');
    setTourActive(true);
    setTourStep(0);
  };

  const handleSeedData = async () => {
    if (window.confirm('Seed 8 high-quality SaaS feedback reviews into the database?')) {
      try {
        const demoRecords = [
          { customer_name: 'Alex Rivera', email: 'alex@vercel.co', message: 'The analytics dashboard loading time is slow when parsing large JSON datasets. We need optimization on the edge function queries.' },
          { customer_name: 'Clara Chen', email: 'clara@stripe.com', message: 'Please add a dark mode option to the payment success screen. It looks a bit too bright compared to the Stripe dashboard interface.' },
          { customer_name: 'Marcus Brody', email: 'marcus@linear.app', message: 'Bug: The keyboard shortcuts "ctrl+k" clashes with Google Chrome bookmarks list in the latest stable update.' },
          { customer_name: 'Dianne Vance', email: 'dianne@notion.so', message: 'Wow! This Feedback Intelligence System works amazingly well. The automatic priority scoring is 100% accurate.' },
          { customer_name: 'Erick Martinez', email: 'erick@github.com', message: 'Complaint: The user profiles settings don\'t save properly on the first attempt. I have to click save twice.' },
          { customer_name: 'Sarah Jenkins', email: 'sarah@framer.com', message: 'The interactive canvas editor freezes for about 2 seconds when importing massive SVG files. Is there a progressive rendering pipeline planned?' },
          { customer_name: 'Liam Neeson', email: 'liam@action.com', message: 'Great tool, the Gemini-powered recommendations list is extremely helpful for our weekly product planning sessions.' },
          { customer_name: 'Vanya Hargreaves', email: 'vanya@umbrella.net', message: 'The sidebar navigation overlaps slightly on tablet devices. Make sure to fix media query breakpoints.' }
        ];
        
        for (const record of demoRecords) {
          await client.post('/feedback', record);
        }
        alert('Demo dataset successfully seeded!');
        // Refresh page if active
        window.location.reload();
      } catch (err) {
        alert('Failed to seed dataset. Make sure the API server is active.');
      }
    }
  };

  const handleResetData = async () => {
    if (window.confirm('WARNING: Wipe the SQLite database and delete all feedback records?')) {
      try {
        await client.post('/feedback/reset');
        alert('Database successfully reset!');
        window.location.reload();
      } catch (err) {
        alert('Failed to reset database.');
      }
    }
  };

  const handleTourNext = () => {
    if (tourStep === 0) {
      setTourStep(1);
    } else if (tourStep === 1) {
      setTourStep(2);
    } else if (tourStep === 2) {
      setTourStep(3);
      navigate('/feedback');
    } else if (tourStep === 3) {
      setTourStep(4);
      navigate('/insights');
    } else if (tourStep === 4) {
      setTourActive(false);
      navigate('/dashboard');
    }
  };

  const handleTourPrev = () => {
    if (tourStep === 1) {
      setTourStep(0);
    } else if (tourStep === 2) {
      setTourStep(1);
    } else if (tourStep === 3) {
      setTourStep(2);
      navigate('/dashboard');
    } else if (tourStep === 4) {
      setTourStep(3);
      navigate('/feedback');
    }
  };

  // Determine if inside workspace pages (sidebar layout) vs outer landing/login pages
  const isOuterPage = location.pathname === '/' || location.pathname === '/login' || location.pathname === '/sandbox';

  if (isOuterPage) {
    return (
      <>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/sandbox" element={<SandboxPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <CommandPalette
          onTriggerTour={triggerTour}
          onSeedData={handleSeedData}
          onResetData={handleResetData}
        />
      </>
    );
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans transition-colors duration-200">
      
      {/* Sidebar Navigation */}
      <Sidebar darkMode={darkMode} setDarkMode={setDarkMode} />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-8 max-w-7xl w-full mx-auto">
          <Routes>
            <Route path="/dashboard" element={<Dashboard onTriggerTour={triggerTour} />} />
            <Route path="/feedback" element={<FeedbackManager />} />
            <Route path="/feedback/:id" element={<FeedbackDetailPage />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/insights" element={<AIInsights />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>

      {/* Global Interactive Elements */}
      <CommandPalette
        onTriggerTour={triggerTour}
        onSeedData={handleSeedData}
        onResetData={handleResetData}
      />

      <TourGuide
        isOpen={tourActive}
        step={tourStep}
        onNext={handleTourNext}
        onPrev={handleTourPrev}
        onClose={() => setTourActive(false)}
      />

      <AIChatAnalyst />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;
