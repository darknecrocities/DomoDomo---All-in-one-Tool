import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Shell } from './components/Shell';
import { Dashboard } from './pages/Dashboard';
import { ToolContainer } from './pages/ToolContainer';
import { AboutApplication } from './pages/AboutApplication';
import { DoorSplash } from './components/DoorSplash';

function App() {
  return (
    <>
      <DoorSplash />
      <HashRouter>
        <Routes>
          <Route path="/" element={<Shell />}>
            <Route index element={<Dashboard />} />
            <Route path="about" element={<AboutApplication />} />
            <Route path="tool/:id" element={<ToolContainer />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </>
  );
}

export default App;
