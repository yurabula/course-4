import React from 'react';

interface Props {
  profile: { displayName?: string; gender?: string | null; age?: number | null } | null;
  setProfile: (p: any) => void;
  saveProfile: () => Promise<void>;
  profileSaving: boolean;
}

const ProfileSection: React.FC<Props> = ({ profile, setProfile, saveProfile, profileSaving }) => {
  return (
    <section className="profile-section">
      <h2>Мій профіль</h2>
      {profile ? (
        <div className="profile-form">
          <label>
            Ім'я:
            <input
              type="text"
              value={profile.displayName || ''}
              onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
            />
          </label>

          <label>
            Стать:
            <select
              value={profile.gender || ''}
              onChange={(e) => setProfile({ ...profile, gender: e.target.value || null })}
            >
              <option value="">Не вказано</option>
              <option value="male">Чоловік</option>
              <option value="female">Жінка</option>
              <option value="other">Інше</option>
            </select>
          </label>

          <label>
            Вік:
            <input
              type="number"
              min={0}
              value={profile.age ?? ''}
              onChange={(e) => setProfile({ ...profile, age: e.target.value ? Number(e.target.value) : null })}
            />
          </label>

          <div>
            <button onClick={saveProfile} disabled={profileSaving}>
              {profileSaving ? 'Зберігається...' : 'Зберегти'}
            </button>
          </div>
        </div>
      ) : (
        <div>Завантаження профілю...</div>
      )}
    </section>
  );
};

export default ProfileSection;
