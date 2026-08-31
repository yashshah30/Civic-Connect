import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-blue-800 text-white px-8 py-4 flex items-center justify-between">
      <Link to="/" className="flex items-center space-x-3">
        {/* Logo Image */}
        <img 
          src="/logo.jpeg" 
          alt="Civic Connect Logo" 
          className="h-10 w-auto object-contain rounded" 
        />
        <h1 className="text-2xl font-bold">Civic Connect</h1>
      </Link>
    </nav>
  );
}