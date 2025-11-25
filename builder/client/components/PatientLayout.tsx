import PatientNav from "./PatientNav";
import { ReactNode } from "react";

interface PatientLayoutProps {
  children: ReactNode;
  activePage?: string;
}

export default function PatientLayout({ children, activePage }: PatientLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 flex flex-col">
      <PatientNav activePage={activePage} />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar is now part of PatientNav */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
