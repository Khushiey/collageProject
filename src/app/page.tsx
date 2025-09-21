"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MapPin, Languages, MessageCircle, Settings, Menu, X, Sparkles, Zap } from "lucide-react"
import { MapDirections } from "@/components/map-directions"
import { VoiceTranslator } from "@/components/voice-translator"
import VoiceChatbot from "@/components/voice-chatbot"

type ActiveFeature = "map" | "translator" | "chatbot"

export default function Dashboard() {
  const [activeFeature, setActiveFeature] = useState<ActiveFeature>("map")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  const features = [
    {
      id: "map" as const,
      name: "Map Directions",
      icon: MapPin,
      description: "Get directions from your current location",
      color: "from-blue-500/20 to-cyan-500/20",
      iconColor: "text-blue-500",
    },
    {
      id: "translator" as const,
      name: "Voice Translator",
      icon: Languages,
      description: "Translate speech between languages",
      color: "from-purple-500/20 to-pink-500/20",
      iconColor: "text-purple-500",
    },
    {
      id: "chatbot" as const,
      name: "AI Assistant",
      icon: MessageCircle,
      description: "Conversational AI with voice support",
      color: "from-green-500/20 to-emerald-500/20",
      iconColor: "text-green-500",
    },
  ]

  useEffect(() => {
    setIsLoaded(true)
    const timer = setInterval(() => setCurrentTime(new Date()), 60000) // Update every minute
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(false)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const renderActiveFeature = () => {
    switch (activeFeature) {
      case "map":
        return <MapDirections />
      case "translator":
        return <VoiceTranslator />
      case "chatbot":
        return <VoiceChatbot />
      default:
        return <MapDirections />
    }
  }

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  }

  const sidebarVariants = {
    open: { x: 0, opacity: 1 },
    closed: { x: -300, opacity: 0 },
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="mx-auto mb-4"
          >
            <Sparkles className="h-12 w-12 text-primary" />
          </motion.div>
          <h2 className="text-xl font-bold mb-2">AI Assistant Pro</h2>
          <p className="text-muted-foreground">Loading your intelligent workspace...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={pageVariants}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20"
    >
      {/* Top Navigation */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      >
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden hover:bg-accent/50 transition-colors"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <motion.div animate={{ rotate: sidebarOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </motion.div>
            </Button>

            <motion.div
              className="flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                >
                  <Zap className="h-4 w-4 text-primary-foreground" />
                </motion.div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Assistant Pro
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </motion.div>
          </div>

          <div className="flex items-center gap-3">
            <Badge
              variant="secondary"
              className="hidden sm:flex items-center gap-1 bg-green-500/10 text-green-600 border-green-500/20"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                className="w-2 h-2 bg-green-500 rounded-full"
              />
              Online
            </Badge>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" size="icon" className="hover:bg-accent/50">
                <Settings className="h-5 w-5" />
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Avatar className="h-8 w-8 ring-2 ring-primary/20 transition-all hover:ring-primary/40">
                <AvatarImage src="/diverse-user-avatars.png" />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  >
                    U
                  </motion.div>
                </AvatarFallback>
              </Avatar>
            </motion.div>
          </div>
        </div>
      </motion.header>

      <div className="flex">
        {/* Sidebar */}
        <AnimatePresence>
          {(sidebarOpen || (typeof window !== "undefined" && window.innerWidth >= 768)) && (
            <motion.aside
              initial="closed"
              animate="open"
              exit="closed"
              variants={sidebarVariants}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed md:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)] w-72 border-r border-border/40 bg-card/50 backdrop-blur-sm"
            >
              <div className="p-6">
                <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6 flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  AI Features
                </motion.h2>

                <nav className="space-y-3">
                  {features.map((feature, index) => {
                    const Icon = feature.icon
                    const isActive = activeFeature === feature.id

                    return (
                      <motion.div
                        key={feature.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                      >
                        <Button
                          variant={isActive ? "default" : "ghost"}
                          className={`w-full justify-start h-auto p-4 transition-all duration-300 ${isActive
                              ? "bg-primary text-primary-foreground shadow-lg scale-105"
                              : "hover:bg-accent/50 hover:scale-102"
                            }`}
                          onClick={() => {
                            setActiveFeature(feature.id)
                            setSidebarOpen(false)
                          }}
                        >
                          <div
                            className={`p-2 rounded-lg mr-3 ${isActive ? "bg-primary-foreground/20" : `bg-gradient-to-br ${feature.color}`}`}
                          >
                            <Icon className={`h-5 w-5 ${isActive ? "text-primary-foreground" : feature.iconColor}`} />
                          </div>
                          <div className="text-left flex-1">
                            <div className="font-medium">{feature.name}</div>
                            <div
                              className={`text-xs ${isActive ? "text-primary-foreground/80" : "text-muted-foreground"}`}
                            >
                              {feature.description}
                            </div>
                          </div>
                          {isActive && (
                            <motion.div
                              layoutId="activeIndicator"
                              className="w-2 h-2 bg-primary-foreground rounded-full"
                              transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            />
                          )}
                        </Button>
                      </motion.div>
                    )
                  })}
                </nav>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mt-8 p-4 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20"
                >
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    Quick Stats
                  </h3>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Sessions Today</span>
                      <span className="font-medium">12</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Translations</span>
                      <span className="font-medium">47</span>
                    </div>
                    <div className="flex justify-between">
                      <span>AI Responses</span>
                      <span className="font-medium">89</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFeature}
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.98 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-shadow duration-500">
                  <motion.div
                    className="p-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {renderActiveFeature()}
                  </motion.div>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 400, damping: 17 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          className="relative"
        >
          <Button
            size="lg"
            className="h-14 w-14 rounded-full bg-gradient-to-r from-primary to-primary/80 shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={() => {
              // Quick action - could open help or settings
              console.log("Quick action triggered")
            }}
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            >
              <Sparkles className="h-6 w-6" />
            </motion.div>
          </Button>

          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"
          />
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
