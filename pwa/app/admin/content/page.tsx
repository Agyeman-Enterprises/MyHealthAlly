import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/auth";
import { supabaseService } from "@/lib/supabase/service";
import { ContentManager } from "./ContentManager";

export default async function AdminContentPage() {
  const user = await getCurrentUser();
  
  if (!user || user.role !== "admin") {
    redirect("/auth/login");
  }

  if (!supabaseService) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <h1 className="text-2xl font-semibold">Content Release Manager</h1>
        <p className="mt-4 text-red-600">Supabase service client not configured.</p>
      </div>
    );
  }

  const { data: modules, error } = await supabaseService
    .from("content_modules")
    .select("*")
    .order("category")
    .order("title");

  if (error) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <h1 className="text-2xl font-semibold">Content Release Manager</h1>
        <p className="mt-4 text-red-600">Error loading content: {error.message}</p>
      </div>
    );
  }

  return <ContentManager initialModules={modules || []} />;
}

