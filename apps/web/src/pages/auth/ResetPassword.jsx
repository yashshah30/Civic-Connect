import { useEffect, useState } from "react";
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
  const [checkingRecovery, setCheckingRecovery] = useState(true);
  const [recoveryValid, setRecoveryValid] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Supabase auth event:", event);

      if (!mounted) return;

      if (event === "PASSWORD_RECOVERY" && session) {
        setRecoveryValid(true);
        setCheckingRecovery(false);
        setError("");
      }
    });

    const checkExistingSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      /*
       * If the recovery URL has already been processed by Supabase,
       * the recovery session may already exist.
       */
      if (session) {
        setRecoveryValid(true);
      }

      setCheckingRecovery(false);
    };

    checkExistingSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!recoveryValid) {
      setError(
        "This password reset link is invalid or has expired. Please request a new one."
      );
      return;
    }

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

      /*
       * Sign out so the recovery session is not left active.
       */
      setTimeout(async () => {
  await supabase.auth.signOut();
  navigate("/login", { replace: true });
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

  if (checkingRecovery) {
    return (
      <AuthLayout
        title="Reset Password"
        subtitle="Verifying your reset link..."
      >
        <div className="py-6 text-center text-sm text-slate-600">
          Verifying password reset link...
        </div>
      </AuthLayout>
    );
  }

  if (!recoveryValid) {
    return (
      <AuthLayout
        title="Reset Link Invalid"
        subtitle="This password reset link cannot be used"
      >
        <div className="space-y-5">
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
            This password reset link is invalid or has expired. Please
            request a new one.
          </div>

          <Link
            to="/forgot-password"
            className="block text-center font-semibold text-blue-900 hover:underline"
          >
            Request a new reset link
          </Link>

          <p className="text-center text-sm text-slate-600">
            Remember your password?{" "}
            <Link
              to="/login"
              className="font-semibold text-blue-900 hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </AuthLayout>
    );
  }

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
          disabled={loading}
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
          disabled={loading}
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

