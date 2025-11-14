import "./Home.css";
// import { useNavigate } from "react-router-dom";

export default function Home() {
  // const navigate = useNavigate();

  return (
    <div className="home-page">
      {/* LEFT SIDE */}
      <div className="home-left">
        <div className="overlay">
          <h1>TrainBook</h1>
          <p>Your journey begins here</p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="home-right">
        <div className="home-card">

          <h2>Find Your Train</h2>

          <div className="search-box">
            <input type="text" placeholder="From (Station)" />
            <input type="text" placeholder="To (Station)" />
            <input type="date" />
            <button className="search-btn">Search</button>
          </div>

          {/* <div className="auth-buttons">
            <button onClick={() => navigate("/login")}>Sign In</button>
            <button onClick={() => navigate("/login")}>Sign Up</button>
          </div> */}
          <div className="auth-buttons">
            {/* <button onClick={() => navigate("/login")}>Sign In</button>
            <button onClick={() => navigate("/login")}>Sign Up</button> */}
          </div>

        </div>
      </div>
    </div>
  );
}
