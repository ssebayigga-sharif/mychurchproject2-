import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styles from "./Login.module.scss";

export const Login = () => {
  const [email, setEmail] = useState("admin@church.org");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "error" | "success" } | null>(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const showToast = (message: string, type: "error" | "success" = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      // On success, redirect to dashboard
      navigate("/", { replace: true });
    } catch (err: any) {
      showToast(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      
      {toast && (
        <div className={`${styles.toast} ${styles[`toast${toast.type}`]}`}>
          {toast.type === "error" ? "❌" : "✅"} {toast.message}
        </div>
      )}

      <div className={styles.loginCard}>
        <div className={styles.header}>
          <div className={styles.brandIcon}>K</div>
          <h1 className={styles.title}>Welcome Back</h1>
          <p className={styles.subtitle}>Sign in to access the Church Dashboard</p>
        </div>

        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>Email Address</label>
            <input 
              type="email" 
              placeholder="admin@church.org" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>
        
        <div className={styles.footerInfo}>
          Demo Credentials: <b>admin@church.org</b> / <b>admin123</b>
        </div>
      </div>
    </div>
  );
};
