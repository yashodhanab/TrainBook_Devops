import { useState } from "react";
import "./Login.css";
import axios from "axios";

export default function Login() {
  const [activeTab, setActiveTab] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    if (activeTab === "signin") {
      // Sign In request
      const res = await axios.post("http://localhost:5000/login", {
        email,
        password,
      });

      // Show alert only
      alert("Login successful! Welcome, " + (res.data.username || email));
      
      // Optionally, you can redirect user to another page here
      // window.location.href = "/dashboard";

      // Clear message if using the <p> element
      setMessage("");

    } else {
      // Sign Up request
      const res = await axios.post("http://localhost:5000/signup", {
        email,
        password,
        username,
      });

      alert(res.data.message || "User registered successfully");

      // Switch to Sign In tab after signup
      setActiveTab("signin");
      setMessage(""); // Clear message
    }
  } catch (err) {
    // Handle errors
    if (err.response && err.response.data) {
      alert(err.response.data.message); // Show error as alert
    } else {
      alert("Server error. Try again later.");
    }
  }
};

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="overlay">
          <h1>Welcome to TrainBook</h1>
          <p>Book your journey with ease and comfort</p>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <h2>{activeTab === "signin" ? "Sign In" : "Sign Up"}</h2>
          <div className="tab-buttons">
            <button
              className={activeTab === "signin" ? "active" : ""}
              onClick={() => setActiveTab("signin")}
            >
              Sign In
            </button>
            <button
              className={activeTab === "signup" ? "active" : ""}
              onClick={() => setActiveTab("signup")}
            >
              Sign Up
            </button>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {activeTab === "signup" && (
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            )}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">
              {activeTab === "signin" ? "Sign In" : "Sign Up"}
            </button>
          </form>

          {message && <p className="message">{message}</p>}
        </div>
      </div>
    </div>
  );
}
