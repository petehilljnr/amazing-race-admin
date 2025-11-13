import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./layout/Layout";
import Contact from "./pages/Contact";
import Tasks from "./pages/Tasks";
import Pending from "./pages/Pending";
import Submissions from "./pages/Submissions";
import Scores from "./pages/Scores";
import ProtectedRoute from "./components/ProtectedRoute";
function App() {
  return (
    <ProtectedRoute>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Scores />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/pending" element={<Pending />} />
            <Route path="/submissions" element={<Submissions />} />
            <Route path="/scores" element={<Scores />} />
          </Routes>
        </Layout>
      </Router>
    </ProtectedRoute>
  );
}

export default App;
