/**
 * Страница входа: кнопка «Войти через Google».
 * Если пользователь уже авторизован — редирект в личный кабинет (/dashboard).
 */
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { GoogleSignInButton } from "./google-signin-button"

export default async function LoginPage() {
  const session = await auth()

  if (session?.user) {
    redirect("/dashboard")
  }

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
        <h1
          style={{
            fontSize: "1.75rem",
            fontWeight: 700,
            marginBottom: "0.5rem",
            color: "#1a1a1a",
          }}
        >
          ProMesto
        </h1>
        <p
          style={{
            color: "#666",
            marginBottom: "2rem",
            fontSize: "0.95rem",
          }}
        >
          Войдите, чтобы управлять своими промтами
        </p>

        <GoogleSignInButton />

        <p
          style={{
            marginTop: "1.5rem",
            fontSize: "0.8rem",
            color: "#999",
          }}
        >
          <Link href="/" style={{ color: "#667eea" }}>
            На главную
          </Link>
        </p>
      </div>
    </main>
  )
}
