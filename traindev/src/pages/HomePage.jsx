import React, { useEffect, useMemo, useState } from "react";
import "./Home.css";
import Navbar from "./Navbar";
// import { useNavigate } from "react-router-dom";

export default function Home() {
  // const navigate = useNavigate();

  const stations = useMemo(
    () => [
      "Colombo Fort",
      "Galle",
      "Kandy",
      "Jaffna",
      "Matara",
      "Anuradhapura",
      "Badulla",
      "Polgahawela",
    ],
    []
  );

  const [fromStation, setFromStation] = useState("");
  const [toStation, setToStation] = useState("");
  const [seatClass, setSeatClass] = useState("");
  const [date, setDate] = useState("");
  const [valid, setValid] = useState(false);
  const [error, setError] = useState("");

  // Today's date in YYYY-MM-DD for min attribute
  const today = useMemo(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  useEffect(() => {
    setError("");
    if (!fromStation || !toStation || !seatClass || !date) {
      setValid(false);
      return;
    }
    if (fromStation.trim().toLowerCase() === toStation.trim().toLowerCase()) {
      setValid(false);
      setError("Origin and destination cannot be the same.");
      return;
    }
    if (date < today) {
      setValid(false);
      setError("Trip date cannot be in the past.");
      return;
    }
    setValid(true);
  }, [fromStation, toStation, seatClass, date, today]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!valid) return;

    // Replace this with your actual navigation or search API call.
    // Example: navigate(`/search?from=${encodeURIComponent(fromStation)}&to=${encodeURIComponent(toStation)}&date=${date}&class=${seatClass}`);
    const q = `Searching trains: ${fromStation} → ${toStation} | ${date} | ${seatClass}`;
    // temporary UX: small animation + alert
    console.log(q);
    alert(q);
  };

  return (
    <div>
      <Navbar />
    <div className="home-page">
      {/* LEFT - hero image + tagline */}
      <div className="home-left">
        <div className="overlay">
          <h1>TrainBook</h1>
          <p>Your journey begins here</p>

          <div className="hero-features">
            <div className="feature">
              <strong>Fast booking</strong>
              <span>Reserve seats in seconds</span>
            </div>
            <div className="feature">
              <strong>Multiple classes</strong>
              <span>Economy • Business • First</span>
            </div>
            <div className="feature">
              <strong>Safe payments</strong>
              <span>Secure & instant</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT - search card */}
      <div className="home-right">
        <div className="home-card">
          <h2>Plan your trip</h2>
          <p className="subtitle">Enter journey details and search available trains</p>

          <form className="search-form" onSubmit={handleSearch}>
            <div className="row">
              <div className="field">
                <label>From</label>
                <input
                  list="stations-from"
                  placeholder="From (station)"
                  value={fromStation}
                  onChange={(e) => setFromStation(e.target.value)}
                  autoComplete="off"
                />
                <datalist id="stations-from">
                  {stations.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>

              <div className="field">
                <label>To</label>
                <input
                  list="stations-to"
                  placeholder="To (station)"
                  value={toStation}
                  onChange={(e) => setToStation(e.target.value)}
                  autoComplete="off"
                />
                <datalist id="stations-to">
                  {stations.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="row">
              <div className="field">
                <label>Seat class</label>
                <select
                  value={seatClass}
                  onChange={(e) => setSeatClass(e.target.value)}
                >
                  <option value="">Choose class</option>
                  <option value="Economy">Economy</option>
                  <option value="Business">Business</option>
                  <option value="First">First</option>
                </select>
              </div>

              <div className="field">
                <label>Trip date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={today}
                />
              </div>
            </div>

            {error && <div className="form-error">{error}</div>}

            <div className="actions">
              <button
                type="submit"
                className="search-btn"
                disabled={!valid}
                title={!valid ? "Fill all fields correctly to search" : "Search trains"}
              >
                Search Trains
              </button>
            </div>
          </form>

          <div className="quick-links">
            <div className="popular">
              <strong>Popular routes:</strong>
              <div className="chips">
                <button type="button" onClick={() => { setFromStation("Colombo Fort"); setToStation("Galle"); }}>
                  Colombo → Galle
                </button>
                <button type="button" onClick={() => { setFromStation("Colombo Fort"); setToStation("Kandy"); }}>
                  Colombo → Kandy
                </button>
                <button type="button" onClick={() => { setFromStation("Matara"); setToStation("Colombo Fort"); }}>
                  Matara → Colombo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
