import { useState } from "react";
import { apiPath } from "../api";
import { validateRegistrationForm } from "./authValidation";
import "./Login.css";

function Login({ onLogin }) {
    const [isLogin, setIsLogin] = useState(true);

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("info");
    const [formErrors, setFormErrors] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const resetForm = () => {
        setUsername("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isSubmitting) {
            return;
        }

        setMessage("");
        setMessageType("info");
        setFormErrors([]);

        if (!isLogin) {
            const validationErrors = validateRegistrationForm({
                username,
                email,
                password,
                confirmPassword
            });

            if (validationErrors.length > 0) {
                setFormErrors(validationErrors);
                setMessageType("error");
                setMessage("Please fix the highlighted issues before continuing.");
                return;
            }
        }

        setIsSubmitting(true);

        const url = isLogin
            ? apiPath("/api/v1/users/login")
            : apiPath("/api/v1/users/register");

        const body = isLogin
            ? { email, password }
            : { username: username.trim(), email: email.trim().toLowerCase(), password };

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (response.ok) {
                if (isLogin) {
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("user", JSON.stringify(data.user));
                    onLogin();
                    setMessage("Login successful!");
                    setMessageType("success");
                } else {
                    resetForm();
                    setMessage("Registration successful! Please sign in with your new account.");
                    setMessageType("success");
                }
            } else {
                const backendMessage = data.message || "An error occurred. Please try again.";
                setFormErrors([backendMessage]);
                setMessageType("error");
                setMessage(backendMessage);
            }
        } catch (error) {
            setFormErrors([error.message || "Something went wrong. Please try again."]);
            setMessageType("error");
            setMessage(error.message || "Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleModeSwitch = () => {
        setIsLogin(!isLogin);
        setFormErrors([]);
        setMessage("");
        setMessageType("info");
        setPassword("");
        setConfirmPassword("");
    };

    return (
        <div className="auth-shell">
            <div className="auth-card">
                <div className="auth-brand">
                    <div>
                        <h2>{isLogin ? "Welcome back" : "Create your account"}</h2>
                        <p>
                            {isLogin
                                ? "Continue your study streak."
                                : "Join StudySprout!"}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {!isLogin && (
                        <div className="field-group">
                            <label htmlFor="username">Username</label>
                            <input
                                id="username"
                                type="text"
                                className="auth-input"
                                placeholder="Choose a username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                    )}

                    <div className="field-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            className="auth-input"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="field-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            className="auth-input"
                            placeholder={isLogin ? "Enter your password" : "At least 8 characters"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {!isLogin && (
                        <div className="field-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                className="auth-input"
                                placeholder="Re-enter your password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    )}

                    <button type="submit" className="auth-button" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <span className="button-content">
                                <span className="spinner" />
                                {isLogin ? "Logging in..." : "Creating account..."}
                            </span>
                        ) : isLogin ? "Login" : "Register"}
                    </button>
                </form>

                {formErrors.length > 0 && (
                    <div className="auth-feedback auth-error">
                        {formErrors.map((error) => (
                            <p key={error}>{error}</p>
                        ))}
                    </div>
                )}

                {!formErrors.length && message && (
                    <div className={`auth-feedback ${messageType === "success" ? "auth-success" : "auth-error"}`}>
                        {message}
                    </div>
                )}

                <button type="button" className="auth-toggle" onClick={handleModeSwitch}>
                    {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
                </button>
            </div>
        </div>
    );
}

export default Login;