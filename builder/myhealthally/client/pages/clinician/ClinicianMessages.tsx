import ClinicianLayout from "@/components/ClinicianLayout";
import { Search, Send, Paperclip } from "lucide-react";
import { useState } from "react";

export default function ClinicianMessages() {
  const [selectedThread, setSelectedThread] = useState(0);
  const [message, setMessage] = useState("");

  const threads = [
    {
      id: 1,
      patientName: "Sarah Chen",
      lastMessage: "Thank you for the care plan updates, doctor.",
      timestamp: "2 hours ago",
      unread: true,
      avatar: "SC",
      messages: [
        {
          sender: "Sarah Chen",
          text: "Thank you for the care plan updates, doctor.",
          timestamp: "2 hours ago",
          type: "received",
        },
        {
          sender: "You",
          text: "You're welcome! Follow up next week.",
          timestamp: "1 hour ago",
          type: "sent",
        },
      ],
    },
    {
      id: 2,
      patientName: "Michael Johnson",
      lastMessage: "When should I schedule my next appointment?",
      timestamp: "4 hours ago",
      unread: true,
      avatar: "MJ",
      messages: [
        {
          sender: "Michael Johnson",
          text: "When should I schedule my next appointment?",
          timestamp: "4 hours ago",
          type: "received",
        },
      ],
    },
    {
      id: 3,
      patientName: "Emily Rodriguez",
      lastMessage: "My vitals have improved significantly!",
      timestamp: "Yesterday",
      unread: false,
      avatar: "ER",
      messages: [
        {
          sender: "Emily Rodriguez",
          text: "My vitals have improved significantly!",
          timestamp: "Yesterday",
          type: "received",
        },
        {
          sender: "You",
          text: "Excellent news! Keep up the good work.",
          timestamp: "Yesterday",
          type: "sent",
        },
      ],
    },
  ];

  return (
    <ClinicianLayout activePage="/clinician/messages">
      <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 to-teal-50">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col h-full">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Messages</h1>
            <p className="text-slate-600">
              Communicate with your patients
            </p>
          </div>

          {/* Messages Container */}
          <div className="flex-1 flex gap-6 min-h-0 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            {/* Thread List */}
            <div className="w-full md:w-80 border-r border-slate-200 flex flex-col">
              {/* Search */}
              <div className="p-4 border-b border-slate-200">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search patients..."
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Threads */}
              <div className="flex-1 overflow-y-auto">
                {threads.map((thread, idx) => (
                  <button
                    key={thread.id}
                    onClick={() => setSelectedThread(idx)}
                    className={`w-full text-left px-4 py-4 border-b border-slate-200 transition-colors ${
                      selectedThread === idx
                        ? "bg-teal-50"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-teal-600">
                          {thread.avatar}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-slate-900 truncate">
                            {thread.patientName}
                          </p>
                          {thread.unread && (
                            <span className="w-2 h-2 bg-teal-500 rounded-full flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-slate-600 truncate">
                          {thread.lastMessage}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {thread.timestamp}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Message View */}
            <div className="hidden md:flex flex-1 flex-col">
              {threads.length > 0 && (
                <>
                  {/* Header */}
                  <div className="px-6 py-4 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-900">
                      {threads[selectedThread].patientName}
                    </h2>
                    <p className="text-sm text-slate-500">Patient</p>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                    {threads[selectedThread].messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${
                          msg.type === "sent"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-sm px-4 py-2 rounded-lg ${
                            msg.type === "sent"
                              ? "bg-teal-500 text-white"
                              : "bg-slate-100 text-slate-900"
                          }`}
                        >
                          <p>{msg.text}</p>
                          <p className="text-xs mt-1 opacity-70">
                            {msg.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Input */}
                  <div className="px-6 py-4 border-t border-slate-200">
                    <div className="flex gap-3">
                      <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                        <Paperclip className="w-5 h-5 text-slate-600" />
                      </button>
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      <button className="p-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors">
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </ClinicianLayout>
  );
}
