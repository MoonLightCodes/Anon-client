import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { signUpApi } from "../server/signUpPage";
import logo from '../assets/anonLogo.png'

const SignUp = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [passcode, setPasscode] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const timeoutRef = useRef(null);

  const throttlingFn = (callback, delay = 1500) => {
    if (timeoutRef.current) return;
    callback();
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
    }, delay);
  };

  const handleSignUp = async () => {
    if (username.length < 5 || passcode.length < 5) {
      setError("Username and passcode must be at least 5 characters.");
      setSuccess("");
      return;
    }

    if (passcode !== confirmPass) {
      setError("Passwords do not match.");
      setSuccess("");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await signUpApi(username, passcode);
      setSuccess(res?.message || "Account created successfully!");
      setError("");
      setTimeout(() => navigate("/login"), 1000); // redirect to login
    } catch (err) {
      const errMsg = err?.response?.data?.message || "Signup failed";
      setError(errMsg);
      setSuccess("");
    } finally {
      setLoading(false);
    }
  };

  const handleThrottledSignup = (e) => {
    e.preventDefault();
    throttlingFn(handleSignUp);
  };

  return (
    <div className="flex flex-col select-none sm:flex-row-reverse justify-center items-center min-h-screen bg-[#131d27] text-white px-4">
      <div className="aspect-square select-none sm:w-1/3 w-1/2">
        <img src={logo} alt="LOGO" />
      </div>
      <div className="bg-[#111820] p-8 rounded-2xl w-full max-w-md shadow-2xl">
        <h2 className="text-3xl font-semibold select-none text-center mb-6 text-green-400">
          Sign Up
        </h2>

        {error && <div className="text-red-400 text-center mb-4">{error}</div>}
        {success && (
          <div className="text-green-400 text-center mb-4">{success}</div>
        )}

        <form onSubmit={handleThrottledSignup} className="space-y-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="username" className="text-sm">
              Username
            </label>
            <input
              id="username"
              type="text"
              className="p-2 rounded-lg outline-none border border-gray-600 bg-transparent"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="passcode" className="text-sm">
              Passcode
            </label>
            <input
              id="passcode"
              type="password"
              className="p-2 rounded-lg outline-none border border-gray-600 bg-transparent"
              placeholder="Enter a passcode"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="confirmPass" className="text-sm">
              Confirm Passcode
            </label>
            <input
              id="confirmPass"
              type="password"
              className="p-2 rounded-lg outline-none border border-gray-600 bg-transparent"
              placeholder="Re-enter passcode"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-400 hover:bg-green-500 transition-colors text-white py-2 rounded-xl font-semibold flex justify-center items-center gap-2"
          >
            {loading ? (
              <div className="border-2 border-transparent rounded-full border-x-white animate-spin w-4 h-4" />
            ) : (
              "Create Account"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
