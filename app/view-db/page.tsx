'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  createRecord,
  deleteRecord,
  getTableData,
  getTables,
  updateRecord,
  TABLE_CONFIG,
  type TableKey,
  type ViewDbEnv,
} from './actions'

const PAGE_SIZE = 10

export default function ViewDbPage() {
  const [dbEnv, setDbEnv] = useState<ViewDbEnv>('production')
  const [tables, setTables] = useState<{ key: TableKey; label: string }[]>([])
  const [tableError, setTableError] = useState<string | null>(null)
  const [selectedTable, setSelectedTable] = useState<TableKey | null>(null)
  const [data, setData] = useState<Record<string, unknown>[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [dataError, setDataError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Record<string, string | number>>({})
  const [crudError, setCrudError] = useState<string | null>(null)

  const loadTables = useCallback(async () => {
    setTableError(null)
    setLoading(true)
    const res = await getTables(dbEnv)
    setLoading(false)
    if (res.ok) setTables(res.tables)
    else setTableError(res.error)
  }, [dbEnv])

  useEffect(() => {
    loadTables()
  }, [loadTables])

  const openTable = useCallback(async (key: TableKey) => {
    setSelectedTable(key)
    setPage(1)
    setDataError(null)
    setLoading(true)
    const res = await getTableData(dbEnv, key, 1)
    setLoading(false)
    if (res.ok) {
      setData(res.data as Record<string, unknown>[])
      setTotal(res.total)
    } else setDataError(res.error)
  }, [dbEnv])

  const loadPage = useCallback(async () => {
    if (!selectedTable) return
    setDataError(null)
    setLoading(true)
    const res = await getTableData(dbEnv, selectedTable, page)
    setLoading(false)
    if (res.ok) {
      setData(res.data as Record<string, unknown>[])
      setTotal(res.total)
    } else setDataError(res.error)
  }, [dbEnv, selectedTable, page])

  useEffect(() => {
    if (selectedTable) loadPage()
  }, [selectedTable, page, loadPage])

  const openCreate = () => {
    if (!selectedTable) return
    const config = TABLE_CONFIG[selectedTable]
    const initial: Record<string, string | number> = {}
    config.fields.forEach((f) => {
      initial[f.key] = f.type === 'number' ? 1 : ''
      if (f.type === 'enum' && f.enumValues?.[0]) initial[f.key] = f.enumValues[0]
    })
    setFormData(initial)
    setEditId(null)
    setModal('create')
    setCrudError(null)
  }

  const openEdit = (row: Record<string, unknown>) => {
    if (!selectedTable) return
    const config = TABLE_CONFIG[selectedTable]
    const id = row[config.idField]
    if (typeof id !== 'string') return
    const initial: Record<string, string | number> = {}
    config.fields.forEach((f) => {
      const v = row[f.key]
      if (v instanceof Date) initial[f.key] = v.toISOString().slice(0, 16)
      else if (typeof v === 'number') initial[f.key] = v
      else initial[f.key] = (v ?? '') as string
    })
    setFormData(initial)
    setEditId(id)
    setModal('edit')
    setCrudError(null)
  }

  const submitCreate = async () => {
    if (!selectedTable) return
    setCrudError(null)
    const res = await createRecord(dbEnv, selectedTable, formData as Record<string, unknown>)
    if (res.ok) {
      setModal(null)
      loadPage()
    } else setCrudError(res.error)
  }

  const submitEdit = async () => {
    if (!selectedTable || !editId) return
    setCrudError(null)
    const res = await updateRecord(dbEnv, selectedTable, editId, formData as Record<string, unknown>)
    if (res.ok) {
      setModal(null)
      setEditId(null)
      loadPage()
    } else setCrudError(res.error)
  }

  const handleDelete = async (id: string) => {
    if (!selectedTable || !confirm('Удалить запись?')) return
    setCrudError(null)
    const res = await deleteRecord(dbEnv, selectedTable, id)
    if (res.ok) loadPage()
    else setCrudError(res.error)
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const columns = data.length > 0 ? Object.keys(data[0]) : []

  return (
    <main style={styles.main}>
      <h1 style={styles.h1}>view-db</h1>
      <p style={styles.subtitle}>
        Тестовая программа: выберите локальную или рабочую БД → список таблиц с кнопкой «Открыть» → таблица с пагинацией и CRUD.
      </p>

      <section style={styles.section}>
        <label style={styles.label}>База данных:</label>
        <select
          value={dbEnv}
          onChange={(e) => {
            setDbEnv(e.target.value as ViewDbEnv)
            setSelectedTable(null)
          }}
          style={styles.select}
        >
          <option value="local">Локальная (DATABASE_URL_LOCAL)</option>
          <option value="production">Рабочая (DATABASE_URL)</option>
        </select>
        <button type="button" onClick={loadTables} style={styles.button} disabled={loading}>
          {loading ? 'Загрузка…' : 'Обновить список'}
        </button>
      </section>

      {tableError && <p style={styles.error}>{tableError}</p>}

      <section style={styles.section}>
        <h2 style={styles.h2}>Таблицы</h2>
        <ul style={styles.tableList}>
          {tables.map(({ key, label }) => (
            <li key={key} style={styles.tableItem}>
              <span style={styles.tableName}>{label}</span>
              <button
                type="button"
                onClick={() => openTable(key)}
                style={styles.buttonSmall}
              >
                Открыть
              </button>
            </li>
          ))}
        </ul>
      </section>

      {selectedTable && (
        <section style={styles.section}>
          <h2 style={styles.h2}>
            {TABLE_CONFIG[selectedTable].label}
            <button type="button" onClick={openCreate} style={styles.buttonAdd}>
              + Создать
            </button>
          </h2>
          {dataError && <p style={styles.error}>{dataError}</p>}
          {crudError && <p style={styles.error}>{crudError}</p>}

          {data.length === 0 && !loading && (
            <p style={styles.empty}>Записей нет</p>
          )}

          {data.length > 0 && (
            <>
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      {columns.map((col) => (
                        <th key={col} style={styles.th}>
                          {col}
                        </th>
                      ))}
                      <th style={styles.th}>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, i) => {
                      const id = row[TABLE_CONFIG[selectedTable].idField] as string
                      return (
                        <tr key={id ?? i}>
                          {columns.map((col) => (
                            <td key={col} style={styles.td}>
                              {row[col] instanceof Date
                                ? (row[col] as Date).toLocaleString('ru-RU')
                                : String(row[col] ?? '')}
                            </td>
                          ))}
                          <td style={styles.td}>
                            <button
                              type="button"
                              onClick={() => openEdit(row)}
                              style={styles.buttonSmall}
                            >
                              Изменить
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(id)}
                              style={styles.buttonDanger}
                            >
                              Удалить
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div style={styles.pagination}>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || loading}
                  style={styles.button}
                >
                  Назад
                </button>
                <span style={styles.pageInfo}>
                  Страница {page} из {totalPages} (всего {total})
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= totalPages || loading}
                  style={styles.button}
                >
                  Вперёд
                </button>
              </div>
            </>
          )}
        </section>
      )}

      {modal && selectedTable && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={styles.h3}>
              {modal === 'create' ? 'Создать запись' : 'Изменить запись'}
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                modal === 'create' ? submitCreate() : submitEdit()
              }}
              style={styles.form}
            >
              {TABLE_CONFIG[selectedTable].fields.map((f) => (
                <div key={f.key} style={styles.field}>
                  <label style={styles.label}>
                    {f.label}
                    {f.required && ' *'}
                  </label>
                  {f.type === 'enum' && f.enumValues ? (
                    <select
                      value={String(formData[f.key] ?? '')}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, [f.key]: e.target.value }))
                      }
                      style={styles.input}
                      required={f.required}
                    >
                      {f.enumValues.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  ) : f.type === 'number' ? (
                    <input
                      type="number"
                      value={formData[f.key] ?? ''}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          [f.key]: e.target.value ? Number(e.target.value) : 0,
                        }))
                      }
                      style={styles.input}
                      required={f.required}
                    />
                  ) : (
                    <input
                      type="text"
                      value={String(formData[f.key] ?? '')}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, [f.key]: e.target.value }))
                      }
                      style={styles.input}
                      required={f.required}
                    />
                  )}
                </div>
              ))}
              <div style={styles.modalActions}>
                <button type="submit" style={styles.button}>
                  {modal === 'create' ? 'Создать' : 'Сохранить'}
                </button>
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  style={styles.buttonSecondary}
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    maxWidth: 960,
    margin: '0 auto',
    background: 'white',
    borderRadius: 12,
    padding: '1.5rem 2rem',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
  },
  h1: { fontSize: '1.75rem', marginBottom: '0.5rem', color: '#333' },
  subtitle: { fontSize: '0.9rem', color: '#666', marginBottom: '1rem' },
  h2: { fontSize: '1.25rem', marginBottom: '0.75rem', color: '#444', display: 'flex', alignItems: 'center', gap: 12 },
  h3: { fontSize: '1.1rem', marginBottom: '1rem', color: '#333' },
  section: { marginBottom: '1.5rem' },
  label: { display: 'block', marginBottom: 4, fontSize: '0.9rem', color: '#555' },
  select: { padding: '8px 12px', marginRight: 8, borderRadius: 6, border: '1px solid #ccc', fontSize: 14 },
  button: { padding: '8px 16px', borderRadius: 6, border: 'none', background: '#667eea', color: 'white', cursor: 'pointer', fontSize: 14 },
  buttonSmall: { padding: '4px 10px', marginRight: 6, borderRadius: 4, border: 'none', background: '#667eea', color: 'white', cursor: 'pointer', fontSize: 12 },
  buttonAdd: { marginLeft: 'auto', padding: '6px 12px', fontSize: 13 },
  buttonDanger: { padding: '4px 10px', borderRadius: 4, border: 'none', background: '#dc3545', color: 'white', cursor: 'pointer', fontSize: 12 },
  buttonSecondary: { padding: '8px 16px', borderRadius: 6, border: '1px solid #ccc', background: 'white', cursor: 'pointer', fontSize: 14, marginLeft: 8 },
  error: { color: '#c00', marginTop: 4, fontSize: 14 },
  tableList: { listStyle: 'none', padding: 0, margin: 0 },
  tableItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid #eee' },
  tableName: { flex: 1, fontSize: 14 },
  tableWrap: { overflowX: 'auto', marginBottom: 12 },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: { textAlign: 'left', padding: '8px 10px', borderBottom: '2px solid #667eea', background: '#f8f9fa' },
  td: { padding: '8px 10px', borderBottom: '1px solid #eee' },
  empty: { color: '#888', fontStyle: 'italic' },
  pagination: { display: 'flex', alignItems: 'center', gap: 16 },
  pageInfo: { fontSize: 14, color: '#555' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: 'white', borderRadius: 12, padding: '1.5rem', minWidth: 320, maxWidth: 420 },
  form: { display: 'flex', flexDirection: 'column', gap: 12 },
  field: { display: 'flex', flexDirection: 'column', gap: 4 },
  input: { padding: '8px 10px', borderRadius: 6, border: '1px solid #ccc', fontSize: 14 },
  modalActions: { display: 'flex', marginTop: 12 },
}
