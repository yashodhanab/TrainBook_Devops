import { useEffect, useState } from "react";
import Login from "./pages/Login"; // adjust path if needed
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
    <div className="App">
      {signupMessage && (
        <div className="global-message">
          ✅ {signupMessage}
        </div>
      )}
      <Login />
    </div>
  );
}

export default App;
