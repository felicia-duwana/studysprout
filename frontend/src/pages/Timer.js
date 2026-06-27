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
  const [currentFlowerSpecies, setCurrentFlowerSpecies] = useState("Sunflower");
  const [currentFlowerRarity, setCurrentFlowerRarity] = useState("Common");
  const [showGuide, setShowGuide] = useState(false);
  const [showFlowerDebug, setShowFlowerDebug] = useState(true);
  const [showSkipTimerTest, setShowSkipTimerTest] = useState(true);
  const [isDistracted, setIsDistracted] = useState(false);
  const [distractionReason, setDistractionReason] = useState("");
  const [distractionSeconds, setDistractionSeconds] = useState(0);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const endTimeRef = useRef(null);
  const currentFlowerRef = useRef({
    species: "Sunflower",
    rarity: "Common",
    breed: "sunflower",
  });
  const distractionStartRef = useRef(null);
  const totalDistractedSecondsRef = useRef(0);
  const manualPauseCountRef = useRef(0);
  const tabSwitchCountRef = useRef(0);


  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
  };

  const clearTimerOnly = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    endTimeRef.current = null;
    setIsRunning(false);
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
      body: JSON.stringify({
        duration,
        distractionSeconds: totalDistractedSecondsRef.current,
        manualPauseCount: manualPauseCountRef.current,
        tabSwitchCount: tabSwitchCountRef.current,
        flowerSpecies: currentFlowerRef.current.species || null,
        flowerRarity: currentFlowerRef.current.rarity || null,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setLastFlowerMessage("Unable to save session. Please try again.");
      return;
    }

    if (data.flower?.species) {
      const normalized = data.flower.species.toLowerCase().replace(/\s+/g, "");
      setLastFlowerMessage(`Unlocked ${data.flower.species} (${data.flower.rarity})!`);
      setCurrentFlower(normalized);
      setCurrentFlowerSpecies(data.flower.species);
      setCurrentFlowerRarity(data.flower.rarity);
      currentFlowerRef.current = {
        species: data.flower.species,
        rarity: data.flower.rarity,
        breed: normalized,
      };
    } else {
      setLastFlowerMessage(data.flower?.message || "No flower earned: study at least 15 minutes to unlock one.");
      setCurrentFlower("no-flower");
      setCurrentFlowerSpecies(null);
      setCurrentFlowerRarity(null);
      currentFlowerRef.current = { species: null, rarity: null, breed: "no-flower" };
    }

    fetchSessions();
  };

  const pickFlowerForSession = async () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const duration = Math.max(15, customMinutes);
    if (duration < 15) return null;

    try {
      const response = await fetch(apiPath(`/api/v1/sessions/flower?duration=${duration}`), {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok || !data.flower) return null;

      const normalizedBreed = data.flower.species.toLowerCase().replace(/\s+/g, "");
      return {
        species: data.flower.species,
        rarity: data.flower.rarity,
        breed: normalizedBreed,
      };
    } catch {
      return null;
    }
  };

  const beginDistraction = (reason) => {
    if (!isRunning) return;

    clearInterval(intervalRef.current);
    intervalRef.current = null;
    endTimeRef.current = null;
    setIsRunning(false);

    if (!distractionStartRef.current) {
      distractionStartRef.current = Date.now();
      setIsDistracted(true);
      setDistractionReason(reason);

      if (reason === "manual") {
        manualPauseCountRef.current += 1;
      }

      if (reason === "tab") {
        tabSwitchCountRef.current += 1;
      }
    }
  };
  const startTimer = async () => {
    if (intervalRef.current || isRunning) return;

    const isResume = isDistracted && distractionStartRef.current;
    if (isResume) {
      const distractedFor = Math.floor(
        (Date.now() - distractionStartRef.current) / 1000
      );

      totalDistractedSecondsRef.current += distractedFor;
      setDistractionSeconds(totalDistractedSecondsRef.current);

      distractionStartRef.current = null;
      setIsDistracted(false);
      setDistractionReason("");
    }

    const minutes = Math.max(15, customMinutes)
    if (minutes !== customMinutes) {
      setCustomMinutes(minutes)
      setTimeLeft(minutes * 60)
    }

    if (!isResume) {
      const selectedFlower = await pickFlowerForSession();
      if (selectedFlower) {
        setCurrentFlower(selectedFlower.breed);
        setCurrentFlowerSpecies(selectedFlower.species);
        setCurrentFlowerRarity(selectedFlower.rarity);
        currentFlowerRef.current = selectedFlower;
      } else {
        setCurrentFlower("no-flower");
        setCurrentFlowerSpecies(null);
        setCurrentFlowerRarity(null);
        currentFlowerRef.current = { species: null, rarity: null, breed: "no-flower" };
      }
    }

    endTimeRef.current = Date.now() + timeLeft * 1000;
    setIsRunning(true);

    intervalRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearTimerOnly();
        alert("Time is up! Session is over");
        saveSession(customMinutes);
        setTimeLeft(customMinutes * 60);

        setIsDistracted(false);
        setDistractionReason("");
        setDistractionSeconds(0);
        distractionStartRef.current = null;
        totalDistractedSecondsRef.current = 0;
        manualPauseCountRef.current = 0;
        tabSwitchCountRef.current = 0;
      }
    }, 1000);
  };

  const stopTimer = () => {
    beginDistraction("manual");
  };

  /*const skipTimerForTesting = () => {
    if (!isRunning) return;

    clearTimerOnly();
    alert("Test skip: session ended early");
    saveSession(customMinutes);
    setTimeLeft(customMinutes * 60);

    setIsDistracted(false);
    setDistractionReason("");
    setDistractionSeconds(0);
    distractionStartRef.current = null;
    totalDistractedSecondsRef.current = 0;
    manualPauseCountRef.current = 0;
    tabSwitchCountRef.current = 0;
  }; */

  const resetTimer = () => {
    clearTimerOnly();
    setTimeLeft(customMinutes * 60);

    setIsDistracted(false);
    setDistractionReason("");
    setDistractionSeconds(0);
    distractionStartRef.current = null;
    totalDistractedSecondsRef.current = 0;
    manualPauseCountRef.current = 0;
    tabSwitchCountRef.current = 0;
    setCurrentFlower("no-flower");
    setCurrentFlowerSpecies(null);
    setCurrentFlowerRarity(null);
    currentFlowerRef.current = { species: null, rarity: null, breed: "no-flower" };
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isRunning) {
        beginDistraction("tab");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isRunning]);

  useEffect(() => {
    if (!isDistracted) return;

    const interval = setInterval(() => {
      if (!distractionStartRef.current) return;

      const currentDistraction = Math.floor(
        (Date.now() - distractionStartRef.current) / 1000
      );

      setDistractionSeconds(
        totalDistractedSecondsRef.current + currentDistraction
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [isDistracted]);

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

  const totalDistractionSeconds = sessions.reduce(
    (sum, session) => sum + (session.distractionSeconds || 0),
    0);

  return (
    <div className="timer-page">
      {isDistracted && (
        <div className="distraction-overlay">
          <div className="distraction-modal">
            <h2>Study Session Paused</h2>

            <p>
              {distractionReason === "tab"
                ? "You left the study page."
                : "Session paused."}
            </p>

            <p>Distraction Time: {formatTime(distractionSeconds)}</p>

            <button className="timer-button" onClick={startTimer}>
              Resume
            </button>
          </div>
        </div>
      )}

      <button className="guide-button" onClick={() => setShowGuide(!showGuide)}>
        {showGuide ? "Hide Guide" : "Show Guide"}
      </button>

      {showGuide && (
        <div className="guide-content">
          <h2>How to Use the Timer</h2>
          <p>1. Set your desired study session duration (minimum 15 minutes).</p>
          <p>2. Click "Set Timer" to apply the duration.</p>
          <p>3. Click "Start" to begin your session.</p>
          <p>4. You can stop or reset the timer at any time.</p>
          <p>5. Complete your session to unlock random flowers!</p>


          <h2>Tier Chart</h2>
          <ul>
            <li>Common: Sunflower</li>
            <li>Uncommon: Daisy, Rose</li>
            <li>Rare: Tulip, Lavender, Orchid</li>
            <li>Legendary: Lily, Blue Rose</li>
            <li>Mythical: Sakura</li>
          </ul>

        </div>


      )}



      <div className="timer-card">
        <button className="top-logout" onClick={onLogout}>Logout</button>
        <h1>Track your sessions now!</h1>

        <div className="timer-content">
          <div className="timer-left">
            <Flower breed={currentFlower} stage={stage} isRunning={isRunning} />
          </div>

          <div className="timer-right">
            <div>
              <input
                type="number"
                min="15"
                max="120"
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
              <button className="timer-button" onClick={startTimer}> {isDistracted ? "Resume" : "Start"}</button>
              <button className="timer-button" onClick={stopTimer}>Stop</button>
              <button className="timer-button" onClick={resetTimer}>Reset</button>
            </div>

            {/*showSkipTimerTest && (
              <div style={{ marginTop: "8px" }}>
                <button type="button" onClick={skipTimerForTesting} style={{ border: "1px dashed #8b5e3c", borderRadius: "6px", backgroundColor: "#fffaf2", padding: "6px 10px", cursor: "pointer" }}>
                  Test Skip Timer
                </button>
                <button type="button" onClick={() => setShowSkipTimerTest(false)} style={{ marginLeft: "6px", border: "none", background: "transparent", color: "#8b5e3c", cursor: "pointer" }}>
                  Remove
                </button>
              </div>
            )*/}


            {lastFlowerMessage && (
              <div className="flower-feedback">
                <p>{lastFlowerMessage}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <section className="garden-card">
        <h3>Your Garden 🌷</h3>

        {plantCounts.length === 0 ? (
          <p>No flowers in your garden yet!</p>
        ) : (
          <div className="garden-grid">
            {plantCounts.map((plant) => (
              <div key={plant.species} className="garden-flower">
                <Flower
                  breed={plant.species.toLowerCase().replace(/\s+/g, "")}
                  stage="flower"
                  isRunning={false}
                />
                <p className="flower-name">{plant.species}</p>
                <p className="flower-rarity">{plant.rarity}</p>
                <p className="flower-count">x{plant.count}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="sessions-card">
        <h3>Past Sessions</h3>
        {sessions.length === 0 ? (
          <p>No sessions yet!</p>
        ) : (
          <div className="sessions-list">
            <div className="session-row session-header">
              <div className="session-date">Date</div>
              <div className="session-duration">Duration</div>
              <div className="session-distraction">Distracted</div>
              <div className="session-flower">Flower Earned</div>
            </div>
            {sessions.map((session) => (
              <div key={session._id} className="session-row">
                <div className="session-date">
                  {new Date(session.createdAt).toLocaleDateString()}
                </div>
                <div className="session-duration">{session.duration} min</div>
                <div className="session-distraction">
                  ⏱ {formatTime(session.distractionSeconds || 0)}
                </div>
                <div className="session-flower">
                  {session.flowerSpecies
                    ? `🌸 ${session.flowerSpecies} (${session.flowerRarity})`
                    : "No flower"}
                </div>
              </div>
            ))}
          </div>
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
          <div className="stat-box">
            <div className="stat-number">{formatTime(totalDistractionSeconds)}</div>
            <div className="stat-label">Total Distraction Time</div>
          </div>
        </div>
      </section>

    </div>

  );
}

export default Timer;
