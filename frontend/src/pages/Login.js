import {useState} from "react";

function Login() {
    const [isLogin, setIsLogin] = useState(true);

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        const url = isLogin ? "http://localhost:8000/api/v1/users/login" : "http://localhost:8000/api/v1/users/register";

        const body = isLogin
            ? { email, password }
            : { username, email, password };


        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            });

            const data = await response.json();
            console.log("BACKEND RESPONSE:", data);

            if (response.ok) {
                setMessage(isLogin ? "Login successful!" : "Register successful!");
                console.log(data.user);
            
            } else {
                setMessage(data.message || "Oh no!An error occurred.");
            }                    
        } catch (error) {
            console.log("REGISTER ERROR:", error)
            setMessage(error.message);
        }
    };

    return (
        <div>
            <h2>{isLogin ? "Login" : "Register"}</h2>

            <form onSubmit={handleSubmit}>

                {!isLogin && (
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                )}
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">
                    {isLogin ? "Login" : "Register"}
                    </button>
            </form>
            <p>{message}</p>

            <button onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
            </button>   
        </div>
    );
}

export default Login;