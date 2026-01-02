import { RequirePractice } from '@/components/RequirePractice';
import HospitalAdmissionInner from './HospitalAdmissionInner';

export default function HospitalAdmissionPage() {
  return (
    <RequirePractice featureName="Hospital Admission Notification">
      <HospitalAdmissionInner />
    </RequirePractice>
  );
}
