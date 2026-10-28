
import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";
import { getLocalReferenceData } from "../api/referenceData";
import { updateUsername, logout } from "../api/auth";

import "./ProfilePage.css";

interface ProfilePageProps {
  onBack: () => void;
}

export default function ProfilePage({
  onBack,
}: ProfilePageProps) {
  const { user, setUser } = useAuth();

  const [community, setCommunity] = useState("");
  const [residence, setResidence] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [editing, setEditing] = useState(false);
  const [draftUsername, setDraftUsername] = useState(
    user?.username ?? ""
  );

  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProfileData() {
      try {
        const data = await getLocalReferenceData();

        if (!active || !user) return;

        const selectedCommunity = data.communities.find(
          (item) => item.id === user.communityId
        );

        const selectedResidence = data.residences.find(
          (item) => item.id === user.residenceId
        );

        setCommunity(selectedCommunity?.name ?? "");
        setResidence(selectedResidence?.state ?? "");
      } catch {
        if (active) {
          setError(true);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadProfileData();

    return () => {
      active = false;
    };
  }, [user]);

  function handleStartEditing() {
    setDraftUsername(user?.username ?? "");
    setMessage("");
    setEditing(true);
  }

  function handleCancelEditing() {
    setDraftUsername(user?.username ?? "");
    setEditing(false);
    setMessage("");
  }

  async function handleSaveUsername() {
    const username = draftUsername.trim();

    if (!username || username.length > 12 || saving) {
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const updatedUser = await updateUsername(username);

      setUser(updatedUser);
      setEditing(false);
    } catch {
      setMessage("No se pudo guardar el usuario.");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);
    setMessage("");

    try {
      await logout();
      setUser(null);
    } catch {
      setMessage("No se pudo cerrar la sesión.");
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <main className="profile-page">
      <div className="profile-container">
        <header className="profile-header">
          <button
            type="button"
            className="profile-back"
            onClick={onBack}
            aria-label="Volver"
          >
            ←
          </button>

          <img
            src="/icons/profile.svg"
            alt=""
            className="profile-icon"
          />

          <button
            type="button"
            className="profile-logout"
            onClick={() => void handleLogout()}
            disabled={loggingOut || saving}
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            <img src="/icons/logout.svg" alt="" />
          </button>
        </header>

        {loading ? (
          <p className="profile-message">Cargando...</p>
        ) : error ? (
          <p className="profile-message" role="alert">
            No se pudo cargar el perfil.
          </p>
        ) : (
          <section className="profile-information">
            <div className="profile-field">
              <span className="profile-label">
                Usuario
              </span>

              {editing ? (
                <>
                  <div className="profile-username-row">
                    <input
                      type="text"
                      className="profile-username-input"
                      aria-label="Editar usuario"
                      value={draftUsername}
                      onChange={(event) =>
                        setDraftUsername(event.target.value)
                      }
                      maxLength={12}
                      disabled={saving}
                    />

                    <button
                      type="button"
                      className="profile-action"
                      onClick={() => void handleSaveUsername()}
                      disabled={
                        saving ||
                        !draftUsername.trim() ||
                        draftUsername.trim().length > 12
                      }
                      aria-label="Guardar usuario"
                      title="Guardar"
                    >
                      <img src="/icons/check.svg" alt="" />
                    </button>

                    <button
                      type="button"
                      className="profile-action"
                      onClick={handleCancelEditing}
                      disabled={saving}
                      aria-label="Cancelar edición"
                      title="Cancelar"
                    >
                      <img src="/icons/cancel.svg" alt="" />
                    </button>
                  </div>

                  <span className="profile-character-count">
                    {draftUsername.length} / 12
                  </span>
                </>
              ) : (
                <div className="profile-username-row">
                  <span className="profile-value">
                    {user?.username}
                  </span>

                  <button
                    type="button"
                    className="profile-action"
                    onClick={handleStartEditing}
                    aria-label="Editar usuario"
                    title="Editar usuario"
                  >
                    <img src="/icons/edit.svg" alt="" />
                  </button>
                </div>
              )}
            </div>

            <div className="profile-field">
              <span className="profile-label">
                Comunidad
              </span>
              <span className="profile-value">
                {community}
              </span>
            </div>

            <div className="profile-field">
              <span className="profile-label">
                Residencia
              </span>
              <span className="profile-value">
                {residence}
              </span>
            </div>
          </section>
        )}

        {message && (
          <p className="profile-error" role="alert">
            {message}
          </p>
        )}
      </div>
    </main>
  );
}
