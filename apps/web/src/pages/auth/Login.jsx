import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import AuthLayout from "../../components/auth/AuthLayout";
import Input from "../../components/ui/input";
import Button from "../../components/ui/button";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleLogin = async () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5001/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Login failed");
      }

      // Save authentication data
      localStorage.setItem(
        "access_token",
        data.session.access_token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      toast.success("Login successful!");

      setTimeout(() => {
        navigate("/citizen/dashboard");
      }, 800);

    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer position="top-right" />

      <AuthLayout
        title="Citizen Login"
        subtitle="Login to access Civic Connect services"
      >
        <div className="space-y-5">

          <div>
            <Input
              label="Email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email}
              </p>
            )}
          </div>

          <div className="relative">

            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-11 text-gray-500"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>

            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password}
              </p>
            )}

          </div>

          <div className="flex justify-between items-center">

            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" />
              Remember Me
            </label>

            <Link
              to="/forgot-password"
              className="text-blue-900 text-sm hover:underline"
            >
              Forgot Password?
            </Link>

          </div>

          <Button onClick={handleLogin} type="button">
            {loading ? "Logging in..." : "Login"}
          </Button>

          <p className="text-center text-sm text-slate-600">
            Don't have an account?{" "}

            <Link
              to="/signup"
              className="text-blue-900 font-semibold hover:underline"
            >
              Create Account
            </Link>
          </p>

        </div>
      </AuthLayout>
    </>
  );
}
