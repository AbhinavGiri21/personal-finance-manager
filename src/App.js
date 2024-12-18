import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Components/login/login";
import Dashboard from "./Components/Dashboard/dashboard";  // Import Dashboard component

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} /> {/* Add route for dashboard */}
        </Routes>
      </Router>
    </div>
  );
}

export default App;
