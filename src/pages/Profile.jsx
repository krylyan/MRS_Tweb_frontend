import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  UserCircle2,
  Mail,
  User,
  ShieldCheck,
  UtensilsCrossed,
  Dumbbell,
  Heart,
} from "lucide-react";
import AuthUtils from "../utils/authUtils";

const USERS_KEY = "fitlife_users";
const SESSION_USER_KEY = "fitlife_session_user";

const NUTRITION_STATS = [
  { label: "Calorii zilnice", value: 78 },
  { label: "Aport proteine", value: 86 },
  { label: "Hidratare", value: 64 },
  { label: "Consistenta mese", value: 72 },
  { label: "Calitate nutritie", value: 58 },
];

const WORKOUT_STATS = [
  { label: "Sesiuni saptamanale", value: 82 },
  { label: "Cardio (minute)", value: 67 },
  { label: "Progres forta", value: 74 },
  { label: "Recuperare", value: 61 },
  { label: "Mobilitate", value: 55 },
];

function StatsCard({ title, icon: Icon, items }) {
  return (
    <section className="profile-card status-card">
      <div className="status-header">
        <Icon size={18} />
        <p className="status-card-title">{title}</p>
      </div>

      <div className="status-list">
        {items.map((item) => (
          <div key={item.label}>
            <div className="status-row">
              <p className="status-label">{item.label}</p>
              <p className="status-value">{item.value}%</p>
            </div>
            <div className="status-track">
              <div className="status-fill" style={{ width: `${item.value}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Profile() {
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [currentUser, setCurrentUser] = useState(AuthUtils.getCurrentUserEmail() || "");
  const [isEditing, setIsEditing] = useState(false);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [editError, setEditError] = useState("");

  let fullName = "";
  try {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
    fullName = users?.[currentUser]?.fullName || "";
  } catch {
    fullName = "";
  }

  const displayName = fullName || "John Doe";
  const displayEmail = currentUser || "fip@jukmuh.al";
  const role = currentUser === "admin" ? "Administrator" : "Full Stack Developer";
  const avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(displayName)}`;

  useEffect(() => {
    setFormName(displayName);
    setFormEmail(displayEmail);
  }, [displayName, displayEmail]);

  const handleSave = () => {
    const nextName = formName.trim();
    const nextEmail = formEmail.trim();

    if (!nextName || !nextEmail) {
      setEditError("Completeaza numele si email-ul.");
      return;
    }

    try {
      const users = JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
      const existing = users[currentUser];

      if (!existing) {
        setEditError("Nu am gasit utilizatorul curent.");
        return;
      }

      if (nextEmail !== currentUser && users[nextEmail]) {
        setEditError("Email-ul este deja folosit.");
        return;
      }

      if (nextEmail === currentUser) {
        users[currentUser] = {
          ...existing,
          fullName: nextName,
        };
      } else {
        users[nextEmail] = {
          ...existing,
          fullName: nextName,
        };
        delete users[currentUser];
        sessionStorage.setItem(SESSION_USER_KEY, nextEmail);
        setCurrentUser(nextEmail);
      }

      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      setEditError("");
      setIsEditing(false);
    } catch {
      setEditError("A aparut o eroare la salvare.");
    }
  };

  return (
    <>
      <style>{`
        @keyframes authCardEnter {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .profile-shell {
          min-height: 100vh;
          background: linear-gradient(135deg, #111827 0%, #1f2937 55%, #0f172a 100%);
          color: #e5e7eb;
        }
        .profile-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 18px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .profile-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          transition: opacity 0.2s ease;
        }
        .profile-logo:hover {
          opacity: 0.85;
        }
        .profile-logo-icon {
          background: linear-gradient(to bottom right, #34d399, #3b82f6);
          padding: 8px;
          border-radius: 10px;
        }
        .profile-logo-text {
          font-size: 32px;
          line-height: 1;
          font-weight: 700;
          color: #fff;
        }
        .profile-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px 18px 32px;
          animation: authCardEnter 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .top-title {
          color: #f8fafc;
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 18px;
        }
        .profile-layout {
          display: grid;
          grid-template-columns: 320px minmax(0, 1fr);
          gap: 18px;
          align-items: stretch;
        }
        .profile-left {
          display: flex;
        }
        .profile-right {
          display: grid;
          gap: 18px;
        }
        .profile-card {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 14px;
          backdrop-filter: blur(6px);
          box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25);
        }
        .profile-main-card {
          width: 100%;
          min-height: 100%;
          text-align: center;
          padding: 24px 18px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .profile-avatar-wrap {
          width: 130px;
          height: 130px;
          margin: 0 auto 14px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .profile-avatar-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .profile-name {
          font-size: 30px;
          line-height: 1;
          color: #f8fafc;
          margin-bottom: 6px;
        }
        .profile-role {
          color: #93c5fd;
          font-size: 15px;
        }
        .details-card {
          padding: 8px 0 12px;
        }
        .detail-row {
          display: grid;
          grid-template-columns: 165px minmax(0, 1fr);
          gap: 10px;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding: 14px 16px;
        }
        .detail-row:last-of-type {
          border-bottom: 0;
        }
        .detail-label {
          font-weight: 600;
          color: #f8fafc;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .detail-value {
          color: #cbd5e1;
          overflow-wrap: anywhere;
        }
        .detail-input {
          width: 100%;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.08);
          color: #f8fafc;
          padding: 8px 10px;
          outline: none;
        }
        .edit-controls {
          padding: 12px 16px 4px;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          align-items: center;
        }
        .btn-edit {
          background: #14b8a6;
          color: #fff;
          border-radius: 10px;
          border: 1px solid #0d9488;
          padding: 7px 12px;
          font-size: 13px;
          line-height: 1;
          transition: background 0.2s ease;
        }
        .btn-edit:hover {
          background: #0d9488;
        }
        .btn-cancel {
          color: #cbd5e1;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.25);
          background: rgba(255, 255, 255, 0.08);
          padding: 7px 12px;
          font-size: 13px;
          line-height: 1;
        }
        .edit-error {
          width: 100%;
          color: #fda4af;
          font-size: 12px;
        }
        .status-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
        }
        .status-card {
          padding: 16px;
        }
        .status-header {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
          color: #86efac;
        }
        .status-card-title {
          font-size: 18px;
          color: #f8fafc;
        }
        .status-list {
          display: grid;
          gap: 10px;
        }
        .status-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }
        .status-label {
          color: #e2e8f0;
          font-size: 12px;
        }
        .status-value {
          color: #93c5fd;
          font-size: 12px;
          font-weight: 600;
        }
        .status-track {
          width: 100%;
          height: 4px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.16);
          overflow: hidden;
        }
        .status-fill {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, #34d399, #3b82f6);
        }
        .avatar-fallback {
          width: 72px;
          height: 72px;
          color: #cbd5e1;
        }
        @media (max-width: 1040px) {
          .profile-layout {
            grid-template-columns: 1fr;
          }
          .status-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 640px) {
          .profile-logo-text {
            font-size: 26px;
          }
          .top-title {
            font-size: 24px;
          }
          .detail-row {
            grid-template-columns: 1fr;
            gap: 6px;
          }
        }
      `}</style>

      <div className="profile-shell">
        <nav className="profile-nav">
          <Link to="/home" className="profile-logo">
            <div className="profile-logo-icon">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="profile-logo-text">FitLife</span>
          </Link>
        </nav>

        <div className="profile-container">
          <h1 className="top-title">Profilul meu</h1>

          <div className="profile-layout">
            <aside className="profile-left">
              <section className="profile-card profile-main-card">
                <div className="profile-avatar-wrap">
                  {avatarFailed ? (
                    <UserCircle2 className="avatar-fallback" />
                  ) : (
                    <img
                      src={avatarUrl}
                      alt={`${displayName} avatar`}
                      onError={() => setAvatarFailed(true)}
                    />
                  )}
                </div>
                <p className="profile-name">{displayName}</p>
                <p className="profile-role">{role}</p>
              </section>
            </aside>

            <div className="profile-right">
              <section className="profile-card details-card">
                <div className="detail-row">
                  <p className="detail-label">
                    <User size={16} />
                    Full Name
                  </p>
                  {isEditing ? (
                    <input
                      className="detail-input"
                      type="text"
                      value={formName}
                      onChange={(event) => setFormName(event.target.value)}
                    />
                  ) : (
                    <p className="detail-value">{displayName}</p>
                  )}
                </div>

                <div className="detail-row">
                  <p className="detail-label">
                    <Mail size={16} />
                    Email
                  </p>
                  {isEditing ? (
                    <input
                      className="detail-input"
                      type="text"
                      value={formEmail}
                      onChange={(event) => setFormEmail(event.target.value)}
                    />
                  ) : (
                    <p className="detail-value">{displayEmail}</p>
                  )}
                </div>

                <div className="detail-row">
                  <p className="detail-label">
                    <ShieldCheck size={16} />
                    Tip cont
                  </p>
                  <p className="detail-value">{role}</p>
                </div>

                <div className="edit-controls">
                  {isEditing ? (
                    <>
                      <button type="button" className="btn-edit" onClick={handleSave}>
                        Save
                      </button>
                      <button
                        type="button"
                        className="btn-cancel"
                        onClick={() => {
                          setIsEditing(false);
                          setFormName(displayName);
                          setFormEmail(displayEmail);
                          setEditError("");
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="btn-edit"
                      onClick={() => {
                        setIsEditing(true);
                        setEditError("");
                      }}
                    >
                      Edit
                    </button>
                  )}
                  {editError ? <p className="edit-error">{editError}</p> : null}
                </div>
              </section>

              <div className="status-grid">
                <StatsCard title="Alimentatie" icon={UtensilsCrossed} items={NUTRITION_STATS} />
                <StatsCard title="Antrenamente" icon={Dumbbell} items={WORKOUT_STATS} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
