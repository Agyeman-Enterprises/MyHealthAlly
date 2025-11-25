import { Link } from "react-router-dom";
import { Save, X, Plus, Grip, Trash2, Eye } from "lucide-react";
import { useState } from "react";

export default function CarePlanEditor() {
  const [sections, setSections] = useState([
    { id: 1, title: "Supplements", items: ["Vitamin D3 - 2000 IU daily", "Omega-3 - 1000mg daily"] },
    { id: 2, title: "Nutrition", items: ["High-protein breakfast", "Balanced macros for lunch and dinner"] },
    { id: 3, title: "Exercise", items: ["Cardio - 3x per week", "Strength training - 2x per week"] },
  ]);

  const [newSection, setNewSection] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  const addSection = () => {
    if (newSection.trim()) {
      setSections([
        ...sections,
        { id: Date.now(), title: newSection, items: [] },
      ]);
      setNewSection("");
    }
  };

  const removeSection = (id: number) => {
    setSections(sections.filter((s) => s.id !== id));
  };

  const addItem = (sectionId: number) => {
    setSections(
      sections.map((s) =>
        s.id === sectionId
          ? { ...s, items: [...s.items, "New item"] }
          : s
      )
    );
  };

  const removeItem = (sectionId: number, itemIndex: number) => {
    setSections(
      sections.map((s) =>
        s.id === sectionId
          ? { ...s, items: s.items.filter((_, i) => i !== itemIndex) }
          : s
      )
    );
  };

  const updateItem = (sectionId: number, itemIndex: number, value: string) => {
    setSections(
      sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              items: s.items.map((item, i) =>
                i === itemIndex ? value : item
              ),
            }
          : s
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/staff" className="flex items-center gap-3">
            <img 
              src="https://cdn.builder.io/api/v1/image/assets%2Ff0e178cb947e448182889b581f07529d%2F9e0f1a3b796e459286bbf9636ed59102?format=webp&width=100" 
              alt="MyHealthAlly Logo" 
              className="h-8"
            />
          </Link>
          <Link to="/staff" className="text-teal-600 hover:text-teal-700 font-medium">
            Back to Staff
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Care Plan Editor</h1>
          <p className="text-lg text-slate-600">Build personalized wellness plans with drag-and-drop</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Editor */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Care Plan Sections</h2>

            {/* Sections */}
            <div className="space-y-6 mb-8">
              {sections.map((section) => (
                <div
                  key={section.id}
                  className="border-2 border-teal-200 rounded-xl p-6 bg-teal-50"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Grip className="w-5 h-5 text-slate-400 cursor-grab" />
                      <h3 className="text-lg font-bold text-slate-900">{section.title}</h3>
                    </div>
                    <button
                      onClick={() => removeSection(section.id)}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Items */}
                  <div className="space-y-3 mb-4">
                    {section.items.map((item, itemIdx) => (
                      <div
                        key={itemIdx}
                        className="flex items-center gap-3 bg-white p-3 rounded-lg"
                      >
                        <input
                          type="text"
                          value={item}
                          onChange={(e) =>
                            updateItem(section.id, itemIdx, e.target.value)
                          }
                          className="flex-1 outline-none text-slate-700"
                        />
                        <button
                          onClick={() => removeItem(section.id, itemIdx)}
                          className="p-1 hover:bg-red-100 rounded transition-colors text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Item */}
                  <button
                    onClick={() => addItem(section.id)}
                    className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Item
                  </button>
                </div>
              ))}
            </div>

            {/* Add Section */}
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 mb-8">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newSection}
                  onChange={(e) => setNewSection(e.target.value)}
                  placeholder="Section name (e.g., Labs, Medications)..."
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
                />
                <button
                  onClick={addSection}
                  className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button className="flex-1 bg-teal-500 hover:bg-teal-600 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
                <Save className="w-5 h-5" />
                Save Plan
              </button>
              <button className="flex-1 border-2 border-slate-300 text-slate-700 hover:text-slate-900 py-3 rounded-xl font-semibold transition-colors">
                Cancel
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Eye className="w-5 h-5 text-slate-600" />
              <h2 className="text-lg font-bold text-slate-900">Preview</h2>
            </div>

            <div className="space-y-4">
              {sections.map((section) => (
                <div key={section.id} className="border-l-4 border-teal-500 pl-4">
                  <h3 className="font-semibold text-slate-900 mb-2">{section.title}</h3>
                  <ul className="space-y-1 text-sm text-slate-600">
                    {section.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-teal-500 mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Patient Info */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <p className="text-sm text-slate-600 mb-3">
                <span className="font-semibold text-slate-900">For:</span> Sarah Chen
              </p>
              <button className="w-full bg-teal-50 hover:bg-teal-100 text-teal-600 py-2 rounded-lg font-medium transition-colors">
                Select Patient
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
