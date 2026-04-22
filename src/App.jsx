import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Auth from './pages/Auth/Auth'
import Dashboard from './pages/Dashboard/Dashboard'
import SessionResult from './pages/SessionResult/SessionResult'
import Leaderboard from './pages/Leaderboard/Leaderboard'
import AdminPanel from './pages/AdminPanel/AdminPanel'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/session/:id" element={<SessionResult />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Router>
  )
}

export default App
