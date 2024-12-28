import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Components/login/login";
import Home from "./Components/Home/home";
import Panel from "./Components/Panel/panel";
import Profile from "./Components/Profile/profile";
import Settings from "./Components/Settings/settings";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route element={<Panel />}>
            <Route path="/home" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
