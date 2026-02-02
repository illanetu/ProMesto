/**
 * Страница ошибки auth (Configuration, AdapterError и т.п.).
 * Показываем понятное сообщение и ссылку на повторный вход.
 */
import Link from "next/link"

export default function AuthErrorPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        background: "linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          padding: "3rem",
          boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
          maxWidth: "400px",
          width: "100%",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "0.5rem", color: "#1a1a1a" }}>
          ProMesto
        </h1>
        <p style={{ color: "#b91c1c", marginBottom: "1rem", fontSize: "0.95rem" }}>
          Ошибка входа (временная проблема с подключением к БД).
        </p>
        <p style={{ color: "#666", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
          Нажмите кнопку ниже и попробуйте войти снова.
        </p>
        <Link
          href="/login"
          style={{
            display: "inline-block",
            padding: "0.875rem 1.5rem",
            fontSize: "1rem",
            fontWeight: 600,
            color: "#fff",
            background: "#667eea",
            border: "none",
            borderRadius: "8px",
            textDecoration: "none",
            cursor: "pointer",
          }}
        >
          Повторить вход
        </Link>
        <p style={{ marginTop: "1.5rem", fontSize: "0.8rem", color: "#999" }}>
          <Link href="/" style={{ color: "#667eea" }}>
            На главную
          </Link>
        </p>
      </div>
    </main>
  )
}
