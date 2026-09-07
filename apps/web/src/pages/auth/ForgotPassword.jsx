
import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import Input from "../../components/ui/input";
import Button from "../../components/ui/button";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to send password reset email."
        );
      }

      setMessage(
        "If an account exists with this email, a password reset link has been sent."
      );

      setEmail("");
    } catch (error) {
      console.error("Forgot password error:", error);

      setError(
        error.message || "Failed to send password reset email."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot Password"
      subtitle="Enter your registered email address"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Email"
          type="email"
          placeholder="Enter your registered email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setError("");
            setMessage("");
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
          {loading ? "Sending..." : "Send Reset Link"}
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

