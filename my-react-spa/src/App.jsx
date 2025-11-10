import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/common/ProtectedRoute'
import Home from './pages/Home'
import GestionarSkins from './pages/GestionarSkins'
import ExplorarSkins from './pages/ExplorarSkins'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import './App.css'

// Componente para la navegación
function Navigation() {
  const location = useLocation()
  const { isAuthenticated, user } = useAuth()
  
  return (
    <header className="app-header">
      <h1 className="app-title">🎮 MarketPlace Ubisoft - Skins</h1>
      
      <nav className="app-nav">
        <Link 
          to="/"
          className={`nav-button ${location.pathname === '/' ? 'active' : ''}`}
        >
          🏠 Inicio
        </Link>

        {isAuthenticated ? (
          <>
            <Link 
              to="/gestionar-skins"
              className={`nav-button ${location.pathname === '/gestionar-skins' ? 'active' : ''}`}
            >
              🛠️ Gestionar Skins
            </Link>
            
            <Link 
              to="/explorar-skins"
              className={`nav-button ${location.pathname === '/explorar-skins' ? 'active' : ''}`}
            >
              🔍 Explorar Skins
            </Link>

            <Link 
              to="/profile"
              className={`nav-button profile-button ${location.pathname === '/profile' ? 'active' : ''}`}
            >
              {user?.avatar || '👤'} Perfil
            </Link>
          </>
        ) : (
          <>
            <Link 
              to="/login"
              className={`nav-button ${location.pathname === '/login' ? 'active' : ''}`}
            >
              🔑 Iniciar Sesión
            </Link>
            
            <Link 
              to="/register"
              className={`nav-button ${location.pathname === '/register' ? 'active' : ''}`}
            >
              📝 Registrarse
            </Link>
          </>
        )}
      </nav>
    </header>
  )
}

// Componente principal de la app
function AppContent() {
  return (
    <div className="app">
      <Navigation />
      
      <main className="app-main">
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rutas protegidas (requieren autenticación) */}
          <Route 
            path="/gestionar-skins" 
            element={
              <ProtectedRoute>
                <GestionarSkins />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/explorar-skins" 
            element={
              <ProtectedRoute>
                <ExplorarSkins />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />

          {/* Ruta 404 */}
          <Route path="*" element={
            <div className="page">
              <div className="page-content" style={{textAlign: 'center'}}>
                <h1>🚫 Página no encontrada</h1>
                <p>La página que buscas no existe.</p>
                <Link to="/" className="hero-button primary">
                  Volver al Inicio
                </Link>
              </div>
            </div>
          } />
        </Routes>
      </main>
    </div>
  )
}

// App principal con Provider
function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  )
}

export default App