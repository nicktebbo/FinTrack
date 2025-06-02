import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Navbar() {
  const { isAuthenticated, user } = useAuth();

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <nav className="bg-card shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/">
                <h1 className="text-2xl font-bold text-primary cursor-pointer">FinTrack</h1>
              </Link>
            </div>
            {!isAuthenticated && (
              <div className="hidden md:block ml-10">
                <div className="flex items-baseline space-x-8">
                  <a href="#home" className="text-primary font-medium">Home</a>
                  <a href="#features" className="text-muted-foreground hover:text-primary">Features</a>
                  <a href="#pricing" className="text-muted-foreground hover:text-primary">Pricing</a>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {user && (
                  <span className="text-muted-foreground">
                    Welcome, {user.firstName || user.email}
                  </span>
                )}
                <Button onClick={handleLogout} variant="outline">
                  Log Out
                </Button>
              </div>
            ) : (
              <>
                <Button onClick={handleLogin} variant="ghost">
                  Log In
                </Button>
                <Button onClick={handleLogin}>
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
