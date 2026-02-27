import { useState } from "react";
import { Link } from "react-router-dom";
import { UserCircle2, Mail, User, ShieldCheck, UtensilsCrossed, Dumbbell } from "lucide-react";
import AuthUtils from "../utils/authUtils";

const USERS_KEY = "fitlife_users";

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
            <p className="status-label">{item.label}</p>
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
  const username = AuthUtils.getCurrentUserEmail() || "";

  let fullName = "";
  try {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
    fullName = users?.[username]?.fullName || "";
  } catch {
    fullName = "";
  }

  const displayName = fullName || "John Doe";
  const displayEmail = username || "fip@jukmuh.al";
  const role = username === "admin" ? "Administrator" : "Full Stack Developer";
  const avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(displayName)}`;

  return (
    <>
      <style>{`
        .profile-shell {
          min-height: 100vh;
          background: linear-gradient(135deg, #111827 0%, #1f2937 55%, #0f172a 100%);
          color: #e5e7eb;
          padding: 24px 18px 32px;
        }
        .profile-container {
          max-width: 1200px;
          margin: 0 auto;
        }
        .top-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
          gap: 10px;
          flex-wrap: wrap;
        }
        .top-title {
          color: #f8fafc;
          font-size: 28px;
          font-weight: 700;
        }
        .back-home {
          border-radius: 10px;
          padding: 8px 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #cbd5e1;
          background: rgba(255, 255, 255, 0.06);
          transition: background 0.2s ease;
        }
        .back-home:hover {
          background: rgba(255, 255, 255, 0.14);
        }
        .profile-layout {
          display: grid;
          grid-template-columns: 320px minmax(0, 1fr);
          gap: 18px;
        }
        .profile-left {
          display: grid;
          gap: 18px;
          align-content: start;
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
          text-align: center;
          padding: 22px 18px;
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
          margin-bottom: 4px;
        }
        .profile-location {
          color: #94a3b8;
          font-size: 13px;
          margin-bottom: 16px;
        }
        .profile-actions {
          display: flex;
          justify-content: center;
          gap: 8px;
        }
        .btn-follow,
        .btn-message {
          border-radius: 10px;
          border: 1px solid rgba(125, 211, 252, 0.35);
          padding: 7px 12px;
          font-size: 13px;
          line-height: 1;
          transition: background 0.2s ease, border-color 0.2s ease;
        }
        .btn-follow {
          background: linear-gradient(90deg, #10b981, #3b82f6);
          color: #fff;
        }
        .btn-follow:hover {
          border-color: rgba(110, 231, 183, 0.6);
        }
        .btn-message {
          color: #cbd5e1;
          background: rgba(255, 255, 255, 0.08);
        }
        .btn-message:hover {
          background: rgba(255, 255, 255, 0.14);
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
        .status-label {
          color: #e2e8f0;
          font-size: 12px;
          margin-bottom: 4px;
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
          .profile-left {
            order: 1;
          }
          .profile-right {
            order: 2;
          }
          .status-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 640px) {
          .detail-row {
            grid-template-columns: 1fr;
            gap: 4px;
          }
          .profile-name {
            font-size: 26px;
          }
        }
      `}</style>

      <div className="profile-shell">
        <div className="profile-container">
          <div className="top-bar">
            <h1 className="top-title">Profilul meu</h1>
            <Link className="back-home" to="/home">
              Inapoi la Home
            </Link>
          </div>

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
                <p className="profile-location">Bay Area, San Francisco, CA</p>
                <div className="profile-actions">
                  <button type="button" className="btn-follow">
                    Follow
                  </button>
                  <button type="button" className="btn-message">
                    Message
                  </button>
                </div>
              </section>
            </aside>

            <div className="profile-right">
              <section className="profile-card details-card">
                <div className="detail-row">
                  <p className="detail-label">
                    <User size={16} />
                    Full Name
                  </p>
                  <p className="detail-value">{displayName}</p>
                </div>
                <div className="detail-row">
                  <p className="detail-label">
                    <Mail size={16} />
                    Email
                  </p>
                  <p className="detail-value">{displayEmail}</p>
                </div>
                <div className="detail-row">
                  <p className="detail-label">
                    <ShieldCheck size={16} />
                    Tip cont
                  </p>
                  <p className="detail-value">{role}</p>
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
