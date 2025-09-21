"use client";

import { AIVoiceInput } from "@/components/ui/ai-voice-input";
import { useState, useEffect, useRef } from "react";

const VoiceChatbot = () => {
  const [recordings, setRecordings] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL; 

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.lang = "en-US";
        rec.continuous = true;
        rec.interimResults = false;

        rec.onresult = async (event) => {
          const transcript = event.results[0][0].transcript;
          console.log("Transcript:", transcript);

          // Save user query
          setRecordings((prev) => [
            ...prev.slice(-4),
            { sender: "user", timestamp: new Date(), transcript },
          ]);

          try {
            const res = await fetch(`${baseUrl}/api/ask-groq`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ question: transcript }),
            });

            const data = await res.json();
            const answer = data.answer;

            // Save AI response
            setRecordings((prev) => [
              ...prev,
              { sender: "ai", timestamp: new Date(), transcript: answer },
            ]);

            speakText(answer);
          } catch (err) {
            console.error("Groq API error:", err);
          }
        };

        rec.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = rec;
      }
    }
  }, []);

  const handleStart = () => {
    if (isRecording) return;
    console.log("Recording started");
    setIsRecording(true);
    recognitionRef.current?.start();
  };

  const handleStop = () => {
    console.log("Recording stopped");
    recognitionRef.current?.stop();
    setIsRecording(false);
  };

  const handleReset = () => {
    setRecordings([]);
    speechSynthesis.cancel();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">AI Voice Assistant</h1>
          <p className="text-sm text-gray-500 mt-1">
            Speak to interact with the AI and view your conversation history below.
          </p>
        </div>

        <div className="flex items-center justify-center gap-4">
          <AIVoiceInput onStart={handleStart} onStop={handleStop} />
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors"
          >
            Reset
          </button>
        </div>

        <div className="text-center">
          <span
            className={`inline-flex items-center gap-2 text-sm font-medium ${
              isRecording ? "text-green-600" : "text-gray-500"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isRecording ? "bg-green-500 animate-pulse" : "bg-gray-400"
              }`}
            ></span>
            {isRecording ? "Recording..." : "Not Recording"}
          </span>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Conversation History</h2>
          {recordings.length === 0 ? (
            <p className="text-sm text-gray-500 text-center">
              No transcripts yet. Start recording to see your conversation.
            </p>
          ) : (
            <ul className="space-y-2 max-h-96 overflow-y-auto">
              {recordings.map((rec, i) => (
                <li
                  key={i}
                  className={`p-3 border rounded-md ${
                    rec.sender === "user" ? "bg-blue-50" : "bg-green-50"
                  } flex items-start gap-2 text-sm text-gray-700`}
                >
                  <span className="font-mono text-gray-500 flex-shrink-0">
                    {rec.timestamp.toLocaleTimeString()}:
                  </span>
                  <span>
                    <strong>{rec.sender === "user" ? "You:" : "AI:"}</strong> {rec.transcript}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

const speakText = (text) => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";

  const voices = speechSynthesis.getVoices();
  let femaleVoice =
    voices.find((v) => v.name.includes("Google US English")) ||
    voices.find((v) => v.gender === "female") ||
    voices.find((v) => v.name.toLowerCase().includes("female"));

  if (femaleVoice) {
    utterance.voice = femaleVoice;
  }

  utterance.pitch = 1.2;

  speechSynthesis.speak(utterance);
};

if (typeof window !== "undefined") {
  speechSynthesis.onvoiceschanged = () => {
    console.log("Available voices:", speechSynthesis.getVoices());
  };
}

export default VoiceChatbot;
