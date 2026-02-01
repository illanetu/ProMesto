/**
 * Личный кабинет: доступен только авторизованным (middleware + server-side проверка).
 * Показывает данные пользователя и ссылку на выход.
 */
import { auth } from "@/auth"
import Link from "next/link"
import Image from "next/image"

export default async function DashboardPage() {
  const session = await auth()

  // Дополнительная server-side проверка (middleware уже защитил маршрут)
  if (!session?.user) {
    return null
  }

  const { user } = session

  return (
    <main
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        background: "white",
        borderRadius: "16px",
        padding: "2rem",
        boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
      }}
    >
      <h1
        style={{
          fontSize: "1.75rem",
          fontWeight: 700,
          marginBottom: "1.5rem",
          color: "#1a1a1a",
        }}
      >
        Личный кабинет
      </h1>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          padding: "1rem",
          background: "#f5f5f5",
          borderRadius: "12px",
          marginBottom: "1.5rem",
        }}
      >
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name ?? "Аватар"}
            width={56}
            height={56}
            style={{ borderRadius: "50%" }}
          />
        ) : (
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "#ddd",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#666",
              fontWeight: 600,
            }}
          >
            {user.name?.[0] ?? user.email?.[0] ?? "?"}
          </div>
        )}
        <div>
          <p style={{ fontWeight: 600, color: "#1a1a1a" }}>{user.name ?? "Без имени"}</p>
          <p style={{ fontSize: "0.9rem", color: "#666" }}>{user.email}</p>
          <p style={{ fontSize: "0.75rem", color: "#999", fontFamily: "monospace" }}>
            ID: {user.id}
          </p>
        </div>
      </div>

      <nav
        style={{
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <Link
          href="/my-prompts"
          style={{
            padding: "0.75rem 1.25rem",
            background: "#667eea",
            color: "white",
            borderRadius: "8px",
            fontWeight: 600,
          }}
        >
          Мои промты
        </Link>
        <Link
          href="/api/auth/signout"
          style={{
            padding: "0.75rem 1.25rem",
            background: "#eee",
            color: "#333",
            borderRadius: "8px",
            fontWeight: 500,
          }}
        >
          Выйти
        </Link>
        <Link href="/" style={{ padding: "0.75rem 1.25rem", color: "#667eea" }}>
          На главную
        </Link>
      </nav>
    </main>
  )
}
