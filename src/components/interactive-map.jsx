"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { MapPin, Navigation, Locate } from "lucide-react"

export default function InteractiveMap({ center, destination, routeInfo }) {
  const canvasRef = useRef(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio
    canvas.height = canvas.offsetHeight * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    // Clear canvas
    ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)

    // Draw map background with grid
    const drawMapBackground = () => {
      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.offsetWidth, canvas.offsetHeight)
      gradient.addColorStop(0, "#f8fafc")
      gradient.addColorStop(1, "#e2e8f0")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)

      // Grid lines
      ctx.strokeStyle = "#cbd5e1"
      ctx.lineWidth = 0.5
      const gridSize = 40

      for (let x = 0; x <= canvas.offsetWidth; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.offsetHeight)
        ctx.stroke()
      }

      for (let y = 0; y <= canvas.offsetHeight; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.offsetWidth, y)
        ctx.stroke()
      }

      // Add some "street" lines
      ctx.strokeStyle = "#94a3b8"
      ctx.lineWidth = 2

      // Horizontal streets
      ctx.beginPath()
      ctx.moveTo(0, canvas.offsetHeight * 0.3)
      ctx.lineTo(canvas.offsetWidth, canvas.offsetHeight * 0.3)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(0, canvas.offsetHeight * 0.7)
      ctx.lineTo(canvas.offsetWidth, canvas.offsetHeight * 0.7)
      ctx.stroke()

      // Vertical streets
      ctx.beginPath()
      ctx.moveTo(canvas.offsetWidth * 0.4, 0)
      ctx.lineTo(canvas.offsetWidth * 0.4, canvas.offsetHeight)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(canvas.offsetWidth * 0.8, 0)
      ctx.lineTo(canvas.offsetWidth * 0.8, canvas.offsetHeight)
      ctx.stroke()
    }

    // Draw location marker
    const drawMarker = (x, y, color, label) => {
      // Marker pin
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(x, y - 15, 8, 0, Math.PI * 2)
      ctx.fill()

      // Marker stem
      ctx.beginPath()
      ctx.moveTo(x, y - 7)
      ctx.lineTo(x, y)
      ctx.strokeStyle = color
      ctx.lineWidth = 3
      ctx.stroke()

      // Label background
      const textWidth = ctx.measureText(label).width
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)"
      ctx.fillRect(x - textWidth / 2 - 4, y + 5, textWidth + 8, 20)
      ctx.strokeStyle = color
      ctx.lineWidth = 1
      ctx.strokeRect(x - textWidth / 2 - 4, y + 5, textWidth + 8, 20)

      // Label text
      ctx.fillStyle = "#1f2937"
      ctx.font = "12px system-ui"
      ctx.textAlign = "center"
      ctx.fillText(label, x, y + 18)
    }

    // Draw route line
    const drawRoute = (startX, startY, endX, endY) => {
      ctx.strokeStyle = "#3b82f6"
      ctx.lineWidth = 4
      ctx.setLineDash([10, 5])

      // Draw curved path
      ctx.beginPath()
      ctx.moveTo(startX, startY)

      const midX = (startX + endX) / 2
      const midY = (startY + endY) / 2 - 30

      ctx.quadraticCurveTo(midX, midY, endX, endY)
      ctx.stroke()
      ctx.setLineDash([])

      // Add direction arrow
      const angle = Math.atan2(endY - midY, endX - midX)
      const arrowSize = 8

      ctx.fillStyle = "#3b82f6"
      ctx.beginPath()
      ctx.moveTo(endX, endY)
      ctx.lineTo(endX - arrowSize * Math.cos(angle - Math.PI / 6), endY - arrowSize * Math.sin(angle - Math.PI / 6))
      ctx.lineTo(endX - arrowSize * Math.cos(angle + Math.PI / 6), endY - arrowSize * Math.sin(angle + Math.PI / 6))
      ctx.closePath()
      ctx.fill()
    }

    // Draw the map
    drawMapBackground()

    // Current location (center-left)
    const currentX = canvas.offsetWidth * 0.3
    const currentY = canvas.offsetHeight * 0.6
    drawMarker(currentX, currentY, "#3b82f6", "You are here")

    // Destination (if available)
    if (destination && routeInfo) {
      const destX = canvas.offsetWidth * 0.75
      const destY = canvas.offsetHeight * 0.4
      drawMarker(destX, destY, "#ef4444", destination.slice(0, 15) + (destination.length > 15 ? "..." : ""))
      drawRoute(currentX, currentY, destX, destY)
    }

    setIsLoaded(true)
  }, [center, destination, routeInfo])

  return (
    <div className="h-96 w-full rounded-lg overflow-hidden bg-gradient-to-br from-muted/30 to-muted/10 relative">
      <canvas ref={canvasRef} className="w-full h-full" style={{ width: "100%", height: "100%" }} />

      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              className="mx-auto mb-4"
            >
              <MapPin className="h-16 w-16 text-primary/50" />
            </motion.div>
            <p className="text-muted-foreground">Loading interactive map...</p>
          </div>
        </div>
      )}

      {/* Map controls overlay */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-border/20 hover:bg-white transition-colors"
          title="Zoom In"
        >
          <span className="text-lg font-bold text-muted-foreground">+</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-border/20 hover:bg-white transition-colors"
          title="Zoom Out"
        >
          <span className="text-lg font-bold text-muted-foreground">−</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-border/20 hover:bg-white transition-colors"
          title="Center on Location"
        >
          <Locate className="h-4 w-4 text-muted-foreground" />
        </motion.button>
      </div>

      {/* Route info overlay */}
      {routeInfo && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-border/20 p-3"
        >
          <div className="flex items-center gap-2 text-sm">
            <Navigation className="h-4 w-4 text-primary" />
            <span className="font-medium">{routeInfo.distance}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">{routeInfo.duration}</span>
          </div>
        </motion.div>
      )}
    </div>
  )
}
