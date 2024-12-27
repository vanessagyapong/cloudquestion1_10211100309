import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";

interface IsAuthProps {
  children: React.ReactNode;
}

export default function IsAuth({ children }: IsAuthProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/store");
    }
  }, [user, loading, router]);

  // Show nothing while loading or redirecting
  if (loading || user) {
    return null;
  }

  // Show children (login/register form) if not authenticated
  return <>{children}</>;
}
