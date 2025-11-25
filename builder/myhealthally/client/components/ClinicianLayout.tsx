import ClinicianNav from "./ClinicianNav";
import { ReactNode } from "react";

interface ClinicianLayoutProps {
  children: ReactNode;
  activePage?: string;
}

export default function ClinicianLayout({ children, activePage }: ClinicianLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 flex flex-col">
      <ClinicianNav activePage={activePage} />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar is now part of ClinicianNav */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
