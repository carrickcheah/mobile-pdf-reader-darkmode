import { useState, type FormEvent } from "react";

interface Props {
  onLogin: (email: string, password: string) => string | null;
}

export default function LoginScreen({ onLogin }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const err = onLogin(email, password);
    if (err) setError(err);
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.logo}>Dark Reader</div>
        <p style={styles.subtitle}>PDF reader for your eyes</p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoFocus
          required
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
        />

        {error && <p style={styles.error}>{error}</p>}

        <button type="submit" style={styles.button}>
          Sign In
        </button>
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    background: "#121212",
  },
  form: {
    width: "100%",
    maxWidth: 360,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  logo: {
    fontSize: 28,
    fontWeight: 700,
    color: "#fff",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    padding: "14px 16px",
    borderRadius: 10,
    border: "1px solid #2a2a2a",
    background: "#1e1e1e",
    color: "#e0e0e0",
    fontSize: 16,
    outline: "none",
  },
  error: {
    color: "#ef4444",
    fontSize: 13,
    textAlign: "center",
  },
  button: {
    marginTop: 8,
    padding: "14px 0",
    borderRadius: 10,
    background: "#4A9EFF",
    color: "#fff",
    fontSize: 16,
    fontWeight: 600,
    border: "none",
    cursor: "pointer",
  },
};
