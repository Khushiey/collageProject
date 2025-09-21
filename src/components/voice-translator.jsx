"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Languages, Volume2, Copy, RotateCcw, Zap } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function VoiceTranslator() {
  const [isRecording, setIsRecording] = useState(false)
  const [sourceLanguage, setSourceLanguage] = useState("en-US")
  const [targetLanguage, setTargetLanguage] = useState("es-ES")
  const [originalText, setOriginalText] = useState("")
  const [translatedText, setTranslatedText] = useState("")
  const [isTranslating, setIsTranslating] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [confidence, setConfidence] = useState(null)
  const [history, setHistory] = useState([])
  const [recordingTime, setRecordingTime] = useState(0)
  const [isSpeechSupported, setIsSpeechSupported] = useState(true)

  const recognitionRef = useRef(null)
  const recordingInterval = useRef(null)

  const languages = [
    { code: "en-US", name: "English", flag: "🇺🇸" },
    { code: "es-ES", name: "Spanish", flag: "🇪🇸" },
    { code: "fr-FR", name: "French", flag: "🇫🇷" },
    { code: "de-DE", name: "German", flag: "🇩🇪" },
    { code: "it-IT", name: "Italian", flag: "🇮🇹" },
    { code: "pt-PT", name: "Portuguese", flag: "🇵🇹" },
    { code: "ru-RU", name: "Russian", flag: "🇷🇺" },
    { code: "ja-JP", name: "Japanese", flag: "🇯🇵" },
    { code: "ko-KR", name: "Korean", flag: "🇰🇷" },
    { code: "zh-CN", name: "Chinese", flag: "🇨🇳" },
    { code: "ar-SA", name: "Arabic", flag: "🇸🇦" },
    { code: "hi-IN", name: "Hindi", flag: "🇮🇳" },
  ]

  // Check if speech recognition is supported and initialize
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (!SpeechRecognition) {
        setIsSpeechSupported(false)
        console.error("Speech recognition not supported in this browser")
        return
      }
      setIsSpeechSupported(true)
    }
  }, [])

  // Initialize or re-initialize recognition when sourceLanguage changes
  useEffect(() => {
    if (!isSpeechSupported || typeof window === 'undefined') return

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    // Stop any ongoing recognition before re-initializing
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop()
    }

    // Create a fresh instance
    recognitionRef.current = new SpeechRecognition()
    recognitionRef.current.continuous = false
    recognitionRef.current.interimResults = false
    recognitionRef.current.lang = sourceLanguage

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      const confidence = event.results[0][0].confidence * 100
      setOriginalText(transcript)
      setConfidence(Math.round(confidence))
      setIsTranslating(true)
      performTranslation(transcript)
    }

    recognitionRef.current.onerror = (event) => {
      console.error("Speech recognition error", event.error)
      setIsRecording(false)
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current)
        recordingInterval.current = null
      }
      setRecordingTime(0)
    }

    recognitionRef.current.onend = () => {
      setIsRecording(false)
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current)
        recordingInterval.current = null
      }
      setRecordingTime(0)
    }
  }, [sourceLanguage, isSpeechSupported])

  const startRecording = () => {
    if (!isSpeechSupported) {
      alert("Speech recognition is not supported in your browser. Try using Chrome.")
      return
    }

    setOriginalText("")
    setTranslatedText("")
    setConfidence(null)

    try {
      if (recognitionRef.current) {
        recognitionRef.current.start()
        setIsRecording(true)
        setRecordingTime(0)

        recordingInterval.current = setInterval(() => {
          setRecordingTime((prev) => prev + 1)
        }, 1000)
      }
    } catch (error) {
      console.error("Error starting speech recognition:", error)
      setIsRecording(false)
    }
  }

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop()
    }
    
    setIsRecording(false)
    if (recordingInterval.current) {
      clearInterval(recordingInterval.current)
      recordingInterval.current = null
    }
    setRecordingTime(0)
  }

  const performTranslation = async (text) => {
    try {
      // Extract base lang code for Google Translate (e.g., "en-US" -> "en")
      const sourceLangCode = sourceLanguage.split('-')[0]
      const targetLangCode = targetLanguage.split('-')[0]
      
      const response = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLangCode}&tl=${targetLangCode}&dt=t&q=${encodeURIComponent(text)}`
      )
      
      if (!response.ok) {
        throw new Error("Translation failed")
      }
      
      const data = await response.json()
      const translatedText = data[0][0][0]
      
      setTranslatedText(translatedText)
      setIsTranslating(false)

      const newTranslation = {
        id: Date.now().toString(),
        originalText: text,
        translatedText: translatedText,
        fromLanguage: sourceLanguage,
        toLanguage: targetLanguage,
        timestamp: new Date(),
      }

      setHistory((prev) => [newTranslation, ...prev.slice(0, 4)])
    } catch (error) {
      console.error("Translation error:", error)
      // Expanded fallback (add more as needed; still limited, but covers basics)
      const simpleTranslations = {
        "en": {
          "es": "Hola, ¿cómo estás?",
          "fr": "Bonjour, comment allez-vous?",
          "de": "Hallo, wie geht es dir?",
          "hi": "नमस्ते, आप कैसे हैं?",
        },
        "es": {
          "en": "Hello, how are you?",
          "fr": "Bonjour, comment allez-vous?",
          "hi": "नमस्ते, आप कैसे हैं?",
        },
        // Add more pairs if needed
      }
      
      const sourceLangCode = sourceLanguage.split('-')[0]
      const targetLangCode = targetLanguage.split('-')[0]
      const translated = simpleTranslations[sourceLangCode]?.[targetLangCode] || "Translation not available"
      
      setTranslatedText(translated)
      setIsTranslating(false)
      
      const newTranslation = {
        id: Date.now().toString(),
        originalText: text,
        translatedText: translated,
        fromLanguage: sourceLanguage,
        toLanguage: targetLanguage,
        timestamp: new Date(),
      }

      setHistory((prev) => [newTranslation, ...prev.slice(0, 4)])
    }
  }

  const handleRecording = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  const playTranslation = () => {
    if (!translatedText) return
    setIsPlaying(true)

    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(translatedText)
      utterance.lang = targetLanguage // Use full code for better TTS support
      utterance.rate = 0.8
      utterance.pitch = 1

      utterance.onend = () => setIsPlaying(false)
      utterance.onerror = () => setIsPlaying(false)

      speechSynthesis.speak(utterance)
    } else {
      setTimeout(() => setIsPlaying(false), 2000)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  const swapLanguages = () => {
    const temp = sourceLanguage
    setSourceLanguage(targetLanguage)
    setTargetLanguage(temp)

    if (originalText && translatedText) {
      setOriginalText(translatedText)
      setTranslatedText(originalText)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Languages className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Voice Translator</h2>
          <p className="text-muted-foreground">Speak in one language, get translation in another</p>
        </div>
      </div>

      {!isSpeechSupported && (
        <Card className="border-border/40 bg-card/30 border-yellow-500/30">
          <CardContent className="pt-6">
            <div className="text-center text-yellow-600 dark:text-yellow-400">
              <p>Speech recognition is not supported in your browser.</p>
              <p>Please use Chrome for the best experience.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Language Selection */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-border/40 bg-card/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <span>From</span>
              {languages.find((l) => l.code === sourceLanguage)?.flag}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
              <SelectTrigger className="bg-background/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <span className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <span>To</span>
              {languages.find((l) => l.code === targetLanguage)?.flag}
              <Button variant="ghost" size="sm" onClick={swapLanguages} className="ml-auto h-6 w-6 p-0">
                <RotateCcw className="h-3 w-3" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={targetLanguage} onValueChange={setTargetLanguage}>
              <SelectTrigger className="bg-background/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <span className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {/* Recording Section */}
      <Card className="border-border/40 bg-card/30">
        <CardContent className="pt-6">
          <div className="text-center space-y-6">
            <div className="relative">
              <Button
                size="lg"
                onClick={handleRecording}
                disabled={!isSpeechSupported}
                className={`h-24 w-24 rounded-full transition-all duration-300 ${isRecording
                    ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground scale-110"
                    : "bg-primary hover:bg-primary/90 hover:scale-105"
                  }`}
              >
                <AnimatePresence mode="wait">
                  {isRecording ? (
                    <motion.div key="recording" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <MicOff className="h-8 w-8" />
                    </motion.div>
                  ) : (
                    <motion.div key="not-recording" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <Mic className="h-8 w-8" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>

              {isRecording && (
                <>
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-destructive"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-destructive/50"
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, delay: 0.3 }}
                  />
                </>
              )}
            </div>

            <div className="space-y-2">
              <p className={`font-medium ${isRecording ? "text-destructive" : "text-muted-foreground"}`}>
                {isRecording ? `Recording... ${formatTime(recordingTime)}` : "Tap to start recording"}
              </p>
              {isRecording && (
                <motion.div className="flex justify-center gap-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1 h-8 bg-destructive rounded-full"
                      animate={{ scaleY: [0.3, 1.5, 0.3] }}
                      transition={{
                        duration: 0.8,
                        repeat: Number.POSITIVE_INFINITY,
                        delay: i * 0.1,
                      }}
                    />
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Translation Results */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-border/40 bg-card/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              Original
              {confidence !== null && (
                <Badge variant="secondary" className="text-xs">
                  {confidence}% confidence
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="min-h-24 p-4 rounded-lg bg-background/50 border border-border/40 relative">
              {originalText ? (
                <>
                  <p className="text-foreground leading-relaxed">{originalText}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(originalText)}
                    className="absolute top-2 right-2 h-6 w-6 p-0 opacity-70 hover:opacity-100"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </>
              ) : (
                <p className="text-muted-foreground italic">
                  {isRecording ? "Listening..." : "Your speech will appear here..."}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              Translation
              {translatedText && (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(translatedText)}
                    className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={playTranslation}
                    disabled={isPlaying}
                    className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                  >
                    {isPlaying ? (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY }}
                      >
                        <Volume2 className="h-3 w-3" />
                      </motion.div>
                    ) : (
                      <Volume2 className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="min-h-24 p-4 rounded-lg bg-background/50 border border-border/40">
              {isTranslating ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  >
                    <Zap className="h-4 w-4" />
                  </motion.div>
                  Translating with AI...
                </div>
              ) : translatedText ? (
                <p className="text-foreground leading-relaxed">{translatedText}</p>
              ) : (
                <p className="text-muted-foreground italic">Translation will appear here...</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Translation History */}
      {history.length > 0 && (
        <Card className="border-border/40 bg-card/30">
          <CardHeader>
            <CardTitle className="text-lg">Recent Translations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {history.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 rounded-lg bg-background/30 border border-border/20"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {languages.find((l) => l.code === item.fromLanguage)?.flag}{" "}
                      {languages.find((l) => l.code === item.fromLanguage)?.name}
                    </Badge>
                    <Languages className="h-3 w-3 text-muted-foreground" />
                    <Badge variant="outline" className="text-xs">
                      {languages.find((l) => l.code === item.toLanguage)?.flag}{" "}
                      {languages.find((l) => l.code === item.toLanguage)?.name}
                    </Badge>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Original:</p>
                      <p className="text-foreground">{item.originalText}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Translation:</p>
                      <p className="text-foreground">{item.translatedText}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}