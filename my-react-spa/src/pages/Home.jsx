import { Link } from 'react-router-dom'
import './Pages.css'

function Home() {
  return (
    <div className="page">
      <div className="page-content">
        <div className="hero-section">
          <h1 className="hero-title">🎮 Bienvenido al MarketPlace de Skins</h1>
          <p className="hero-subtitle">
            El lugar definitivo para comprar, vender y gestionar skins de los juegos de Ubisoft
          </p>
        </div>
        
        <div className="stats-section">
          <div className="stat-card">
            <h3>1,234</h3>
            <p>Skins Disponibles</p>
          </div>
          <div className="stat-card">
            <h3>567</h3>
            <p>Usuarios Activos</p>
          </div>
          <div className="stat-card">
            <h3>89</h3>
            <p>Skins Vendidas Hoy</p>
          </div>
        </div>
        
        <div className="featured-section">
          <h2>🌟 Skins Destacadas</h2>
          <div className="featured-grid">
            <div className="featured-card">
              <span className="featured-icon">⚔️</span>
              <h4>Pack Medieval</h4>
              <p>Colección completa de For Honor</p>
            </div>
            <div className="featured-card">
              <span className="featured-icon">🥷</span>
              <h4>Assassin Elite</h4>
              <p>Skins exclusivas de Assassin's Creed</p>
            </div>
            <div className="featured-card">
              <span className="featured-icon">🔫</span>
              <h4>Tactical Ops</h4>
              <p>Equipamiento táctico Rainbow Six</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home