import { useEffect } from "react";
import useSessions from "../hooks/useSessions";

function Timer({ onLogout }) {
  const { sessions, fetchSessions } = useSessions()
  useEffect(() => {
const start = document.getElementById('start');
const stop = document.getElementById('stop');
const reset = document.getElementById('reset');
const timerDisplay = document.getElementById('timer');

let timeLeft = 1500;
let interval;

const updateTimer = () => {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  timerDisplay.innerHTML = 
  `${minutes.toString().padStart(2, '0')}:
  ${seconds.toString().padStart(2, '0')}`;
};

const startTimer = () => {
  if (interval) return;

  interval = setInterval(() => {
    timeLeft--;
    updateTimer();

    if (timeLeft === 0) {
      clearInterval(interval);
      interval = null;
      alert("Time is up! Session is over");

      // when timer hits 0, automatically save a session
      const token = localStorage.getItem("token")
      fetch("http://localhost:4000/api/v1/sessions/save", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      }).then(() => fetchSessions())
        
      timeLeft = 1500;
      updateTimer();
    }
  }, 1000);
};

const stopTimer = () => {
  clearInterval(interval);
  interval = null;
};

const resetTimer = () => {
  clearInterval(interval);
  interval = null;
  
  timeLeft = 1500;
  updateTimer();
}

start.addEventListener("click", startTimer);
stop.addEventListener("click", stopTimer);
reset.addEventListener("click", resetTimer);
   
updateTimer();

return () => {
  start.removeEventListener("click", startTimer);
  stop.removeEventListener("click", stopTimer);
  reset.removeEventListener("click", resetTimer);
  clearInterval(interval);
};
  }, [fetchSessions]);

  return (
    <div>

      <h2 id="timer">25:00</h2>

      <button id="start">Start</button>
      <button id="stop">Stop</button>
      <button id="reset">Reset</button>
      <button onClick={onLogout}>Logout</button>

      <h3>Past Sessions</h3>
      {sessions.length === 0
        ? <p>No sessions yet!</p>
        : sessions.map(session => (
          <p key={session._id}>
            {new Date(session.createdAt).toLocaleDateString()} - {session.duration} minutes
          </p>
        ))
      }

    </div>
  );
}

export default Timer;
