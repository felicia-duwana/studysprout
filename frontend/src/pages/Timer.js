import { useState, useEffect, useRef } from "react";
import useSessions from "../hooks/useSessions";
import { apiPath } from "../api";
import Sunflower from "../components/Sunflower";

function Timer({ onLogout }) {
  const { sessions, fetchSessions } = useSessions();
  const [timeLeft, setTimeLeft] = useState(1500);
  const [isRunning, setIsRunning] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(25);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const endTimeRef = useRef(null);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
  };

  const saveSession = async (duration) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    await fetch(apiPath("/api/v1/sessions/save"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ 
        duration,
       }),
    });

    fetchSessions();
  };

  const startTimer = () => {
    if (intervalRef.current || isRunning) return;

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

  const growthStages = ["seed", "sprout", "bud", "half", "full"];
  const totalDuration = customMinutes * 60;
  const elapsed = startTimeRef.current ? Math.floor((Date.now() - startTimeRef.current) / 1000) : 0;
  const progress = Math.min(1, elapsed / totalDuration);
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

  return (
        <div className="timer-page">
          <div className="timer-card">
            <button className="top-logout" onClick={onLogout}>Logout</button>
            <h1>Track your sessions now!</h1>

            <div className="timer-content">
              <div className="timer-left">
                <Sunflower stage={stage} />
                <div className="plant-label">Growing: {stage}</div>
              </div>

              <div className="timer-right">
                <div>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(Number(e.target.value))}
                  />
                  <button onClick={() => {
                    stopTimer()
                    setTimeLeft(customMinutes * 60)
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
              {new Date(session.createdAt).toLocaleDateString()} - {session.duration} minutes
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
    </div>
  );
}

export default Timer;
