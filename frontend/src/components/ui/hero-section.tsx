import React, { useEffect, useRef } from 'react'

interface HeroSectionProps {
  onExploreEvents?: () => void
  onOrganizeEvent?: () => void
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreEvents = () => {},
  onOrganizeEvent = () => {}
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 3D Canvas Animation
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    resizeCanvas()

    class Particle3D {
      x: number
      y: number
      z: number
      vz: number

      constructor() {
        this.x = 0
        this.y = 0
        this.z = 0
        this.vz = 0
        this.reset()
      }

      reset() {
        if (canvas) {
          this.x = Math.random() * canvas.width
          this.y = Math.random() * canvas.height
        } else {
          this.x = Math.random() * 800
          this.y = Math.random() * 600
        }
        this.z = Math.random() * 1000
        this.vz = Math.random() * 2 + 1
      }

      update(mouseX: number, mouseY: number) {
        this.z -= this.vz
        if (this.z <= 0) this.reset()

        const dx = mouseX - this.x
        const dy = mouseY - this.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < 100) {
          this.x -= dx * 0.01
          this.y -= dy * 0.01
        }
      }

      draw(ctx: CanvasRenderingContext2D) {
        if (!canvas) return

        const scale = 1000 / (1000 + this.z)
        const x2d = (this.x - canvas.width / 2) * scale + canvas.width / 2
        const y2d = (this.y - canvas.height / 2) * scale + canvas.height / 2
        const size = (1 - this.z / 1000) * 3

        ctx.beginPath()
        ctx.fillStyle = `rgba(107, 30, 34, ${1 - this.z / 1000})`
        ctx.arc(x2d, y2d, size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    let mouseX = canvas.width / 2
    let mouseY = canvas.height / 2

    const particles = Array.from({ length: 80 }, () => new Particle3D())

    const animate3D = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(particle => {
        particle.update(mouseX, mouseY)
        particle.draw(ctx)
      })
      requestAnimationFrame(animate3D)
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseX = e.clientX - rect.left
      mouseY = e.clientY - rect.top
    }

    canvas.addEventListener('mousemove', handleMouseMove)
    animate3D()

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <section className="hero" suppressHydrationWarning>
      <div className="blur-orb blur-orb-1"></div>
      <div className="blur-orb blur-orb-2"></div>

      <div className="hero-container">
        <div className="hero-content">
          <h1>
            <span className="gradient-text">Eventos & Cursos</span><br />
            Empresariales con FEL
          </h1>

          <div className="emoji-text">
            <span>🎯 Inscríbete en eventos presenciales y virtuales</span>
            <span>💳 Paga de forma segura con múltiples métodos</span>
            <span>📄 Recibe tu factura FEL automáticamente</span>
            <span>🎓 Obtén certificados verificables en blockchain</span>
          </div>

          <div className="hero-buttons">
            <button className="btn-primary" onClick={onExploreEvents}>
              Explorar Eventos
            </button>
            <button className="btn-secondary" onClick={onOrganizeEvent}>
              Organizar Evento
            </button>
          </div>
        </div>

        <div className="hero-3d">
          <canvas ref={canvasRef} id="canvas-3d"></canvas>
        </div>
      </div>
    </section>
  )
}

export default HeroSection