import { Link } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import Input from "../../components/ui/input";
import Button from "../../components/ui/button";

export default function ForgotPassword() {
  return (
    <AuthLayout
      title="Forgot Password"
      subtitle="Enter your registered mobile number"
    >
      <div className="space-y-5">

        <Input
          label="Mobile Number"
          placeholder="Enter your mobile number"
        />

        <Button>
          Send OTP
        </Button>

        <p className="text-center text-sm text-slate-600">
          Remember your password?{" "}
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