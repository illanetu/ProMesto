/**
 * Мои промты: данные пользователя (Mesto, Note), привязанные к userId.
 * Приватные записи видит только владелец (фильтрация по session.user.id).
 */
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function MyPromptsPage() {
  const session = await auth()

  if (!session?.user?.id) {
    return null
  }

  const userId = session.user.id

  // Только записи текущего пользователя (приватные данные недоступны другим)
  const [notes, mestos] = await Promise.all([
    prisma.note.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.mesto.findMany({
      where: { ownerId: userId },
      orderBy: { updatedAt: "desc" },
      take: 50,
      include: { category: true },
    }),
  ])

  return (
    <main
      style={{
        maxWidth: "900px",
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
          marginBottom: "0.5rem",
          color: "#1a1a1a",
        }}
      >
        Мои промты
      </h1>
      <p style={{ color: "#666", marginBottom: "1.5rem", fontSize: "0.95rem" }}>
        Заметки и места, привязанные к вашему аккаунту. Приватные данные видны только вам.
      </p>

      <nav style={{ marginBottom: "1.5rem" }}>
        <Link
          href="/dashboard"
          style={{ color: "#667eea", marginRight: "1rem" }}
        >
          ← В кабинет
        </Link>
        <Link href="/api/auth/signout" style={{ color: "#666" }}>
          Выйти
        </Link>
      </nav>

      <section style={{ marginBottom: "2rem" }}>
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: 600,
            marginBottom: "0.75rem",
            color: "#333",
          }}
        >
          Заметки ({notes.length})
        </h2>
        {notes.length === 0 ? (
          <p style={{ color: "#999", fontSize: "0.9rem" }}>Нет заметок.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {notes.map((note) => (
              <li
                key={note.id}
                style={{
                  padding: "0.75rem",
                  background: "#f9f9f9",
                  borderRadius: "8px",
                  marginBottom: "0.5rem",
                  border: "1px solid #eee",
                }}
              >
                <strong>{note.title}</strong>
                <span style={{ fontSize: "0.85rem", color: "#666", marginLeft: "0.5rem" }}>
                  {new Date(note.createdAt).toLocaleString("ru-RU")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: 600,
            marginBottom: "0.75rem",
            color: "#333",
          }}
        >
          Места ({mestos.length})
        </h2>
        {mestos.length === 0 ? (
          <p style={{ color: "#999", fontSize: "0.9rem" }}>Нет мест.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {mestos.map((m) => (
              <li
                key={m.id}
                style={{
                  padding: "0.75rem",
                  background: "#f9f9f9",
                  borderRadius: "8px",
                  marginBottom: "0.5rem",
                  border: "1px solid #eee",
                }}
              >
                <strong>{m.title}</strong>
                <span style={{ fontSize: "0.85rem", color: "#666", marginLeft: "0.5rem" }}>
                  {m.visibility === "PRIVATE" ? "🔒 Приватное" : "Публичное"}
                  {m.category ? ` · ${m.category.category}` : ""}
                </span>
                <span style={{ fontSize: "0.8rem", color: "#999", marginLeft: "0.5rem" }}>
                  {new Date(m.updatedAt).toLocaleString("ru-RU")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
