import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import StudentRegistration from "./pages/StudentRegistration";
import MarksEntry from "./pages/MarksEntry";
import Questions from "./pages/Questions";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<StudentRegistration />} />
        <Route path="/marks" element={<MarksEntry />} />
        <Route path="/questions" element={<Questions />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
