import { Link } from "react-router-dom";
import { Mic, MicOff, Video, VideoOff, MessageSquare, PhoneOff, Signal, Clock, User } from "lucide-react";
import { useState } from "react";

export default function VirtualVisit() {
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState("excellent");

  const connectionColors = {
    excellent: "bg-emerald-500",
    good: "bg-teal-500",
    fair: "bg-yellow-500",
    poor: "bg-red-500",
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-white">Virtual Visit</h1>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Signal className={`w-4 h-4 ${connectionColors[connectionQuality as keyof typeof connectionColors]}`} />
            <span className="capitalize">{connectionQuality} Connection</span>
          </div>
        </div>
        <Link
          to="/appointments"
          className="text-slate-400 hover:text-white transition-colors"
        >
          ✕
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Area */}
        <div className="flex-1 flex flex-col">
          {/* Provider Video */}
          <div className="flex-1 bg-slate-900 relative overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
              <div className="text-center">
                <div className="w-32 h-32 bg-teal-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <User className="w-16 h-16 text-teal-600" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Dr. James Wilson</h2>
                <p className="text-slate-400">Connected • 5 minutes 32 seconds</p>
              </div>
            </div>

            {/* Patient Preview */}
            <div className="absolute bottom-6 right-6 w-48 h-40 bg-slate-800 rounded-2xl border-2 border-teal-500 overflow-hidden shadow-lg">
              <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <User className="w-8 h-8 text-emerald-600" />
                  </div>
                  <p className="text-sm text-white font-medium">You</p>
                  {isCameraOff && (
                    <div className="mt-2">
                      <VideoOff className="w-5 h-5 text-slate-400 mx-auto" />
                      <p className="text-xs text-slate-400 mt-1">Camera Off</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Timer */}
            <div className="absolute top-6 left-6 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="font-mono">05:32</span>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-slate-800 border-t border-slate-700 px-6 py-6 flex justify-center gap-6">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-4 rounded-full transition-colors ${
                isMuted
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-teal-600 hover:bg-teal-700"
              } text-white`}
            >
              {isMuted ? (
                <MicOff className="w-6 h-6" />
              ) : (
                <Mic className="w-6 h-6" />
              )}
            </button>

            <button
              onClick={() => setIsCameraOff(!isCameraOff)}
              className={`p-4 rounded-full transition-colors ${
                isCameraOff
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-teal-600 hover:bg-teal-700"
              } text-white`}
            >
              {isCameraOff ? (
                <VideoOff className="w-6 h-6" />
              ) : (
                <Video className="w-6 h-6" />
              )}
            </button>

            <button
              onClick={() => setShowChat(!showChat)}
              className="p-4 rounded-full bg-slate-700 hover:bg-slate-600 text-white transition-colors"
            >
              <MessageSquare className="w-6 h-6" />
            </button>

            <button className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors">
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <div className="w-96 bg-slate-800 border-l border-slate-700 flex flex-col">
            {/* Chat Header */}
            <div className="border-b border-slate-700 px-6 py-4">
              <h3 className="font-bold text-white">Chat with Dr. Wilson</h3>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-teal-100 flex-shrink-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-teal-600">JW</span>
                </div>
                <div className="bg-slate-700 text-white px-4 py-2 rounded-2xl rounded-tl-none">
                  <p className="text-sm">Hi there! How are you feeling today?</p>
                  <p className="text-xs text-slate-400 mt-1">5:28 PM</p>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <div className="bg-teal-600 text-white px-4 py-2 rounded-2xl rounded-tr-none max-w-xs">
                  <p className="text-sm">Great! Ready to discuss the lab results.</p>
                  <p className="text-xs text-teal-100 mt-1">5:29 PM</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-teal-100 flex-shrink-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-teal-600">JW</span>
                </div>
                <div className="bg-slate-700 text-white px-4 py-2 rounded-2xl rounded-tl-none">
                  <p className="text-sm">Perfect. Let me pull up your recent labs.</p>
                  <p className="text-xs text-slate-400 mt-1">5:30 PM</p>
                </div>
              </div>
            </div>

            {/* Input */}
            <div className="border-t border-slate-700 p-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 rounded-lg bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button className="p-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors">
                  <MessageSquare className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Provider Info Card */}
      <div className="hidden md:block absolute bottom-24 left-6 bg-slate-800 border border-slate-700 rounded-2xl p-6 w-80 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-8 h-8 text-teal-600" />
          </div>
          <div>
            <h3 className="font-bold text-white">Dr. James Wilson</h3>
            <p className="text-sm text-slate-300">Primary Care Physician</p>
            <p className="text-xs text-slate-400 mt-2">License: MD-12345</p>
            <button className="mt-3 text-teal-400 hover:text-teal-300 text-sm font-medium">
              View Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
