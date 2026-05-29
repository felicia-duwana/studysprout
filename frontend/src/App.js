

import './App.css';
import Login from './pages/Login';
import Timer from './pages/Timer';

import { useState } from "react";

function App() {

  const [page, setPage] = useState(
    localStorage.getItem("token") ? "timer" : "login"
  )

  return (
    <div className="App">
      <h1>StudySprout</h1>

    {page === "login" && <Login onLogin={() => setPage("timer")} />}
    {page === "timer" && <Timer onLogout={() => {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      setPage("login")
    }} />}
    </div>  
  );
}

export default App;