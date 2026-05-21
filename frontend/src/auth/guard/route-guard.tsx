import { useEffect } from "react";
import { Navigate, Outlet, useLocation, useSearchParams } from "react-router-dom";
import { SplashScreen } from "@/components/common/splash-screen";
import { paths } from "@/routes/paths";
import { restoreSession } from "@/store/auth-slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { UserRole } from "@/types/api";

type GuardMode = "auth" | "guest";

interface RouteGuardProps {
  mode: GuardMode;
  roles?: UserRole[];
  children?: React.ReactNode;
}

export function RouteGuard({ mode, roles, children }: RouteGuardProps) {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { role, initialized } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (!initialized) {
      void dispatch(restoreSession());
    }
  }, [dispatch, initialized]);

  if (!initialized) {
    return <SplashScreen />;
  }

  if (mode === "guest") {
    if (role) {
      return <Navigate to={searchParams.get("returnTo") || paths.persons} replace />;
    }
    return <>{children}</>;
  }

  if (!role) {
    const returnTo = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`${paths.login}?returnTo=${returnTo}`} replace />;
  }

  if (roles?.length && !roles.includes(role)) {
    return <Navigate to={paths.persons} replace />;
  }

  return children ?? <Outlet />;
}
