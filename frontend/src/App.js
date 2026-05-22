

import Login from './pages/Login';
import Timer from './pages/Timer';

import { useState } from "react";

function App() {

  const [showLogin, setShowLogin] = useState(false);

  return (
    <div>
      <h1>StudySprout</h1>
      
      <button onClick={() => setShowLogin(!showLogin)}>
        {showLogin ? "Go to Timer" : "Go to Login"}
      </button>

      <Timer />

      {showLogin && <Login />}
    </div>
  );
}

export default App;