import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
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
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import BottomNav from "./components/BottomNav";
import { isAuthenticated } from "./services/auth";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
    },
  },
});

function AppLayout() {
  const location = useLocation();
  const loggedIn = isAuthenticated();
  const isAiChat = location.pathname === "/ai-chat";

  return (
    <>
      <Navbar />
      <BottomNav />
      <div
        className={
          loggedIn && !isAiChat
            ? "pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0"
            : undefined
        }
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/questions" element={<Questions />} />
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/marks" element={<MarksEntry />} />
            <Route path="/career-quiz" element={<CareerQuiz />} />
            <Route path="/career-results" element={<CareerResults />} />
            <Route path="/ai-chat" element={<AiChat />} />
            <Route path="/profile" element={<Profile />} />
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
