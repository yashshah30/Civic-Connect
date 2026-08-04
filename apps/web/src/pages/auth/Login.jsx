import { useState } from "react";
import { Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import AuthLayout from "../../components/auth/AuthLayout";
import Input from "../../components/ui/input";
import Button from "../../components/ui/button";

export default function Login() {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({});

  const handleLogin = () => {
    let newErrors = {};

    if (!mobile.trim()) {
      newErrors.mobile = "Mobile Number is required";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      toast.success("Login Successful (Demo)");
    }, 2000);
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
              label="Mobile Number"
              placeholder="Enter your mobile number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
            />

            {errors.mobile && (
              <p className="text-red-500 text-sm mt-1">
                {errors.mobile}
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

          <Button onClick={handleLogin}>
            {loading ? "Loading..." : "Login"}
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