import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

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
    const channel = supabase.channel('entries')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'entries' }, () => fetchEntries())
      .subscribe()
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
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>Maughan Hub</h1>
      <p style={{ textAlign: 'center', color: '#666' }}>Team updates • Real-time • No login required</p>

      <form onSubmit={handleSubmit} style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
        <input placeholder="Your name" value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%', padding: '0.8rem', marginBottom: '1rem', border: '1px solid #ddd', borderRadius: '4px' }} />
        <textarea placeholder="What's new?" rows={4} value={message} onChange={e => setMessage(e.target.value)} required style={{ width: '100%', padding: '0.8rem', marginBottom: '1rem', border: '1px solid #ddd', borderRadius: '4px' }} />
        <button type="submit" disabled={loading} style={{ width: '100%', background: '#0066cc', color: 'white', border: 'none', padding: '0.8rem', borderRadius: '4px', cursor: 'pointer' }}>
          {loading ? 'Sending…' : 'Send Update'}
        </button>
      </form>

      <div>
        {entries.length === 0 ? <p style={{ textAlign: 'center', color: '#666' }}>No updates yet — be the first!</p> : entries.map(entry => (
          <div key={entry.id} style={{ background: 'white', padding: '1rem', border: '1px solid #eee', borderRadius: '8px', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#444', marginBottom: '0.5rem' }}>
              <strong>{entry.name}</strong>
              <span>{new Date(entry.created_at).toLocaleString()}</span>
            </div>
            <p style={{ margin: 0 }}>{entry.message}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
