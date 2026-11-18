import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export default function StaffPage() {
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [waiting, setWaiting] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) return

    const loadWaiting = async () => {
      const { data } = await supabase
        .from('tickets')
        .select('*')
        .eq('status', 'waiting')
        .order('number', { ascending: true })

      setWaiting(data || [])
    }

    loadWaiting()

    const channel = supabase
      .channel('staff-tickets')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, loadWaiting)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [session])

  const login = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setMessage(error.message)
    setLoading(false)
  }

  const logout = async () => {
    await supabase.auth.signOut()
  }

  const chamarProxima = async () => {
    if (waiting.length === 0) {
      setMessage('Não há senhas na fila')
      return
    }

    const next = waiting[0]
    setLoading(true)

    const { error } = await supabase
      .from('tickets')
      .update({ status: 'called', called_at: new Date().toISOString() })
      .eq('id', next.id)

    if (error) setMessage(error.message)
    else setMessage(`Senha ${String(next.number).padStart(3, '0')} chamada!`)

    setLoading(false)
  }

  if (!session) {
    return (
      <div style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem', background: '#1e293b', borderRadius: '12px' }}>
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Login Atendentes</h2>
        <form onSubmit={login} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ padding: '0.75rem', borderRadius: '8px', border: 'none' }}
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ padding: '0.75rem', borderRadius: '8px', border: 'none' }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{ padding: '0.75rem', background: '#3b82f6', color: 'white', borderRadius: '8px' }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        {message && <p style={{ color: '#ef4444', marginTop: '1rem', textAlign: 'center' }}>{message}</p>}
        <p style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: '#94a3b8', textAlign: 'center' }}>
          Peça para o administrador criar seu usuário no Supabase Auth.
        </p>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Painel de Atendimento</h1>
        <button onClick={logout} style={{ padding: '0.5rem 1rem', background: '#475569', color: 'white' }}>
          Sair
        </button>
      </div>

      <button
        onClick={chamarProxima}
        disabled={loading || waiting.length === 0}
        style={{
          fontSize: '1.5rem',
          padding: '1rem 2rem',
          background: '#22c55e',
          color: 'white',
          borderRadius: '12px',
          marginBottom: '2rem'
        }}
      >
        {loading ? 'Chamando...' : 'Chamar Próxima Senha'}
      </button>

      {message && <p style={{ marginBottom: '1rem', color: '#22c55e' }}>{message}</p>}

      <h2>Fila de espera ({waiting.length})</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
        {waiting.length === 0 && <p style={{ color: '#94a3b8' }}>Nenhuma senha aguardando</p>}
        {waiting.map((t) => (
          <div key={t.id} style={{ fontSize: '1.5rem', padding: '0.75rem 1.25rem', background: '#1e293b', borderRadius: '8px' }}>
            {String(t.number).padStart(3, '0')}
          </div>
        ))}
      </div>
    </div>
  )
}