import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/layout/Layout";

import Login from "./pages/auth/Login";

import AdminDashboard from "./pages/admin/Dashboard";
import UsersPage from "./pages/admin/Users";
import { TeamsPage, ProjectsPage } from "./pages/admin/TeamsProjects";
import TasksPage from "./pages/admin/Tasks";
import TimesheetsPage from "./pages/admin/Timesheets";
import { ReportsPage } from "./pages/admin/Reports";
import {
  LeaderDashboard,
  LeaderTeamPage,
  LeaderReportPage,
  LeaderTasksPage,
} from "./pages/leader";

import {
  EmployeeDashboard,
  EmployeeProjectsPage,
  EmployeeTasksPage,
} from "./pages/employee";
import { LandingPage } from "./components/LandingPage";
import ProjectDetail from "./pages/admin/ProjectDetail";
import TeamDetail from "./pages/admin/TeamDetail";
import { LeaderMemberDetailPage, LeaderProjectMembersPage, LeaderProjectsPage } from "./pages/leader/LeaderProject";

function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles && !roles.includes(user.role)) {
    const fallback = {
      Admin: "/admin",
      Leader: "/leader",
      Employee: "/employee",
    }[user.role];
    return <Navigate to={fallback} replace />;
  }
  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPageWrapper />} />
      <Route path="/login" element={<LoginWrapper />} />
      <Route path="*" element={<Navigate to="/" />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["Admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute roles={["Admin"]}>
            <UsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/teams"
        element={
          <ProtectedRoute roles={["Admin"]}>
            <TeamsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/projects"
        element={
          <ProtectedRoute roles={["Admin"]}>
            <ProjectsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/tasks"
        element={
          <ProtectedRoute roles={["Admin"]}>
            <TasksPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/projects/:id"
        element={
          <ProtectedRoute roles={["Admin"]}>
            <ProjectDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/teams/:id"
        element={
          <ProtectedRoute roles={["Admin"]}>
            <TeamDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/timesheets"
        element={
          <ProtectedRoute roles={["Admin"]}>
            <TimesheetsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute roles={["Admin"]}>
            <ReportsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/leader"
        element={
          <ProtectedRoute roles={["Leader"]}>
            <LeaderDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leader/team"
        element={
          <ProtectedRoute roles={["Leader"]}>
            <LeaderTeamPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leader/tasks"
        element={
          <ProtectedRoute roles={["Leader"]}>
            <LeaderTasksPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leader/projects"
        element={
          <ProtectedRoute roles={["Leader"]}>
            <LeaderProjectsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leader/projects/:projectId"
        element={
          <ProtectedRoute roles={["Leader"]}>
            <LeaderProjectMembersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leader/projects/:projectId/member/:memberId"
        element={
          <ProtectedRoute roles={["Leader"]}>
            <LeaderMemberDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leader/timesheets"
        element={
          <ProtectedRoute roles={["Leader"]}>
            <TimesheetsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leader/reports"
        element={
          <ProtectedRoute roles={["Leader"]}>
            <LeaderReportPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee"
        element={
          <ProtectedRoute roles={["Employee"]}>
            <EmployeeDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/projects"
        element={
          <ProtectedRoute roles={["Employee"]}>
            <EmployeeProjectsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/tasks"
        element={
          <ProtectedRoute roles={["Employee"]}>
            <EmployeeTasksPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/timesheets"
        element={
          <ProtectedRoute roles={["Employee"]}>
            <TimesheetsPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

function LandingPageWrapper() {
  return <LandingPage />;
}

function LoginWrapper() {
  const navigate = useNavigate();
  return <Login onLogin={() => navigate("/admin", { replace: true })} />;
}
