import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import RoleSelection from "./pages/RoleSelection";
import Dashboard from "./pages/Dashboard";
import VitalsTrends from "./pages/VitalsTrends";
import CarePlan from "./pages/CarePlan";
import Messages from "./pages/Messages";
import Appointments from "./pages/Appointments";
import VirtualVisit from "./pages/VirtualVisit";
import PatientSettings from "./pages/PatientSettings";
import VoiceMessages from "./pages/VoiceMessages";
import VoiceMessageDetail from "./pages/VoiceMessageDetail";
import StaffDashboard from "./pages/StaffDashboard";
import Alerts from "./pages/Alerts";
import PatientDetail from "./pages/PatientDetail";
import CarePlanEditor from "./pages/CarePlanEditor";
import ClinicianDashboard from "./pages/clinician/ClinicianDashboard";
import ClinicianVirtualVisit from "./pages/clinician/ClinicianVirtualVisit";
import ClinicianPatients from "./pages/clinician/ClinicianPatients";
import ClinicianSettings from "./pages/clinician/ClinicianSettings";
import ClinicianMessages from "./pages/clinician/ClinicianMessages";
import ClinicianAlertsTriage from "./pages/clinician/ClinicianAlertsTriage";
import ClinicianVisitQueue from "./pages/clinician/ClinicianVisitQueue";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/role-selection" element={<RoleSelection />} />

          {/* Patient Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/vitals" element={<VitalsTrends />} />
          <Route path="/care-plan" element={<CarePlan />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/visit" element={<VirtualVisit />} />
          <Route path="/voice-messages" element={<VoiceMessages />} />
          <Route path="/voice-messages/:id" element={<VoiceMessageDetail />} />
          <Route path="/settings" element={<PatientSettings />} />

          {/* Legacy Clinician Routes (Old) */}
          <Route path="/staff" element={<StaffDashboard />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/patient/:id" element={<PatientDetail />} />
          <Route path="/care-plan-editor" element={<CarePlanEditor />} />

          {/* Clinician Routes (New) */}
          <Route path="/clinician/dashboard" element={<ClinicianDashboard />} />
          <Route path="/clinician/virtual-visit/:id" element={<ClinicianVirtualVisit />} />
          <Route path="/clinician/patients" element={<ClinicianPatients />} />
          <Route path="/clinician/patient/:id" element={<PatientDetail />} />
          <Route path="/clinician/messages" element={<ClinicianMessages />} />
          <Route path="/clinician/alerts" element={<ClinicianAlertsTriage />} />
          <Route path="/clinician/visits" element={<ClinicianVisitQueue />} />
          <Route path="/clinician/settings" element={<ClinicianSettings />} />

          {/* Catch All */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

// Create root once and reuse on HMR updates
const renderApp = () => {
  const container = document.getElementById("root");
  if (!container) return;

  if (!(window as any).__app_root__) {
    (window as any).__app_root__ = createRoot(container);
  }

  (window as any).__app_root__.render(<App />);
};

renderApp();
