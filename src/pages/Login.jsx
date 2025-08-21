import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginApi } from "../server/loginPage";
import { useGlobalContext } from "../context/ContextProvider";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import logo from "../assets/anonLogo.png";

const Login = () => {
  const navigate = useNavigate();
  const { dispatch } = useGlobalContext();

  const [username, setUsername] = useState("");
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const timeoutRef = useRef(null);

  // Prevents multiple rapid login clicks (throttling)
  const throttlingFn = (callback, delay = 1500) => {
    if (timeoutRef.current) return;
    callback();
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
    }, delay);
  };

  const handleLogin = async () => {
    if (username.length < 5 || passcode.length < 5) {
      setError("Username and passcode must be at least 5 characters.");
      setSuccess("");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await loginApi(username, passcode);

      if (res?.message) {
        setSuccess(res.message);
      } else {
        setSuccess("Login successful");
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.id);
      localStorage.setItem("username", res.data.username);

      dispatch({ type: "POPULATE_NEW_CHATS", value: res.data.activeChats });
      navigate("/home");
    } catch (err) {
      const errMsg =
        err?.response?.data?.message || err?.message || "Login failed";
      setError(errMsg);
      setSuccess("");
    } finally {
      setLoading(false);
    }
  };

  const handleThrottledLogin = (e) => {
    e.preventDefault();
    throttlingFn(handleLogin);
  };

  return (
    <div className="flex flex-col sm:flex-row-reverse justify-center items-center min-h-screen w-full overflow-hidden bg-[#131d27] text-white px-4">
      {/* Logo */}
      <div className="aspect-square sm:w-1/3 w-1/2 flex justify-center items-center">
        <img src={logo} alt="Anon Logo" className="w-full h-auto select-none" />
      </div>

      {/* Login Card */}
      <div className="bg-[#111820] p-8 rounded-2xl w-full max-w-md shadow-2xl">
        <h2 className="text-3xl font-semibold text-center mb-6 text-green-400">
          Login
        </h2>

        {error && <div className="text-red-400 text-center mb-4">{error}</div>}
        {success && (
          <div className="text-green-400 text-center mb-4">{success}</div>
        )}

        <form onSubmit={handleThrottledLogin} className="space-y-5">
          {/* Username */}
          <div className="flex flex-col gap-2">
            <label htmlFor="username" className="text-sm">
              Username
            </label>
            <input
              id="username"
              type="text"
              className="p-2 rounded-lg outline-none border border-gray-600 bg-slate-600 focus:border-green-400 transition-colors"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          {/* Passcode */}
          <div className="flex flex-col gap-2 relative">
            <label htmlFor="passcode" className="text-sm">
              Passcode
            </label>
            <input
              id="passcode"
              type={showPassword ? "text" : "password"}
              className="p-2 rounded-lg outline-none border border-gray-600 bg-slate-600 pr-10 focus:border-green-400 transition-colors"
              placeholder="Enter your passcode"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-[38px] text-gray-400 hover:text-white transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-400 hover:bg-green-500 transition-colors text-white py-2 rounded-xl font-semibold flex justify-center items-center gap-2"
          >
            {loading ? (
              <div className="border-2 border-transparent rounded-full border-x-white animate-spin w-4 h-4" />
            ) : (
              "Login"
            )}
          </button>
        </form>

        {/* Signup Redirect */}
        <div className="text-sm text-center text-gray-400 mt-6">
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="text-green-400 hover:underline underline-offset-2"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
