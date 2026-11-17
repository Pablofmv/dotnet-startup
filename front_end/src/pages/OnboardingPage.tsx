
import { motion, useReducedMotion } from "motion/react";
import "./OnboardingPage.css";

interface OnboardingPageProps {
  onLogin: () => void;
  onRegister: () => void;
}

export default function OnboardingPage({
  onLogin,
  onRegister,
}: OnboardingPageProps) {
  const reduceMotion = useReducedMotion();

  return (
    <main className="onboarding-page">
      <section className="onboarding-content">
        <motion.h1
          className="onboarding-logo"
          initial={{ opacity: reduceMotion ? 1 : 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay: reduceMotion ? 0 : 0.3,
            duration: reduceMotion ? 0 : 0.7,
            ease: "easeOut",
          }}
        >
          LOCAL
        </motion.h1>

        <div className="onboarding-actions">
          <button
            type="button"
            className="onboarding-button onboarding-primary"
            onClick={onRegister}
          >
            Crear cuenta
          </button>

          <button
            type="button"
            className="onboarding-button onboarding-secondary"
            onClick={onLogin}
          >
            Iniciar sesión
          </button>
        </div>
      </section>
    </main>
  );
}
