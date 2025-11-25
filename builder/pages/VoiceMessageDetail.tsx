import PatientLayout from "@/components/PatientLayout";
import { useParams } from "react-router-dom";
import {
  ArrowLeft,
  Mic,
  Play,
  Clock,
  AlertCircle,
  Globe,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

interface AudioAccessModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function AudioAccessModal({ isOpen, onConfirm, onCancel }: AudioAccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0" />
          <h2 className="text-xl font-bold text-slate-900">Sensitive audio</h2>
        </div>

        <p className="text-slate-600 mb-6">
          Your original voice recording contains personal health information and
          is protected under privacy regulations. Only authorized care team
          members can access this.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors"
          >
            Play audio
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VoiceMessageDetail() {
  const { id } = useParams();
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [audioModalOpen, setAudioModalOpen] = useState(false);

  // Mock data
  const message = {
    id,
    date: "January 15, 2024",
    time: "2:30 PM",
    duration: "1:45",
    recordedAt: "2024-01-15T14:30:00",
    transcripts: {
      english:
        "I've been having more energy lately, especially in the mornings. My sleep has also improved significantly since we adjusted the medication. I'm feeling more motivated to do my exercises, and my knee pain is much better. I wanted to mention that I've also noticed my appetite is back to normal, which is great because I was worried about that.",
      spanish:
        "He estado teniendo más energía últimamente, especialmente en las mañanas. Mi sueño también ha mejorado significativamente desde que ajustamos la medicación. Me siento más motivado para hacer mis ejercicios, y el dolor de rodilla es mucho mejor. Quería mencionar que también he notado que mi apetito ha vuelto a la normalidad, lo cual es excelente porque estaba preocupado por eso.",
      french:
        "J'ai eu plus d'énergie dernièrement, surtout le matin. Mon sommeil s'est aussi amélioré considérablement depuis que nous avons ajusté le médicament. Je me sens plus motivé à faire mes exercices, et ma douleur au genou est bien mieux. Je voulais mentionner que j'ai également remarqué que mon appétit est revenu à la normale, ce qui est excellent car j'étais inquiet à ce sujet.",
    },
    aiSummary:
      "Patient reports significant improvement in energy levels and sleep quality post-medication adjustment. Pain reduction noted in knee. Good medication compliance and exercise adherence. Appetite normalized. Overall positive trajectory.",
    reviewedBy: "Dr. James Wilson",
    reviewedDate: "January 16, 2024",
  };

  const languages = [
    { code: "english", label: "English" },
    { code: "spanish", label: "Español" },
    { code: "french", label: "Français" },
  ];

  return (
    <PatientLayout activePage="/voice-messages">
      <AudioAccessModal
        isOpen={audioModalOpen}
        onConfirm={() => {
          console.log("Playing audio...");
          setAudioModalOpen(false);
        }}
        onCancel={() => setAudioModalOpen(false)}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          to="/voice-messages"
          className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to messages
        </Link>

        {/* Header */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Mic className="w-5 h-5 text-teal-600" />
                <span className="text-sm font-medium text-teal-600 bg-teal-50 px-2 py-1 rounded">
                  Voice Message
                </span>
              </div>
              <h1 className="text-3xl font-bold text-slate-900">
                Your message • {message.date}
              </h1>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">{message.time}</p>
              <p className="text-sm font-medium text-slate-900">
                Duration: {message.duration}
              </p>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg w-fit">
            <Clock className="w-4 h-4" />
            Reviewed by {message.reviewedBy} on {message.reviewedDate}
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Transcript Section */}
          <div className="bg-white rounded-xl border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              What you shared
            </h2>

            {/* Language Tabs */}
            <div className="flex items-center gap-2 mb-8 border-b border-slate-200 pb-4">
              <Globe className="w-4 h-4 text-slate-600 mr-2" />
              <div className="flex gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setSelectedLanguage(lang.code)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedLanguage === lang.code
                        ? "bg-teal-100 text-teal-700"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Transcript */}
            <div className="bg-slate-50 rounded-lg p-6 border border-slate-200 mb-6">
              <p className="text-slate-800 leading-relaxed text-lg">
                {
                  message.transcripts[
                    selectedLanguage as keyof typeof message.transcripts
                  ]
                }
              </p>
            </div>

            {/* Word Count */}
            <p className="text-sm text-slate-500">
              ~
              {
                message.transcripts[
                  selectedLanguage as keyof typeof message.transcripts
                ].split(" ").length
              }{" "}
              words
            </p>
          </div>

          {/* AI Summary */}
          {message.aiSummary && (
            <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl border border-teal-200 p-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">✨</span>
                <h3 className="text-xl font-bold text-slate-900">AI Summary</h3>
              </div>
              <p className="text-slate-700 leading-relaxed">
                {message.aiSummary}
              </p>
              <p className="text-xs text-slate-500 mt-4">
                This summary was generated by our AI and reviewed by your care
                team.
              </p>
            </div>
          )}

          {/* Audio Access */}
          <div className="bg-white rounded-xl border border-slate-200 p-8">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Original Recording
            </h3>
            <p className="text-slate-600 mb-6">
              Listen to the original voice recording (audio access is logged for
              security)
            </p>
            <button
              onClick={() => setAudioModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-amber-500 text-amber-600 rounded-lg font-medium hover:bg-amber-50 transition-colors"
            >
              <Play className="w-5 h-5" />
              Play original audio recording
            </button>
          </div>
        </div>
      </div>
    </PatientLayout>
  );
}
