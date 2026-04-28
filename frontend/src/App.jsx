import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import PlayerDashboardPage from './pages/PlayerDashboardPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/player/:username" element={<PlayerDashboardPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App