import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import styles from "./Settings.module.scss";
import { useTheme } from "../../context/ThemeContext";

const Settings = () => {
  const { isTheme, setIsTheme } = useTheme();
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      sms: false,
    },
    privacy: {
      profileVisibility: "public",
      dataSharing: false,
    },
    appearance: {
      language: "en",
    },
  });

  const handleNotificationChange = (type: string, value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: value,
      },
    }));
  };

  const handlePrivacyChange = (field: string, value: string | boolean) => {
    setSettings((prev) => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [field]: value,
      },
    }));
  };

  const handleAppearanceChange = (field: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        [field]: value,
      },
    }));
  };


  return (
    <div className={styles.settingsContainer}>
      <div className={styles.settingsHeader}>
        <h1>Settings</h1>
        <p>Manage your account preferences and application settings</p>
      </div>

      <div className={styles.settingsContent}>
        {/* Account Information */}
        <div className={styles.settingsSection}>
          <h2>Account Information</h2>
          <div className={styles.accountInfo}>
            <div className={styles.infoItem}>
              <label>Name</label>
              <span>{user?.name || "Not set"}</span>
            </div>
            <div className={styles.infoItem}>
              <label>Email</label>
              <span>{user?.email || "Not set"}</span>
            </div>
            <div className={styles.infoItem}>
              <label>Role</label>
              <span>{user?.role || "Not set"}</span>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className={styles.settingsSection}>
          <h2>Notifications</h2>
          <div className={styles.settingGroup}>
            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <label htmlFor="email-notifications">Email Notifications</label>
                <p>Receive updates and announcements via email</p>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  id="email-notifications"
                  checked={settings.notifications.email}
                  onChange={(e) =>
                    handleNotificationChange("email", e.target.checked)
                  }
                />
                <span className={styles.slider}></span>
              </label>
            </div>

            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <label htmlFor="push-notifications">Push Notifications</label>
                <p>Get instant notifications on your device</p>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  id="push-notifications"
                  checked={settings.notifications.push}
                  onChange={(e) =>
                    handleNotificationChange("push", e.target.checked)
                  }
                />
                <span className={styles.slider}></span>
              </label>
            </div>

            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <label htmlFor="sms-notifications">SMS Notifications</label>
                <p>Receive important alerts via text message</p>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  id="sms-notifications"
                  checked={settings.notifications.sms}
                  onChange={(e) =>
                    handleNotificationChange("sms", e.target.checked)
                  }
                />
                <span className={styles.slider}></span>
              </label>
            </div>
          </div>
        </div>

        {/* Privacy */}
        <div className={styles.settingsSection}>
          <h2>Privacy</h2>
          <div className={styles.settingGroup}>
            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <label htmlFor="profile-visibility">Profile Visibility</label>
                <p>Control who can see your profile information</p>
              </div>
              <select
                id="profile-visibility"
                value={settings.privacy.profileVisibility}
                onChange={(e) =>
                  handlePrivacyChange("profileVisibility", e.target.value)
                }
                className={styles.select}
              >
                <option value="public">Public</option>
                <option value="members">Members Only</option>
                <option value="private">Private</option>
              </select>
            </div>

            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <label htmlFor="data-sharing">Data Sharing</label>
                <p>Allow anonymous usage data to help improve the app</p>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  id="data-sharing"
                  checked={settings.privacy.dataSharing}
                  onChange={(e) =>
                    handlePrivacyChange("dataSharing", e.target.checked)
                  }
                />
                <span className={styles.slider}></span>
              </label>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className={styles.settingsSection}>
          <h2>Appearance</h2>
          <div className={styles.settingGroup}>
            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <label htmlFor="theme">Theme</label>
                <p>Choose your preferred color scheme</p>
              </div>
              <select
                id="theme"
                value={isTheme === "white" ? "light" : "dark"}
                onChange={(e) => {
                  const val = e.target.value;
                  setIsTheme(val === "light" ? "white" : "g100");
                }}
                className={styles.select}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>

            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <label htmlFor="language">Language</label>
                <p>Select your preferred language</p>
              </div>
              <select
                id="language"
                value={settings.appearance.language}
                onChange={(e) =>
                  handleAppearanceChange("language", e.target.value)
                }
                className={styles.select}
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className={styles.saveSection}>
          <button className={styles.saveButton}>Save Settings</button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
