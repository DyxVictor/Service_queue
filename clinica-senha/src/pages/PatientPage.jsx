import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function PatientPage() {
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const pegarSenha = async () => {
    setLoading(true)
    setError('')
    try {
      // Pega o próximo número
      const { data: nextData, error: nextError } = await supabase.rpc('get_next_ticket_number')
      if (nextError) throw nextError

      const nextNumber = nextData

      // Cria a senha
      const { data, error: insertError } = await supabase
        .from('tickets')
        .insert({ number: nextNumber, status: 'waiting', queue_type: 'geral' })
        .select()
        .single()

      if (insertError) throw insertError

      setTicket(data)
    } catch (err) {
      setError(err.message || 'Erro ao pegar senha')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2rem', padding: '2rem' }}>
      <h1 style={{ fontSize: '2.5rem', textAlign: 'center' }}>Retire sua senha</h1>

      {!ticket ? (
        <button
          onClick={pegarSenha}
          disabled={loading}
          style={{
            fontSize: '2rem',
            padding: '1.5rem 3rem',
            background: '#22c55e',
            color: 'white',
            borderRadius: '16px',
            minWidth: '300px'
          }}
        >
          {loading ? 'Gerando...' : 'Pegar Senha'}
        </button>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Sua senha é:</p>
          <div style={{ fontSize: '6rem', fontWeight: 'bold', color: '#22c55e' }}>
            {String(ticket.number).padStart(3, '0')}
          </div>
          <p style={{ marginTop: '1rem', color: '#94a3b8' }}>Aguarde ser chamado na tela</p>
          <button
            onClick={() => setTicket(null)}
            style={{ marginTop: '2rem', padding: '0.75rem 1.5rem', background: '#334155', color: 'white' }}
          >
            Pegar outra senha
          </button>
        </div>
      )}

      {error && <p style={{ color: '#ef4444' }}>{error}</p>}
    </div>
  )
}