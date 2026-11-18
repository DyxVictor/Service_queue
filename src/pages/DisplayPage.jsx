import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export default function DisplayPage() {
  const [current, setCurrent] = useState(null)
  const [recent, setRecent] = useState([])

  const loadCurrent = async () => {
    const { data } = await supabase
      .from('tickets')
      .select('*')
      .eq('status', 'called')
      .order('called_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    setCurrent(data)
  }

  const loadRecent = async () => {
    const { data } = await supabase
      .from('tickets')
      .select('*')
      .eq('status', 'called')
      .order('called_at', { ascending: false })
      .limit(5)

    setRecent(data || [])
  }

  useEffect(() => {
    loadCurrent()
    loadRecent()

    const channel = supabase
      .channel('tickets-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tickets' },
        () => {
          loadCurrent()
          loadRecent()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#020617', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem', color: '#94a3b8' }}>SENHA ATUAL</h1>

      {current ? (
        <div style={{ fontSize: '12rem', fontWeight: 'bold', color: '#22c55e', lineHeight: 1 }}>
          {String(current.number).padStart(3, '0')}
        </div>
      ) : (
        <div style={{ fontSize: '4rem', color: '#64748b' }}>---</div>
      )}

      <div style={{ marginTop: '4rem', width: '100%', maxWidth: '600px' }}>
        <h2 style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '1rem' }}>Últimas chamadas</h2>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {recent.map((t) => (
            <div key={t.id} style={{ fontSize: '2rem', padding: '0.5rem 1rem', background: '#1e293b', borderRadius: '8px' }}>
              {String(t.number).padStart(3, '0')}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}