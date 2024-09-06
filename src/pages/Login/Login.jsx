import { useState } from "react";
import "./Login.css";
import assets from "../../assets/assets";
import { signup, login, resetPassword } from "../../config/firebase.js";
import { toast } from "react-toastify";

const Login = () => {
  const [currState, setCurrState] = useState("Sign up");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmitHandler = (event) => {
    event.preventDefault();
    try {
      if (currState == "Sign up") {
        signup(username, email, password);
        toast.success("Account created successfully");
      } else {
        login(email, password);
        toast.success("Login Successful");
      }
    } catch (error) {
      toast.error(error.message)
    }
  };

  return (
    <div className="login">
      <img className="logo" src={assets.logo_big} alt="" />
      <form onSubmit={onSubmitHandler} className="login-form">
        <h2>{currState}</h2>
        {currState === "Sign up" ? (
          <input
            type="text"
            className="form-input"
            placeholder="username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        ) : null}
        <input
          type="email"
          className="form-input"
          placeholder="Email address"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          className="form-input"
          placeholder="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">
          {currState === "Sign up" ? "Create Account" : "Login now"}
        </button>
        <div className="login-term">
          <input type="checkbox" />
          <p>Agree to the terms of use & privacy policy.</p>
        </div>
        <div className="login-forgot">
          {currState === "Sign up" ? (
            <p className="login-toggle">
              Already have an account{" "}
              <span onClick={() => setCurrState("Login")}>Login here</span>
            </p>
          ) : (
            <p className="login-toggle">
              Create an account{" "}
              <span onClick={() => setCurrState("Sign up")}>Click here</span>
            </p>
          )}
          {currState === "Login" ? (
            <p className="login-toggle">
              Forgot password ?{" "}
              <span onClick={() => resetPassword(email)}>Reset here</span>
            </p>
          ) : null}
        </div>
      </form>
    </div>
  );
};

export default Login;
