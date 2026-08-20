import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import { NotificationProvider } from './context/NotificationContext';
import { Layout } from './components/layout/Layout';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { TasksPage } from './pages/TasksPage';
import { SchedulePage } from './pages/SchedulePage';
import { DesignsPage } from './pages/DesignsPage';
import { MaterialsPage } from './pages/MaterialsPage';
import { InspectionsPage } from './pages/InspectionsPage';
import { IssuesPage } from './pages/IssuesPage';
import { ReportsPage } from './pages/ReportsPage';
import { TeamPage } from './pages/TeamPage';
import { ActivityLogPage } from './pages/ActivityLogPage';
import { LoginPage } from './pages/LoginPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <ProjectProvider>
        <NotificationProvider>
          <BrowserRouter>
            <Routes>
              {/* Login / Role Picker Portal */}
              <Route path="/login" element={<LoginPage />} />

              {/* Main App Layout */}
              <Route path="/" element={<Layout />}>
                <Route index element={<DashboardPage />} />
                <Route path="projects" element={<ProjectsPage />} />
                <Route path="projects/:id" element={<ProjectDetailPage />} />
                <Route path="tasks" element={<TasksPage />} />
                <Route path="schedule" element={<SchedulePage />} />
                <Route path="designs" element={<DesignsPage />} />
                <Route path="materials" element={<MaterialsPage />} />
                <Route path="inspections" element={<InspectionsPage />} />
                <Route path="issues" element={<IssuesPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="team" element={<TeamPage />} />
                <Route path="activity" element={<ActivityLogPage />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </ProjectProvider>
    </AuthProvider>
  );
};

export default App;
