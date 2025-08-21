import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { signUpApi } from "../server/signUpPage";
import logo from "../assets/anonLogo.png";

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
    <div className="flex flex-col sm:flex-row-reverse justify-center items-center h-screen w-screen bg-[#131d27] text-white px-4 overflow-hidden">
      {/* Logo Section */}
      <div className="aspect-square sm:w-1/3 w-1/2 flex justify-center items-center">
        <img src={logo} alt="LOGO" className="max-w-full max-h-full" />
      </div>

      {/* Form Section */}
      <div className="bg-[#111820] p-8 rounded-2xl w-full max-w-md shadow-2xl sm:mr-8">
        <h2 className="text-3xl font-semibold text-center mb-6 text-green-400">
          Create Account
        </h2>

        {error && <div className="text-red-400 text-center mb-4">{error}</div>}
        {success && <div className="text-green-400 text-center mb-4">{success}</div>}

        <form onSubmit={handleThrottledSignup} className="space-y-5">
          {/* Username */}
          <div className="flex flex-col gap-2">
            <label htmlFor="username" className="text-sm">Username</label>
            <input
              id="username"
              type="text"
              className="p-3 rounded-lg outline-none border border-gray-700 bg-transparent focus:border-green-400 transition-colors"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* Passcode */}
          <div className="flex flex-col gap-2">
            <label htmlFor="passcode" className="text-sm">Passcode</label>
            <input
              id="passcode"
              type="password"
              className="p-3 rounded-lg outline-none border border-gray-700 bg-transparent focus:border-green-400 transition-colors"
              placeholder="Enter a passcode"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
            />
          </div>

          {/* Confirm Passcode */}
          <div className="flex flex-col gap-2">
            <label htmlFor="confirmPass" className="text-sm">Confirm Passcode</label>
            <input
              id="confirmPass"
              type="password"
              className="p-3 rounded-lg outline-none border border-gray-700 bg-transparent focus:border-green-400 transition-colors"
              placeholder="Re-enter passcode"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-400 hover:bg-green-500 transition-colors text-white py-3 rounded-xl font-semibold flex justify-center items-center gap-2"
          >
            {loading ? (
              <div className="border-2 border-transparent rounded-full border-x-white animate-spin w-5 h-5" />
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        {/* Already have account */}
        <p className="text-sm text-center mt-6 text-gray-400">
          Already have an account?{" "}
          <span
            className="text-green-400 cursor-pointer hover:underline"
            onClick={() => navigate("/login")}
          >
            Log in
          </span>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
