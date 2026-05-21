import { zodResolver } from "@hookform/resolvers/zod";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import {
  Alert,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import { paths } from "@/routes/paths";
import { loginSchema, type LoginFormValues } from "@/schemas/login-schema";
import { clearAuthError, login } from "@/store/auth-slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export function LoginForm() {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { status, error } = useAppSelector((s) => s.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "admin@example.com", password: "Admin123!" },
  });

  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  const onSubmit = handleSubmit(async (values) => {
    const result = await dispatch(login(values));
    if (login.fulfilled.match(result)) {
      navigate(searchParams.get("returnTo") || paths.persons, { replace: true });
    }
  });

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        p: 2,
      }}
    >
      <Paper elevation={3} sx={{ p: 4, width: "100%", maxWidth: 420 }}>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
          <LanguageSwitcher />
        </Box>
        <Typography variant="h5" gutterBottom fontWeight={600}>
          {t("app.title")}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {t("auth.loginTitle")}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error === "generic" ? t("auth.loginError") : error}
          </Alert>
        )}

        <Box component="form" onSubmit={onSubmit} noValidate>
          <TextField
            {...register("email")}
            label={t("auth.email")}
            type="email"
            fullWidth
            margin="normal"
            error={Boolean(errors.email)}
            helperText={errors.email ? t("validation.email") : " "}
            autoComplete="email"
          />
          <TextField
            {...register("password")}
            label={t("auth.password")}
            type={showPassword ? "text" : "password"}
            fullWidth
            margin="normal"
            error={Boolean(errors.password)}
            helperText={errors.password ? t("validation.minLength", { min: 6 }) : " "}
            autoComplete="current-password"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      type="button"
                      aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
                      onClick={() => setShowPassword((prev) => !prev)}
                      onMouseDown={(e) => e.preventDefault()}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            sx={{ mt: 2 }}
            disabled={status === "loading"}
          >
            {status === "loading" ? t("common.loading") : t("auth.login")}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
