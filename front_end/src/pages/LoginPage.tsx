
import { useState } from "react";
import type { FormEvent } from "react";
import { apiRequest } from "../api/client";
import { useAuth } from "../context/AuthContext";

import type {
  CurrentUser,
  LoginRequest,
} from "../types/auth";

import "./LoginPage.css";

interface LoginPageProps {
  onRegister: () => void;
  embedded?: boolean;
}

export default function LoginPage({
  onRegister,
  embedded = false,
}: LoginPageProps) {
  const { setUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (submitting) return;

    setMessage("");
    setSubmitting(true);

    const request: LoginRequest = {
      email,
      password,
      address,
    };

    try {
      const user = await apiRequest<CurrentUser>(
        "/auth/login",
        {
          method: "POST",
          body: JSON.stringify(request),
        }
      );

      setUser(user);
    } catch (error) {
      const detail =
        error instanceof Error ? error.message : "";

      if (detail === "API error: 401") {
        setMessage("Correo o contraseña incorrectos.");
      } else if (detail === "API error: 403") {
        setMessage("Acceso bloqueado.");
      } else if (detail === "API error: 429") {
        setMessage(
          "Demasiados intentos. Intenta más tarde."
        );
      } else {
        setMessage("No se pudo iniciar sesión.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  const Container = embedded ? "div" : "main";

  return (
    <Container
      className={
        embedded
          ? "login-page onboarding-login-embedded"
          : "login-page"
      }
    >
      <section className="login-container">
        {embedded ? (
          <h2 className="onboarding-form-title">
            Iniciar sesión
          </h2>
        ) : (
          <header className="login-header">
            <h1>LOCAL</h1>
            <p>Encuentra respuestas de tu comunidad local.</p>
          </header>
        )}

        <form
          id={
            embedded
              ? "onboarding-login-form"
              : undefined
          }
          onSubmit={handleSubmit}
        >
          <label htmlFor="login-email">
            Correo electrónico
          </label>

          <input
            id="login-email"
            type="email"
            placeholder="ejemplo@correo.com"
            autoComplete="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            required
          />

          <label htmlFor="login-password">
            Contraseña
          </label>

          <div className="onboarding-password-field">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              autoComplete="current-password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              required
            />

            <button
              type="button"
              className="onboarding-password-toggle"
              onClick={() =>
                setShowPassword(!showPassword)
              }
              aria-label={
                showPassword
                  ? "Ocultar contraseña"
                  : "Mostrar contraseña"
              }
              aria-pressed={showPassword}
            >
              {showPassword ? "Ocultar" : "Mostrar"}
            </button>
          </div>

          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              left: "-10000px",
              width: "1px",
              height: "1px",
              overflow: "hidden",
            }}
          >
            <label htmlFor="login-address">
              Address
            </label>

            <input
              id="login-address"
              name="address"
              type="text"
              value={address}
              onChange={(event) =>
                setAddress(event.target.value)
              }
              autoComplete="off"
              tabIndex={-1}
            />
          </div>

          {!embedded && (
            <button
              type="submit"
              className="login-button"
              disabled={submitting}
            >
              {submitting
                ? "Iniciando..."
                : "Iniciar sesión"}
            </button>
          )}
        </form>

        {message && (
          <p
            role="status"
            className="onboarding-form-message"
          >
            {message}
          </p>
        )}

        {!embedded && (
          <footer className="login-footer">
            <p>¿No tienes cuenta?</p>
            <button
              type="button"
              className="login-link"
              onClick={onRegister}
            >
              Crear cuenta
            </button>
          </footer>
        )}
      </section>
    </Container>
  );
}
