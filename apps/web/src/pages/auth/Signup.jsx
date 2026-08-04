import { Link } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import Input from "../../components/ui/input";
import Button from "../../components/ui/button";

export default function Signup() {
  return (
    <AuthLayout
      title="Create Account"
      subtitle="Register to access Civic Connect"
    >
      <div className="space-y-5">

        <Input
          label="Full Name"
          placeholder="Enter your full name"
        />

        <Input
          label="Mobile Number"
          placeholder="Enter your mobile number"
        />

        <Input
          label="Email (Optional)"
          type="email"
          placeholder="Enter your email"
        />

        <Input
          label="Password"
          type="password"
          placeholder="Create password"
        />

        <Input
          label="Confirm Password"
          type="password"
          placeholder="Confirm password"
        />

        <Button>
          Register
        </Button>

        <p className="text-center text-sm text-slate-600">
          Already have an account?{" "}
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