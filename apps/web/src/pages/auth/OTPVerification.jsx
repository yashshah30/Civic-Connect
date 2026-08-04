import { Link } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import OTPInput from "../../components/auth/OTPInput";
import Button from "../../components/ui/button";

export default function OTPVerification() {
  return (
    <AuthLayout
      title="OTP Verification"
      subtitle="Enter the 6-digit OTP sent to your mobile number"
    >
      <div className="space-y-6">

        <OTPInput />

        <div className="text-right">
          <button
            className="text-sm text-blue-900 hover:underline"
          >
            Resend OTP (30s)
          </button>
        </div>

        <Button>
          Verify OTP
        </Button>

        <p className="text-center text-sm text-slate-600">
          Back to{" "}
          <Link
            to="/login"
            className="text-blue-900 font-semibold hover:underline"
          >
            Login
          </Link>
        </p>

      </div>
    </AuthLayout>
  );
}