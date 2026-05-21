import { AppBar, Button, Toolbar, Typography } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import { useThrottledCallback } from "@/hooks/use-throttled-callback";
import { paths } from "@/routes/paths";
import { logout } from "@/store/auth-slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export function AppHeader() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const role = useAppSelector((s) => s.auth.role);

  const handleLogout = useThrottledCallback(async () => {
    await dispatch(logout());
    navigate(paths.login, { replace: true });
  });

  return (
    <AppBar position="static" elevation={1}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {t("app.title")}
        </Typography>
        {role && (
          <Typography variant="body2" sx={{ mr: 2, opacity: 0.9 }}>
            {role === "admin" ? t("auth.roleAdmin") : t("auth.roleUser")}
          </Typography>
        )}
        <LanguageSwitcher />
        <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleLogout} sx={{ ml: 1 }}>
          {t("auth.logout")}
        </Button>
      </Toolbar>
    </AppBar>
  );
}
