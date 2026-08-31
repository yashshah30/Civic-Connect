import { Link } from "react-router-dom";
import Layout from "../../components/layout/layout";

export default function Landing() {
  return (
    <Layout>
      <section className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
        {/* Prominent Hero Logo */}
        <img 
          src="/logo.jpeg" 
          alt="Civic Connect Logo" 
          className="h-32 w-auto mb-6 object-contain drop-shadow-sm" 
        />
        
        <h1 className="text-5xl font-extrabold text-blue-900 tracking-tight">
          Civic Connect
        </h1>
        
        <p className="mt-3 text-lg text-gray-600 max-w-md">
          Connecting Citizens with Better Governance
        </p>

        {/* Quick Navigation Action Buttons */}
        <div className="mt-8 flex gap-4">
          <Link 
            to="/login" 
            className="bg-blue-900 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-800 transition-colors shadow-md"
          >
            Login
          </Link>
          <Link 
            to="/signup" 
            className="border border-blue-900 text-blue-900 px-6 py-2.5 rounded-lg font-medium hover:bg-blue-50 transition-colors"
          >
            Create Account
          </Link>
        </div>
      </section>
    </Layout>
  );
}