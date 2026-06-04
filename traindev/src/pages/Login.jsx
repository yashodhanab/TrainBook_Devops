// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "./Login.css";
// import axios from "axios";
// import { API_BASE_URL } from "../config";

// export default function Login() {
//   const navigate = useNavigate();
//   const [activeTab, setActiveTab] = useState("signin");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [username, setUsername] = useState("");
//   const [message, setMessage] = useState("");


//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       if (activeTab === "signin") {
//         // --- Sign In Request ---
//         const res = await axios.post(`${API_BASE_URL}/login`, {
//           email,
//           password,
//         });

//         console.log("Login successful! Welcome, " + (res.data.username || email));

//         // Clear errors
//         setMessage("");

//         // Redirect to Home
//         navigate("/");

//       } else {
//         // --- Sign Up Request ---
//         const res = await axios.post(`${API_BASE_URL}/signup`, {
//           email,
//           password,
//           username,
//         });

//         // Backend sends { message: "User registered successfully" }
//         alert(res.data.message || "User registered successfully");

//         // Switch to Sign In tab after signup
//         setActiveTab("signin");
//         setMessage("");
//       }
//     } catch (err) {
//       // --- Handle Errors ---
//       console.error("Request failed:", err);

//       if (err.response && err.response.data) {
//         // Backend sends { error: "User already exists" } OR { message: "Server error" }
//         // We check BOTH fields so the alert is not empty
//         const errorMsg = err.response.data.error || err.response.data.message || "An error occurred";
//         alert(errorMsg);
//       } else {
//         alert("Server error. Cannot connect to " + API_BASE_URL);
//       }
//     }
//   };

//   return (
//     <div className="login-page">
//       <div className="login-left">
//         <div className="overlay">
//           <h1>Welcome to TrainBook</h1>
//           <p>Book your journey with ease and comfort</p>
//         </div>
//       </div>

//       <div className="login-right">
//         <div className="login-card">
//           <h2>{activeTab === "signin" ? "Sign In" : "Sign Up"}</h2>
//           <div className="tab-buttons">
//             <button
//               className={activeTab === "signin" ? "active" : ""}
//               onClick={() => setActiveTab("signin")}
//             >
//               Sign In
//             </button>
//             <button
//               className={activeTab === "signup" ? "active" : ""}
//               onClick={() => setActiveTab("signup")}
//             >
//               Sign Up
//             </button>
//           </div>

//           <form className="login-form" onSubmit={handleSubmit}>
//             {activeTab === "signup" && (
//               <input
//                 type="text"
//                 placeholder="Username"
//                 value={username}
//                 onChange={(e) => setUsername(e.target.value)}
//                 required
//               />
//             )}
//             <input
//               type="email"
//               placeholder="Email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//             />
//             <input
//               type="password"
//               placeholder="Password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//             />
//             <button type="submit">
//               {activeTab === "signin" ? "Sign In" : "Sign Up"}
//             </button>
//           </form>

//           {message && <p className="message">{message}</p>}
//         </div>
//       </div>
//     </div>
//   );
// }


import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import axios from "axios";

export default function Login() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");

  // --- DYNAMIC URL CONFIGURATION ---
  // This automatically finds the correct IP.
  // On your laptop, it will be 'localhost'. On AWS, it will be '13.201.xx.xx'
  const hostname = window.location.hostname;
  const API_BASE_URL = `http://${hostname}:5000`; 
  // ----------------------------------

  // Auto-navigate to HomePage if already logged in
  useEffect(() => {
    if (localStorage.getItem("username")) {
      navigate("/HomePage");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (activeTab === "signin") {
        // --- Sign In Request ---
        const res = await axios.post(`${API_BASE_URL}/login`, {
          email,
          password,
        });

        console.log("Login successful! Welcome, " + (res.data.username || email));

        // Save username in localStorage so we remember they are logged in
        localStorage.setItem("username", res.data.username || email);

        // Clear errors
        setMessage("");

        // Redirect to Home
        navigate("/HomePage");

      } else {
        // --- Sign Up Request ---
        const res = await axios.post(`${API_BASE_URL}/signup`, {
          email,
          password,
          username,
        });

        // Backend sends { message: "User registered successfully" }
        alert(res.data.message || "User registered successfully");

        // Switch to Sign In tab after signup
        setActiveTab("signin");
        setMessage("");
      }
    } catch (err) {
      // --- Handle Errors ---
      console.error("Request failed:", err);

      if (err.response && err.response.data) {
        // Backend sends { error: "User already exists" } OR { message: "Server error" }
        const errorMsg = err.response.data.error || err.response.data.message || "An error occurred";
        alert(errorMsg);
      } else {
        alert(`Server error. Cannot connect to ${API_BASE_URL}`);
      }
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="overlay">
          <h1>Welcome  TrainBook</h1>
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