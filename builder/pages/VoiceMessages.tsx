import PatientLayout from "@/components/PatientLayout";
import { Link } from "react-router-dom";
import { Mic, Play, Calendar, ChevronRight, MessageSquare } from "lucide-react";
import { useState } from "react";

interface VoiceMessage {
  id: string;
  date: string;
  time: string;
  duration: string;
  preview: string;
  hasAISummary: boolean;
  status: "sent" | "processing" | "reviewed";
}

export default function VoiceMessages() {
  const [messages] = useState<VoiceMessage[]>([
    {
      id: "1",
      date: "January 15, 2024",
      time: "2:30 PM",
      duration: "1:45",
      preview: "I've been having more energy lately, especially in the mornings...",
      hasAISummary: true,
      status: "reviewed",
    },
    {
      id: "2",
      date: "January 10, 2024",
      time: "10:15 AM",
      duration: "2:12",
      preview: "My knee pain has improved with the new physical therapy routine...",
      hasAISummary: true,
      status: "reviewed",
    },
    {
      id: "3",
      date: "January 5, 2024",
      time: "4:45 PM",
      duration: "1:20",
      preview: "Just wanted to check in about my medication adjustment...",
      hasAISummary: false,
      status: "processing",
    },
  ]);

  return (
    <PatientLayout activePage="/voice-messages">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-teal-100 rounded-lg">
              <Mic className="w-6 h-6 text-teal-600" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900">Voice Messages</h1>
          </div>
          <p className="text-slate-600">
            Your recorded messages to your care team
          </p>
        </div>

        {messages.length === 0 ? (
          // Empty State
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
                <MessageSquare className="w-10 h-10 text-slate-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              No messages yet
            </h2>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              You haven't recorded any messages yet. Use the red button on your
              home screen to record a concern for your care team.
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition-colors"
            >
              Go to Dashboard
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          // Messages List
          <div className="space-y-4">
            {messages.map((message) => (
              <Link
                key={message.id}
                to={`/voice-messages/${message.id}`}
                className="block bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md hover:border-teal-300 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex-shrink-0 w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                        <Mic className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          Voice Message
                        </p>
                        <p className="text-xs text-slate-500">
                          {message.date} • {message.time}
                        </p>
                      </div>
                    </div>

                    {/* Transcript Preview */}
                    <p className="text-slate-700 text-sm mb-3 line-clamp-2">
                      "{message.preview}"
                    </p>

                    {/* Metadata */}
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Play className="w-3 h-3" />
                        {message.duration}
                      </span>
                      {message.hasAISummary && (
                        <span className="flex items-center gap-1 px-2 py-1 bg-teal-50 text-teal-700 rounded">
                          ✨ AI summary available
                        </span>
                      )}
                      {message.status === "processing" && (
                        <span className="flex items-center gap-1 px-2 py-1 bg-yellow-50 text-yellow-700 rounded animate-pulse">
                          ⏳ Processing...
                        </span>
                      )}
                      {message.status === "reviewed" && (
                        <span className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded">
                          ✓ Reviewed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Arrow */}
                  <div className="flex-shrink-0 text-slate-400 mt-2">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PatientLayout>
  );
}
