import { useState } from 'react'
import './ListboxJuegos.css'

function ListboxJuegos({ onJuegoSeleccionado, juegoSeleccionado }) {
  // Lista de juegos disponibles
  const juegos = [
    {
      id: 'assassins-creed',
      nombre: "Assassin's Creed",
      imagen: '🥷',
      descripcion: 'Skins de assassinos históricos',
      color: '#8B0000'
    },
    {
      id: 'for-honor',
      nombre: 'For Honor',
      imagen: '⚔️',
      descripcion: 'Skins de guerreros medievales',
      color: '#4B0082'
    },
    {
      id: 'rainbow-six',
      nombre: 'Rainbow Six Siege',
      imagen: '🔫',
      descripcion: 'Skins tácticas y operadores',
      color: '#FF6600'
    },
    {
      id: 'far-cry',
      nombre: 'Far Cry',
      imagen: '🏔️',
      descripcion: 'Skins de supervivencia',
      color: '#228B22'
    },
    {
      id: 'watch-dogs',
      nombre: 'Watch Dogs',
      imagen: '💻',
      descripcion: 'Skins cyberpunk y hacker',
      color: '#1E90FF'
    },
    {
      id: 'the-division',
      nombre: 'The Division',
      imagen: '🌆',
      descripcion: 'Skins post-apocalípticas',
      color: '#FF4500'
    }
  ]

  // Manejar selección de juego
  const handleJuegoClick = (juego) => {
    onJuegoSeleccionado(juego)
  }

  return (
    <div className="listbox-container">
      <div className="listbox-header">
        <h3>🎮 Selecciona un Juego</h3>
        <p>Elige el juego para crear tu skin</p>
      </div>

      <div className="listbox-content">
        <div className="juegos-listbox">
          {juegos.map(juego => (
            <div
              key={juego.id}
              className={`juego-item ${juegoSeleccionado?.id === juego.id ? 'selected' : ''}`}
              onClick={() => handleJuegoClick(juego)}
              style={{ '--juego-color': juego.color }}
            >
              <div className="juego-icon-container">
                <span className="juego-icon">{juego.imagen}</span>
              </div>
              <div className="juego-details">
                <h4 className="juego-nombre">{juego.nombre}</h4>
                <p className="juego-descripcion">{juego.descripcion}</p>
              </div>
              {juegoSeleccionado?.id === juego.id && (
                <div className="selected-indicator">
                  <span>✓</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {juegoSeleccionado && (
          <div className="seleccion-actual">
            <div className="juego-actual">
              <span className="icon-actual">{juegoSeleccionado.imagen}</span>
              <div className="info-actual">
                <p className="label-actual">Juego seleccionado:</p>
                <p className="nombre-actual">{juegoSeleccionado.nombre}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ListboxJuegos