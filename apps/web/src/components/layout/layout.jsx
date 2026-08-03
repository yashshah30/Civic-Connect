import Navbar from "./navbar";
import Footer from "./footer";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1">
        {children}
      </main>

      <Footer />
    </div>
  );
}