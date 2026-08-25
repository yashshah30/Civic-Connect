import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import Input from "../../components/ui/input";
import Button from "../../components/ui/button";
import { supabase } from "../../lib/supabase";

export default function ResetPassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!password || !confirmPassword) {
      setError("Please enter both password fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        throw updateError;
      }

      setMessage(
        "Password updated successfully. Redirecting you to login..."
      );

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("Reset password error:", error);

      setError(
        error.message || "Failed to update password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Enter your new password"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="New Password"
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setError("");
          }}
        />

        <Input
          label="Confirm Password"
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(event) => {
            setConfirmPassword(event.target.value);
            setError("");
          }}
        />

        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {message && (
          <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
            {message}
          </p>
        )}

        <Button type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update Password"}
        </Button>

        <p className="text-center text-sm text-slate-600">
          Remember your password?{" "}
          <Link
            to="/login"
            className="font-semibold text-blue-900 hover:underline"
          >
            Login
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}