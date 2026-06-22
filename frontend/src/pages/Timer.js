import { useState, useEffect, useRef } from "react";
import useSessions from "../hooks/useSessions";
import { apiPath } from "../api";
import Flower from "../components/Flower";

function Timer({ onLogout }) {
  const { sessions, fetchSessions } = useSessions();
  const [timeLeft, setTimeLeft] = useState(1500);
  const [isRunning, setIsRunning] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(25);
  const [lastFlowerMessage, setLastFlowerMessage] = useState("");
  const [currentFlower, setCurrentFlower] = useState("sunflower");
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const endTimeRef = useRef(null);
  const currentFlowerRef = useRef("sunflower");

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
  };

  const saveSession = async (duration) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const response = await fetch(apiPath("/api/v1/sessions/save"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ duration }),
    });

    const data = await response.json();

    if (!response.ok) {
      setLastFlowerMessage("Unable to save session. Please try again.");
      return;
    }

    if (data.flower?.species) {
      const normalized = data.flower.species.toLowerCase().replace(/\s+/g, "")
      setLastFlowerMessage(`Unlocked ${data.flower.species} (${data.flower.rarity})!`);
      setCurrentFlower(normalized)
      currentFlowerRef.current = normalized
    } else {
      setLastFlowerMessage(data.flower?.message || "No flower earned: study at least 15 minutes to unlock one.");
      setCurrentFlower("no-flower")
      currentFlowerRef.current = "no-flower"
    }

    fetchSessions();
  };

  const pickFlowerForSession = () => {
    const sessionNumber = sessions.length + 1;
    const duration = customMinutes;

    if (duration < 15) return null;

    const isType3 = sessionNumber >= 21 || duration > 100
    const isType2 = (sessionNumber >= 11 && sessionNumber <= 20) || duration >= 30
    const isType1 = (sessionNumber >= 1 && sessionNumber <= 10) || duration >= 15

    if (isType3) return "orchid"
    if (isType2) return "rose"
    if (isType1) return "sunflower"

    return "sunflower"
  };

  const startTimer = () => {
    if (intervalRef.current || isRunning) return;

    const minutes = Math.max(15, customMinutes)
    if (minutes !== customMinutes) {
      setCustomMinutes(minutes)
      setTimeLeft(minutes * 60)
    }

    const selectedFlower = pickFlowerForSession();
    setCurrentFlower(selectedFlower || "no-flower");
    currentFlowerRef.current = selectedFlower || "no-flower";

    startTimeRef.current = Date.now();
    endTimeRef.current = Date.now() + timeLeft * 1000;
    setIsRunning(true);

    intervalRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        endTimeRef.current = null;
        setIsRunning(false);
        alert("Time is up! Session is over");
        saveSession(customMinutes);
        setTimeLeft(customMinutes * 60);
      }
    }, 1000);
  };

  const stopTimer = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    endTimeRef.current = null;
    setIsRunning(false);
  };

  const resetTimer = () => {
    stopTimer();
    setTimeLeft(customMinutes * 60);
  };

  const growthStages = ["sprout", "young", "bud", "half", "flower"];
  const totalDuration = customMinutes * 60;
  
  const elapsed = totalDuration - timeLeft;
  const progress = Math.max(0, Math.min(1, elapsed / totalDuration));
  const stageIndex = Math.min(4, Math.floor(progress * 5));
  const stage = growthStages[stageIndex];


  useEffect(() => {
    fetchSessions();
    return () => stopTimer();
  }, [fetchSessions]);

  const totalSessions = sessions.length;
  const totalMinutes = sessions.reduce(
    (sum, session) => sum + session.duration, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const flowerOrder = [
    { species: "Sunflower", rarity: "Common" },
    { species: "Daisy", rarity: "Uncommon" },
    { species: "Rose", rarity: "Uncommon" },
    { species: "Tulip", rarity: "Rare" },
    { species: "Lavender", rarity: "Rare" },
    { species: "Orchid", rarity: "Rare" },
    { species: "Lily", rarity: "Legendary" },
    { species: "Blue Rose", rarity: "Legendary" },
    { species: "Sakura", rarity: "Mythical" }
  ];

  const plantCounts = flowerOrder
  .map(flower => ({
    ...flower,
    count: sessions.filter(session => session.duration >= 15 && session.flowerSpecies === flower.species).length
  }))
  .filter(flower => flower.count > 0);

  return (
        <div className="timer-page">
          <div className="timer-card">
            <button className="top-logout" onClick={onLogout}>Logout</button>
            <h1>Track your sessions now!</h1>

            <div className="timer-content">
              <div className="timer-left">
                <Flower breed = {currentFlower} stage = {stage} isRunning={isRunning}/>
              </div>

              <div className="timer-right">
                <div>
                  <input
                    type="number"
                    min="15"
                    max="60"
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(Math.max(15, Number(e.target.value)))}
                  />
                  <button onClick={() => {
                    stopTimer()
                    const minutes = Math.max(15, customMinutes)
                    setCustomMinutes(minutes)
                    setTimeLeft(minutes * 60)
                  }}>Set Timer</button>
                </div>
                <div className="timer-circle">
                  <span className="timer-display">{formatTime(timeLeft)}</span>
                </div>

                <div className="timer-controls">
                  <button className="timer-button" onClick={startTimer}>Start</button>
                  <button className="timer-button" onClick={stopTimer}>Stop</button>
                  <button className="timer-button" onClick={resetTimer}>Reset</button>
                </div>

                {lastFlowerMessage && (
                  <div className="flower-feedback">
                    <p>{lastFlowerMessage}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

      <section className="sessions-card">
        <h3>Past Sessions</h3>
        {sessions.length === 0 ? (
          <p>No sessions yet!</p>
        ) : (
          sessions.map((session) => (
            <p key={session._id} className="session-item">
              {new Date(session.createdAt).toLocaleDateString()} - {session.duration} minutes {session.duration >= 15 && session.flowerSpecies ? `- ${session.flowerSpecies} (${session.flowerRarity})` : "- No flower"}
            </p>
          ))
        )}
      </section>

      <section className="dashboard-card">
        <h3>Productivity Dashboard</h3>
        <div className="dashboard-stats">
          <div className="stat-box">
            <div className="stat-number">{totalSessions}</div>
            <div className="stat-label">Total Sessions</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">{totalHours}</div>
            <div className="stat-label">Total Hours</div>
          </div>
        </div>
      </section>

      <section className="plant-log-card">
        <h3>Plant Log</h3>

        {plantCounts.length === 0 ? (
          <p>No plants unlocked yet!</p>
        ) : (
        plantCounts.map((plant) => (
          <p key={plant.species} className="plant-log-item">
            {plant.species} ({plant.rarity}) -- {plant.count}
            </p>
          )))}
          </section>
    </div>
  );
}

export default Timer;
