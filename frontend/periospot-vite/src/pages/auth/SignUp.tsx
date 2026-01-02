import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SignupForm } from "@/components/Auth/SignupForm";

const SignUp = () => (
  <div className="min-h-screen bg-background">
    <Header />

    <main className="pt-32 pb-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-md"
        >
          <SignupForm />
        </motion.div>
      </div>
    </main>

    <Footer />
  </div>
);

export default SignUp;
