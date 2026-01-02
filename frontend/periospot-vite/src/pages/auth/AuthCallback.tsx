import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/components/Auth/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const AuthCallback = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/account", { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
            <h1 className="mb-2 text-xl font-semibold text-foreground">Signing you in...</h1>
            <p className="text-sm text-muted-foreground">
              If you are not redirected automatically, go back to the{" "}
              <Link to="/auth/signin" className="font-medium text-primary hover:underline">
                sign in page
              </Link>
              .
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AuthCallback;
