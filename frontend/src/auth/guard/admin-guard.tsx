import { Navigate } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import { selectIsAdmin } from "@/store/auth-slice";
import { paths } from "@/routes/paths";

type AdminGuardProps = {
  children: React.ReactNode;
};

export function AdminGuard({ children }: AdminGuardProps) {
  const isAdmin = useAppSelector(selectIsAdmin);

  if (!isAdmin) {
    return <Navigate to={paths.persons} replace />;
  }

  return <>{children}</>;
}
