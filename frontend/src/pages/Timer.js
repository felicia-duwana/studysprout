import { useState, useEffect, useRef } from "react";
import useSessions from "../hooks/useSessions";
import { apiPath } from "../api";

function Timer({ onLogout }) {
  const { sessions, fetchSessions } = useSessions();
  const [timeLeft, setTimeLeft] = useState(1500);
  const intervalRef = useRef(null);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
  };

  const saveSession = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    await fetch(apiPath("/api/v1/sessions/save"), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    fetchSessions();
  };

  const startTimer = () => {
    if (intervalRef.current) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          alert("Time is up! Session is over");
          saveSession();
          return 1500;
        }

        return current - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  };

  const resetTimer = () => {
    stopTimer();
    setTimeLeft(1500);
  };

  useEffect(() => {
    fetchSessions();
    return () => stopTimer();
  }, [fetchSessions]);

  return (
        <div className="timer-page">
          <div className="timer-card"> <button className="top-logout" onClick={onLogout}>Logout</button>
            <h1>Track your sessions now!</h1>
        <div className="timer-circle">
          <span className="timer-display">{formatTime(timeLeft)}</span>
        </div>

        <div className="timer-controls">
          <button className="timer-button" onClick={startTimer}>Start</button>
          <button className="timer-button" onClick={stopTimer}>Stop</button>
          <button className="timer-button" onClick={resetTimer}>Reset</button>
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
    </div>
  );
}

export default Timer;
