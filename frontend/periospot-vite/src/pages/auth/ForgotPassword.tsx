import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/components/Auth/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const ForgotPassword = () => {
  const { resetPassword, error } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLocalError(null);
    setLoading(true);

    if (!email) {
      setLocalError("Please enter your email address");
      setLoading(false);
      return;
    }

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setLocalError(err.message || "Unable to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
            <h1 className="mb-2 text-center text-xl font-semibold text-foreground">Reset your password</h1>
            <p className="mb-6 text-center text-sm text-muted-foreground">
              Enter your email and we will send you a reset link.
            </p>

            {(error || localError) && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-700">{error || localError}</p>
              </div>
            )}

            {success ? (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                Check your inbox for a password reset link.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-foreground">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    disabled={loading}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-primary py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Sending..." : "Send reset link"}
                </button>
              </form>
            )}

            <div className="mt-6 text-center">
              <Link to="/auth/signin" className="text-sm font-medium text-primary hover:underline">
                Back to sign in
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ForgotPassword;
