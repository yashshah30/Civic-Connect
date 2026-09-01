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

  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({});

  const handleLogin = () => {
    let newErrors = {};

    // Mobile validation
    if (!mobile.trim()) {
      newErrors.mobile = "Mobile Number is required";
    } else if (!/^[0-9]{10}$/.test(mobile)) {
      newErrors.mobile = "Enter a valid 10-digit mobile number";
    }

    // Password validation
    if (!password.trim()) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);

    // Stop if there are errors
    if (Object.keys(newErrors).length > 0) {
      toast.error("Please correct the errors");
      return;
    }

    // Demo login loading
    setLoading(true);

    setTimeout(() => {
      setLoading(false);

      toast.success("Login Successful");

      // Navigate to Citizen Dashboard
      setTimeout(() => {
        navigate("/citizen/dashboard");
      }, 500);
    }, 1500);
  };

  return (
    <>
      <ToastContainer position="top-right" />

      <AuthLayout
        title="Citizen Login"
        subtitle="Login to access Civic Connect services"
      >
        <div className="space-y-5">

          {/* Mobile Number */}
          <div>
            <Input
              label="Mobile Number"
              type="tel"
              placeholder="Enter your mobile number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
            />

            {errors.mobile && (
              <p className="mt-1 text-sm text-red-500">
                {errors.mobile}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {/* Show / Hide Password */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-11 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>

            {errors.password && (
              <p className="mt-1 text-sm text-red-500">
                {errors.password}
              </p>
            )}
          </div>

          {/* Remember + Forgot Password */}
          <div className="flex items-center justify-between">

            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                className="h-4 w-4"
              />

              Remember Me
            </label>

            <Link
              to="/forgot-password"
              className="text-sm text-blue-900 hover:underline"
            >
              Forgot Password?
            </Link>

          </div>

          {/* Login Button */}
          <Button
            type="button"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Loading..." : "Login"}
          </Button>

          {/* Signup */}
          <p className="text-center text-sm text-slate-600">
            Don't have an account?{" "}

            <Link
              to="/signup"
              className="font-semibold text-blue-900 hover:underline"
            >
              Create Account
            </Link>
          </p>

        </div>
      </AuthLayout>
    </>
  );
}