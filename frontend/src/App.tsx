import { BrowserRouter, Routes, Route, useLocation, Navigate, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Home from "./pages/Home";
import Register from "./pages/Register";
import MarksEntry from "./pages/MarksEntry";
import Questions from "./pages/Questions";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CareerQuiz from "./pages/CareerQuiz";
import CareerResults from "./pages/CareerResults";
import Profile from "./pages/Profile";
import AiChat from "./pages/AiChat";
import AiLiteracyHome from "./pages/AiLiteracyHome";
import AiLiteracyLevel from "./pages/AiLiteracyLevel";
import AiLiteracyContent from "./pages/AiLiteracyContent";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminAiLiteracy from "./pages/admin/AdminAiLiteracy";
import AdminLevelEditor from "./pages/admin/AdminLevelEditor";
import AdminContentEditor from "./pages/admin/AdminContentEditor";
import AdminProgress from "./pages/admin/AdminProgress";
import SchoolLogin from "./pages/school/SchoolLogin";
import SchoolLayout from "./pages/school/SchoolLayout";
import SchoolDashboard from "./pages/school/SchoolDashboard";
import SchoolProfile from "./pages/school/SchoolProfile";
import SchoolStudent from "./pages/school/SchoolStudent";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import BottomNav from "./components/BottomNav";
import { isAuthenticated, isSchoolOwner } from "./services/auth";
// isAuthenticated is used in AppLayout for student nav visibility

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
    },
  },
});

// Guards school owner routes.
// Uses isSchoolOwner() which reads from "school_owner_token" — NOT the student
// "careerlens_token" key.  isAuthenticated() must NOT be used here because it
// only checks the student token and would always block school owners.
function SchoolOwnerRoute() {
  if (!isSchoolOwner()) {
    return <Navigate to="/school/login" replace />;
  }
  return <Outlet />;
}

function AppLayout() {
  const location = useLocation();
  const loggedIn = isAuthenticated();
  const isAiChat = location.pathname === "/ai-chat";
  // School and admin routes have their own layout — hide student chrome
  const isSchoolRoute = location.pathname.startsWith("/school");
  const isAdminRoute = location.pathname.startsWith("/admin");
  const hideStudentNav = isSchoolRoute || isAdminRoute;

  return (
    <>
      {!hideStudentNav && <Navbar />}
      {!hideStudentNav && <BottomNav />}
      <div
        className={
          !hideStudentNav && loggedIn && !isAiChat
            ? "pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0"
            : undefined
        }
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/questions" element={<Questions />} />
          <Route path="/login" element={<Login />} />

          {/* Student protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/marks" element={<MarksEntry />} />
            <Route path="/career-quiz" element={<CareerQuiz />} />
            <Route path="/career-results" element={<CareerResults />} />
            <Route path="/ai-chat" element={<AiChat />} />
            <Route path="/ai-literacy" element={<AiLiteracyHome />} />
            <Route
              path="/ai-literacy/level/:levelId"
              element={<AiLiteracyLevel />}
            />
            <Route
              path="/ai-literacy/content/:contentId"
              element={<AiLiteracyContent />}
            />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* AI Literacy admin routes */}
          <Route path="/admin/ai-literacy" element={<AdminLayout />}>
            <Route index element={<AdminAiLiteracy />} />
            <Route path="progress" element={<AdminProgress />} />
            <Route path="level/:levelId" element={<AdminLevelEditor />} />
            <Route
              path="level/:levelId/content/new"
              element={<AdminContentEditor />}
            />
            <Route path="content/:contentId" element={<AdminContentEditor />} />
          </Route>

          {/* School owner routes */}
          <Route path="/school/login" element={<SchoolLogin />} />
          <Route element={<SchoolOwnerRoute />}>
            <Route element={<SchoolLayout />}>
              <Route path="/school/dashboard" element={<SchoolDashboard />} />
              <Route path="/school/profile" element={<SchoolProfile />} />
              <Route path="/school/student/:id" element={<SchoolStudent />} />
            </Route>
          </Route>
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
