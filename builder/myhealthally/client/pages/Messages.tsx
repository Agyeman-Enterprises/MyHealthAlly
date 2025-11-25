import { Link } from "react-router-dom";
import { ChevronRight, Send, Paperclip, Mic, Search } from "lucide-react";
import { useState } from "react";

export default function Messages() {
  const [selectedThread, setSelectedThread] = useState(0);
  const [message, setMessage] = useState("");

  const threads = [
    {
      id: 1,
      name: "Dr. James Wilson",
      role: "Primary Care Physician",
      avatar: "JW",
      lastMessage: "Your recent labs look great. Let's discuss at your appointment.",
      timestamp: "2 hours ago",
      unread: true,
      messages: [
        { sender: "Dr. James Wilson", text: "Your recent labs look great. Let's discuss at your appointment.", timestamp: "2 hours ago", type: "received" },
        { sender: "You", text: "Thank you! What should I focus on?", timestamp: "1 hour ago", type: "sent" },
        { sender: "Dr. James Wilson", text: "Continue with your current supplements and increase walking to 5 days/week.", timestamp: "58 minutes ago", type: "received" },
      ],
    },
    {
      id: 2,
      name: "Care Coordinator - Sarah",
      role: "Care Coordination Team",
      avatar: "SC",
      lastMessage: "Your appointment is confirmed for tomorrow at 2:00 PM",
      timestamp: "Yesterday",
      unread: false,
      messages: [
        { sender: "Sarah", text: "Your appointment is confirmed for tomorrow at 2:00 PM", timestamp: "Yesterday", type: "received" },
        { sender: "You", text: "Perfect, see you then!", timestamp: "Yesterday", type: "sent" },
      ],
    },
    {
      id: 3,
      name: "Wellness Coach - Michael",
      role: "Health Coach",
      avatar: "MC",
      lastMessage: "Great job on your exercise routine this week!",
      timestamp: "3 days ago",
      unread: false,
      messages: [
        { sender: "Michael", text: "Great job on your exercise routine this week!", timestamp: "3 days ago", type: "received" },
      ],
    },
  ];

  const currentThread = threads[selectedThread];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 flex flex-col">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-3">
            <img 
              src="https://cdn.builder.io/api/v1/image/assets%2Ff0e178cb947e448182889b581f07529d%2F9e0f1a3b796e459286bbf9636ed59102?format=webp&width=100" 
              alt="MyHealthAlly Logo" 
              className="h-8"
            />
          </Link>
          <Link to="/dashboard" className="text-teal-600 hover:text-teal-700 font-medium">
            Back to Dashboard
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        {/* Thread List */}
        <div className="w-full md:w-80 border-r border-slate-200 bg-white flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-slate-200">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search messages..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
              />
            </div>
          </div>

          {/* Thread List */}
          <div className="flex-1 overflow-y-auto">
            {threads.map((thread, idx) => (
              <button
                key={thread.id}
                onClick={() => setSelectedThread(idx)}
                className={`w-full text-left px-4 py-4 border-b border-slate-100 transition-colors ${
                  selectedThread === idx
                    ? "bg-teal-50 border-l-4 border-l-teal-600"
                    : "hover:bg-slate-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold text-sm flex-shrink-0">
                    {thread.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-slate-900 ${thread.unread ? "font-bold" : ""}`}>
                      {thread.name}
                    </p>
                    <p className="text-xs text-slate-600">{thread.role}</p>
                    <p className="text-sm text-slate-600 truncate mt-1">{thread.lastMessage}</p>
                    <p className="text-xs text-slate-500 mt-1">{thread.timestamp}</p>
                  </div>
                  {thread.unread && (
                    <div className="w-2 h-2 rounded-full bg-teal-500 flex-shrink-0"></div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className="hidden md:flex flex-1 flex-col bg-white">
          {/* Chat Header */}
          <div className="border-b border-slate-200 p-6 bg-gradient-to-r from-teal-50 to-emerald-50">
            <h2 className="text-xl font-bold text-slate-900">{currentThread.name}</h2>
            <p className="text-sm text-slate-600">{currentThread.role}</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {currentThread.messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.type === "sent" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-md px-4 py-3 rounded-2xl ${
                    msg.type === "sent"
                      ? "bg-teal-500 text-white rounded-br-none"
                      : "bg-slate-100 text-slate-900 rounded-bl-none"
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p className={`text-xs mt-2 ${msg.type === "sent" ? "text-teal-100" : "text-slate-600"}`}>
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="border-t border-slate-200 p-6">
            <div className="flex gap-3">
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600">
                <Paperclip className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600">
                <Mic className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
              />
              <button className="p-2 bg-teal-500 hover:bg-teal-600 rounded-lg transition-colors text-white">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile View */}
        <div className="md:hidden flex-1 flex flex-col bg-white">
          {selectedThread !== null && (
            <>
              <div className="border-b border-slate-200 p-6 bg-gradient-to-r from-teal-50 to-emerald-50">
                <h2 className="text-xl font-bold text-slate-900">{currentThread.name}</h2>
                <p className="text-sm text-slate-600">{currentThread.role}</p>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {currentThread.messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.type === "sent" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-3 rounded-2xl ${
                        msg.type === "sent"
                          ? "bg-teal-500 text-white rounded-br-none"
                          : "bg-slate-100 text-slate-900 rounded-bl-none"
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-200 p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type message..."
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-300 focus:border-teal-500 outline-none"
                  />
                  <button className="p-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600">
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
