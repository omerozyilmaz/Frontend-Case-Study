import { CssBaseline, ThemeProvider } from "@mui/material";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { RouteGuard } from "@/auth/guard";
import { AppLayout } from "@/components/layout/app-layout";
import { LoginPage } from "@/pages/login-page";
import { PersonsPage } from "@/pages/persons-page";
import { paths } from "@/routes/paths";
import { appTheme } from "@/theme/app-theme";

export default function App() {
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route
            path={paths.login}
            element={
              <RouteGuard mode="guest">
                <LoginPage />
              </RouteGuard>
            }
          />
          <Route
            element={
              <RouteGuard mode="auth">
                <AppLayout />
              </RouteGuard>
            }
          >
            <Route index element={<Navigate to={paths.persons} replace />} />
            <Route path={paths.persons} element={<PersonsPage />} />
          </Route>
          <Route path="*" element={<Navigate to={paths.persons} replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
