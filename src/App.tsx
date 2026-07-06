import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Shell } from './components/Shell';
import { Dashboard } from './pages/Dashboard';
import { ToolContainer } from './pages/ToolContainer';
import { AboutApplication } from './pages/AboutApplication';
import { DoorSplash } from './components/DoorSplash';
import { OnboardingModal } from './components/OnboardingModal';
import { LibraryApi } from './pages/LibraryApi';
import { BlogContainer } from './pages/BlogContainer';
import { BlogPost } from './pages/BlogPost';
import { DownloadPage } from './pages/Download';
import { AutoPilotProvider } from './tools/autopilot/AutoPilotProvider';
import { FloatingAutoPilot } from './tools/autopilot/components/FloatingAutoPilot';
import { ScrollToTop } from './components/ScrollToTop';

function App() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '';
    const onboardingDone = localStorage.getItem('domodomo_onboarding_completed') === 'true';
    if (isLocalhost && !onboardingDone) {
      // Wait for splash transition before showing questionnaire
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <AutoPilotProvider>
      <DoorSplash />
      {showOnboarding && <OnboardingModal onComplete={() => setShowOnboarding(false)} />}
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Shell />}>
            <Route index element={<Dashboard />} />
            <Route path="about" element={<AboutApplication />} />
            <Route path="download" element={<DownloadPage />} />
            <Route path="tool/:id" element={<ToolContainer />} />
            <Route path="tool/:id/:variation" element={<ToolContainer />} />
            <Route path="docs" element={<AboutApplication defaultTab="docs" />} />
            <Route path="library-api" element={<LibraryApi />} />
            <Route path="blog" element={<BlogContainer />} />
            <Route path="blog/:slug" element={<BlogPost />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <FloatingAutoPilot />
    </AutoPilotProvider>
  );
}

export default App;
