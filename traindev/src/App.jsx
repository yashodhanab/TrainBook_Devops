import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/HomePage";
import "./App.css";

function App() {
  const [signupMessage, setSignupMessage] = useState("");

  // If you saved a success message in localStorage after signup
  useEffect(() => {
    const storedMessage = localStorage.getItem("signupMessage");
    if (storedMessage) {
      setSignupMessage(storedMessage);
      localStorage.removeItem("signupMessage"); // clear it after showing
    }
  }, []);

  return (
    <Router>
      <div className="App">
        {signupMessage && (
          <div className="global-message">
            ✅ {signupMessage}
          </div>
        )}

        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
