
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { apiRequest } from "../api/client";
import { useAuth } from "../context/AuthContext";
import type {
  CurrentUser,
  RegisterRequest,
} from "../types/auth";
import "./RegisterPage.css";

interface Community {
  id: string;
  name: string;
}

interface Residence {
  id: string;
  state: string;
}

interface RegisterPageProps {
  onLogin: () => void;
  embedded?: boolean;
}

export default function RegisterPage({
  onLogin,
  embedded = false,
}: RegisterPageProps) {
  const { setUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [communityId, setCommunityId] = useState("");
  const [residenceId, setResidenceId] = useState("");
  const [address, setAddress] = useState("");

  const [communities, setCommunities] = useState<Community[]>([]);
  const [residences, setResidences] = useState<Residence[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadReferenceData() {
      try {
        const [communityData, residenceData] =
          await Promise.all([
            apiRequest<Community[]>(
              "/reference-data/communities"
            ),
            apiRequest<Residence[]>(
              "/reference-data/residences"
            ),
          ]);

        if (!active) return;

        setCommunities(communityData);
        setResidences(residenceData);
      } catch {
        if (active) {
          setMessage("Error al cargar las opciones.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadReferenceData();

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (submitting || loading) return;

    setMessage("");

    if (!email.includes("@")) {
      setMessage("Ingresa un correo electrónico válido.");
      return;
    }

    if (password.length < 8) {
      setMessage(
        "La contraseña debe tener al menos 8 caracteres."
      );
      return;
    }

    setSubmitting(true);

    const request: RegisterRequest = {
      email,
      password,
      communityId,
      residenceId,
      address,
    };

    try {
      const user = await apiRequest<CurrentUser>(
        "/auth/register",
        {
          method: "POST",
          body: JSON.stringify(request),
        }
      );

      setUser(user);
    } catch (error) {
      const detail =
        error instanceof Error ? error.message : "";

      if (detail === "API error: 409") {
        setMessage("Este correo ya está registrado.");
      } else if (detail === "API error: 429") {
        setMessage(
          "Demasiados intentos. Intenta más tarde."
        );
      } else if (detail === "API error: 403") {
        setMessage("Acceso bloqueado.");
      } else {
        setMessage("No se pudo crear la cuenta.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main
      className={
        embedded
          ? "register-page onboarding-register-embedded"
          : "register-page"
      }
    >
      <section className="register-container">
        {embedded ? (
          <h2 className="onboarding-form-title">
            Crear cuenta
          </h2>
        ) : (
          <header className="register-header">
            <h1>LOCAL</h1>
            <p>Encuentra respuestas de tu comunidad local.</p>
          </header>
        )}

        <form
          id={
            embedded
              ? "onboarding-register-form"
              : undefined
          }
          onSubmit={handleSubmit}
        >
          <label htmlFor="email">
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            placeholder="ejemplo@correo.com"
            autoComplete="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            required
          />

          <label htmlFor="password">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            placeholder="Contraseña"
            autoComplete="new-password"
            minLength={8}
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            required
          />

          <label htmlFor="community">
            Comunidad
          </label>
          <select
            id="community"
            value={communityId}
            onChange={(event) =>
              setCommunityId(event.target.value)
            }
            disabled={loading}
            required
          >
            <option value="">
              Selecciona una comunidad
            </option>
            {communities.map((community) => (
              <option
                key={community.id}
                value={community.id}
              >
                {community.name}
              </option>
            ))}
          </select>

          <label htmlFor="residence">
            Residencia
          </label>
          <select
            id="residence"
            value={residenceId}
            onChange={(event) =>
              setResidenceId(event.target.value)
            }
            disabled={loading}
            required
          >
            <option value="">
              Selecciona una residencia
            </option>
            {residences.map((residence) => (
              <option
                key={residence.id}
                value={residence.id}
              >
                {residence.state}
              </option>
            ))}
          </select>

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
            <label htmlFor="address">
              Address
            </label>
            <input
              id="address"
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
              className="register-button"
              disabled={submitting || loading}
            >
              {submitting ? "Creando..." : "Crear cuenta"}
            </button>
          )}
        </form>

        {message && (
          <p role="status" className="onboarding-form-message">
            {message}
          </p>
        )}

        {!embedded && (
          <footer className="register-footer">
            <p>¿Ya tienes una cuenta?</p>
            <button
              type="button"
              className="register-link"
              onClick={onLogin}
            >
              Iniciar sesión
            </button>
          </footer>
        )}
      </section>
    </main>
  );
}
