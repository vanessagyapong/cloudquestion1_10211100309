import StoreManagement from "@/components/StoreManagement";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function StoreManagementPage() {
  return (
    <ProtectedRoute>
      <StoreManagement />
    </ProtectedRoute>
  );
}
