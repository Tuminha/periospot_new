import { Link, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const CheckEmail = () => {
  const location = useLocation();
  const state = location.state as { email?: string } | null;
  const email = state?.email;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
            <h1 className="mb-2 text-xl font-semibold text-foreground">Check your email</h1>
            <p className="text-sm text-muted-foreground">
              {email
                ? `We sent a confirmation link to ${email}. Open it to finish creating your account.`
                : "We sent a confirmation link to your email. Open it to finish creating your account."}
            </p>

            <div className="mt-6">
              <Link to="/auth/signin" className="font-medium text-primary hover:underline">
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

export default CheckEmail;
