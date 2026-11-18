import { Routes, Route, Link } from 'react-router-dom'
import PatientPage from './pages/PatientPage'
import DisplayPage from './pages/DisplayPage'
import StaffPage from './pages/StaffPage'

export default function App() {
  return (
    <div>
      <nav style={{ padding: '1rem', background: '#1e293b', display: 'flex', gap: '1.5rem' }}>
        <Link to="/">Pegar Senha</Link>
        <Link to="/tela">Tela de Chamada</Link>
        <Link to="/painel">Painel Atendentes</Link>
      </nav>
      <Routes>
        <Route path="/" element={<PatientPage />} />
        <Route path="/tela" element={<DisplayPage />} />
        <Route path="/painel" element={<StaffPage />} />
      </Routes>
    </div>
  )
}