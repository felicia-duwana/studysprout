

import Login from './pages/Login';
import Timer from './pages/Timer';

import { useState } from "react";

function App() {

  const [page, setPage] = useState("login");

  return (
    <div>
      <h1>StudySprout</h1>
      
      <button onClick={() => setPage(page === "login" ? "timer" : "login")}>
        Switch Page
      </button>

    {page === "login" && <Login />}
    {page === "timer" && <Timer />}
    </div>  
  );
}

export default App;