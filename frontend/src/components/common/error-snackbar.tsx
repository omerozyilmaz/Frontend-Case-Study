import { Alert, Snackbar } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";

interface ErrorSnackbarProps {
  message: string | null;
  status?: number;
  onClose: () => void;
}

function resolveMessage(message: string, status: number | undefined, t: TFunction) {
  if (status === 401) return t("errors.unauthorized");
  if (status === 403) return t("errors.forbidden");
  if (status === 404) return t("errors.notFound");
  if (status === 409) return message || t("errors.conflict");
  if (message === "generic" || !message) return t("errors.generic");
  return message;
}

export function ErrorSnackbar({ message, status, onClose }: ErrorSnackbarProps) {
  const { t } = useTranslation();
  const open = Boolean(message);
  const text = resolveMessage(message ?? "", status, t);

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert severity="error" onClose={onClose} variant="filled">
        {text}
      </Alert>
    </Snackbar>
  );
}
