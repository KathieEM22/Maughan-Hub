import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import './App.css'

const supabase = createClient(
  'https://pviyqezfvnwllwggvszd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2aXlxZXpmdm53bGx3Z2d2c3pkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM4OTk5MDAsImV4cCI6MjA0OTQ3NTkwMH0.LZ2lZ8e5xL8Zx8q5v8zY8T8v8w8x8y8z9A9B9C9D9E9F'
)

export default function App() {
  const [entries, setEntries] = useState([])
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchEntries()
    const channel = supabase.channel('entries').on('postgres_changes', { event: '*', schema: 'public', table: 'entries' }, () => fetchEntries()).subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  async function fetchEntries() {
    const { data } = await supabase.from('entries').select().order('created_at', { ascending: false })
    setEntries(data || [])
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim() || !message.trim()) return
    setLoading(true)
    await supabase.from('entries').insert({ name: name.trim(), message: message.trim() })
    setName('')
    setMessage('')
    setLoading(false)
  }

  return (
    <>
      <div className="container">
        <h1>Maughan Hub</h1>
        <p>Team updates • Real-time • No login required</p>

        <form onSubmit={handleSubmit} className="form">
          <input placeholder="Your name" value={name} onChange={e => setName(e.target.value)} required />
          <textarea placeholder="What’s new?" rows={3} value={message} onChange={e => setMessage(e.target.value)} required />
          <button type="submit" disabled={loading}>{loading ? 'Sending…' : 'Send Update'}</button>
        </form>

        <div className="entries">
          {entries.length === 0 ? <p>No updates yet — be the first!</p> : entries.map(entry => (
            <div key={entry.id} className="entry">
              <div className="header">
                <strong>{entry.name}</strong>
                <span>{new Date(entry.created_at).toLocaleString()}</span>
              </div>
              <p>{entry.message}</p>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .container { max-width: 600px; margin: 2rem auto; padding: 0 1rem; font-family: system-ui, sans-serif; }
        h1 { text-align: center; margin-bottom: 0.5rem; }
        p { text-align: center; color: #666; margin-bottom: 2rem; }
        .form { background: #f9f9f9; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem; }
        input, textarea { width: 100%; padding: 0.8rem; margin-bottom: 1rem; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem; }
        button { background: #0066cc; color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 4px; font-size: 1rem; cursor: pointer; }
        button:disabled { background: #999; }
        .entries { display: flex; flex-direction: column; gap: 1rem; }
        .entry { background: white; padding: 1rem; border: 1px solid #eee; border-radius: 8px; }
        .header { display: flex; justify-content: space-between; margin-bottom: 0.5rem; color: #444; font-size: 0.9rem; }
      `}</style>
    </>
  )
}
