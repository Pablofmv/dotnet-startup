
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";

import RegisterPage from "./RegisterPage";
import LoginPage from "./LoginPage";
import "./OnboardingPage.css";

type OnboardingMode = "welcome" | "register" | "login";

interface OnboardingPageProps {
  mode: OnboardingMode;
  onLogin: () => void;
  onRegister: () => void;
}

const sparkles = Array.from(
  { length: 12 },
  (_, index) => index + 1
);

export default function OnboardingPage({
  mode,
  onLogin,
  onRegister,
}: OnboardingPageProps) {
  const reduceMotion = useReducedMotion();

  const isRegister = mode === "register";
  const isLogin = mode === "login";

  const duration = reduceMotion ? 0 : 0.3;

  return (
    <main className="onboarding-page">
      <section className="onboarding-content">
        <div className="onboarding-stage">
          <AnimatePresence mode="wait">
            {mode === "welcome" ? (
              <motion.div
                key="welcome"
                className="onboarding-welcome"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration }}
              >
                <div className="onboarding-logo-container">
                  <motion.h1
                    className="onboarding-logo"
                    initial={{
                      opacity: reduceMotion ? 1 : 0,
                    }}
                    animate={{ opacity: 1 }}
                    transition={{
                      delay: reduceMotion ? 0 : 0.3,
                      duration: reduceMotion ? 0 : 0.7,
                      ease: "easeOut",
                    }}
                  >
                    LOCAL
                  </motion.h1>

                  {!reduceMotion &&
                    sparkles.map((sparkle) => (
                      <motion.span
                        key={sparkle}
                        className={`onboarding-sparkle sparkle-${sparkle}`}
                        aria-hidden="true"
                        initial={{ opacity: 0 }}
                        animate={{
                          opacity: [0, 1, 1, 0],
                        }}
                        transition={{
                          delay:
                            1 + (sparkle - 1) * 0.035,
                          duration: 0.75,
                          ease: "easeInOut",
                        }}
                      >
                        ✦
                      </motion.span>
                    ))}
                </div>
              </motion.div>
            ) : isRegister ? (
              <motion.div
                key="register"
                className="onboarding-form-area"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: reduceMotion ? 0 : 0.5,
                }}
              >
                <RegisterPage
                  embedded
                  onLogin={onLogin}
                />
              </motion.div>
            ) : (
              <motion.div
                key="login"
                className="onboarding-form-area"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: reduceMotion ? 0 : 0.5,
                }}
              >
                <LoginPage
                  embedded
                  onRegister={onRegister}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.div
          className="onboarding-actions"
          initial={{ opacity: reduceMotion ? 1 : 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay: reduceMotion ? 0 : 1.8,
            duration: reduceMotion ? 0 : 0.5,
          }}
        >
          <motion.button
            type={isRegister ? "submit" : "button"}
            form={
              isRegister
                ? "onboarding-register-form"
                : undefined
            }
            className="onboarding-button onboarding-primary"
            onClick={
              mode === "welcome" ? onRegister : undefined
            }
            disabled={isLogin}
            animate={{
              opacity: isLogin ? 0 : 1,
            }}
            transition={{ duration }}
          >
            Crear cuenta
          </motion.button>

          <div className="onboarding-secondary-slot">
            <motion.button
              type={isLogin ? "submit" : "button"}
              form={
                isLogin
                  ? "onboarding-login-form"
                  : undefined
              }
              className="onboarding-button onboarding-login-action"
              onClick={
                mode === "welcome" ? onLogin : undefined
              }
              disabled={isRegister}
              animate={{
                y: isLogin ? -68 : 0,
                opacity: isRegister ? 0 : 1,
                backgroundColor: isLogin
                  ? "#007AFF"
                  : "#F5F5F7",
                color: isLogin
                  ? "#FFFFFF"
                  : "#111111",
              }}
              transition={{
                duration: reduceMotion ? 0 : 0.4,
                ease: "easeInOut",
              }}
            >
              Iniciar sesión
            </motion.button>

            <AnimatePresence mode="wait" initial={false}>
              {mode !== "welcome" && (
                <motion.p
                  key={`footer-${mode}`}
                  className="onboarding-footer"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration }}
                >
                  {isRegister
                    ? "¿Ya tienes una cuenta? "
                    : "¿No tienes una cuenta? "}

                  <button
                    type="button"
                    className="onboarding-link"
                    onClick={
                      isRegister ? onLogin : onRegister
                    }
                  >
                    {isRegister
                      ? "Iniciar sesión"
                      : "Crear cuenta"}
                  </button>
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
