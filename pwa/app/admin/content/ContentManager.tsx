"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type ContentModule = {
  id: string;
  slug: string;
  category: string;
  title: string;
  body: string;
  status: string;
  reuse_allowed: boolean;
  podcast_ready: boolean;
  source: string;
  created_at: string;
  updated_at: string;
  // Optional fields (for backward compatibility)
  release_group?: string;
  license_tier_required?: string;
  publish_at?: string | null;
  unpublish_at?: string | null;
};

type Props = {
  initialModules: ContentModule[];
};

export function ContentManager({ initialModules }: Props) {
  const router = useRouter();
  const [modules, setModules] = useState(initialModules);
  const [toggling, setToggling] = useState<string | null>(null);

  const handleToggle = async (id: string, currentStatus: string) => {
    setToggling(id);
    try {
      const nextStatus = currentStatus === "published" ? "hidden" : "published";

      const res = await fetch("/api/admin/content/toggle", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, status: nextStatus }),
      });

      if (!res.ok) {
        throw new Error("Failed to toggle status");
      }

      // Update local state
      setModules((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: nextStatus } : m))
      );

      router.refresh();
    } catch (error) {
      console.error("Error toggling status:", error);
      alert("Failed to update status");
    } finally {
      setToggling(null);
    }
  };

  const modulesByCategory = modules.reduce((acc, module) => {
    if (!acc[module.category]) {
      acc[module.category] = [];
    }
    acc[module.category]!.push(module);
    return acc;
  }, {} as Record<string, ContentModule[]>);

  const categoryNames: Record<string, string> = {
    "health-navigation": "Health Navigation",
    "nutrition": "Nutrition",
    "movement": "Movement",
    "lifestyle": "Lifestyle",
    "concierge": "Concierge Care",
  };

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="text-2xl font-semibold mb-2">Content Release Manager</h1>
      <p className="text-sm text-gray-600 mb-6">
        Control content visibility without code redeploys. DB is authoritative source.
      </p>

      {Object.entries(modulesByCategory).map(([category, categoryModules]) => (
        <Card key={category} className="mb-6">
          <h2 className="text-lg font-semibold text-navy-600 mb-4">
            {categoryNames[category] || category}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Title</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Group</th>
                  <th className="text-left p-2">License</th>
                  <th className="text-left p-2">Source</th>
                  <th className="text-center p-2">Reuse</th>
                  <th className="text-center p-2">Podcast</th>
                  <th className="text-left p-2">Publish Date</th>
                  <th className="text-left p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {categoryModules.map((module) => (
                  <tr key={module.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{module.title}</td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          module.status === "published"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {module.status}
                      </span>
                    </td>
                    <td className="p-2 text-gray-600">{module.release_group}</td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          module.license_tier_required === "enterprise"
                            ? "bg-blue-100 text-blue-800"
                            : module.license_tier_required === "marketing"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {module.license_tier_required || "basic"}
                      </span>
                    </td>
                    <td className="p-2">
                      <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                        {module.source || "manual"}
                      </span>
                    </td>
                    <td className="p-2 text-center">
                      {module.reuse_allowed ? "✓" : ""}
                    </td>
                    <td className="p-2 text-center">
                      {module.podcast_ready ? "✓" : ""}
                    </td>
                    <td className="p-2 text-gray-600 text-xs">
                      {module.publish_at
                        ? new Date(module.publish_at).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="p-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggle(module.id, module.status)}
                        disabled={toggling === module.id}
                        isLoading={toggling === module.id}
                      >
                        {module.status === "published" ? "Unpublish" : "Publish"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ))}

      {modules.length === 0 && (
        <Card>
          <p className="text-gray-500 text-center py-8">
            No content modules found. Run the sync script to populate from markdown files.
          </p>
        </Card>
      )}
    </div>
  );
}

