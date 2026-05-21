import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { personFormSchema, type PersonFormValues } from "@/schemas/person-schema";
import type { PersonDetail, ProfessionGroup } from "@/types/api";

interface PersonFormDialogProps {
  open: boolean;
  editingPerson: PersonDetail | null;
  professionGroups: ProfessionGroup[];
  loading: boolean;
  onClose: () => void;
  onSubmit: (values: PersonFormValues) => void;
}

const EMPTY_VALUES: PersonFormValues = {
  first_name: "",
  last_name: "",
  tckn: "",
  email: "",
  profession_group_id: 0,
};

function tcknErrorText(t: TFunction, key?: string) {
  if (key === "tcknLength") return t("validation.tcknLength");
  if (key === "tcknInvalid") return t("validation.tcknInvalid");
  return key ? t("validation.required") : " ";
}

export function PersonFormDialog({
  open,
  editingPerson,
  professionGroups,
  loading,
  onClose,
  onSubmit,
}: PersonFormDialogProps) {
  const { t } = useTranslation();
  const isEdit = Boolean(editingPerson?.id);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PersonFormValues>({
    resolver: zodResolver(personFormSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (!open) return;
    if (editingPerson) {
      reset({
        first_name: editingPerson.first_name,
        last_name: editingPerson.last_name,
        tckn: editingPerson.tckn,
        email: editingPerson.email,
        profession_group_id: editingPerson.profession_group_id,
      });
    } else {
      reset({ ...EMPTY_VALUES, profession_group_id: professionGroups[0]?.id ?? 0 });
    }
  }, [open, editingPerson, professionGroups, reset]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? t("persons.editPerson") : t("persons.addPerson")}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            {...register("first_name")}
            label={t("persons.firstName")}
            error={Boolean(errors.first_name)}
            helperText={errors.first_name ? t("validation.minLength", { min: 2 }) : " "}
            fullWidth
          />
          <TextField
            {...register("last_name")}
            label={t("persons.lastName")}
            error={Boolean(errors.last_name)}
            helperText={errors.last_name ? t("validation.minLength", { min: 2 }) : " "}
            fullWidth
          />
          <TextField
            {...register("tckn")}
            label={t("persons.tckn")}
            error={Boolean(errors.tckn)}
            helperText={tcknErrorText(t, errors.tckn?.message)}
            fullWidth
            slotProps={{ htmlInput: { maxLength: 11 } }}
            disabled={isEdit}
          />
          <TextField
            {...register("email")}
            label={t("persons.email")}
            type="email"
            error={Boolean(errors.email)}
            helperText={errors.email ? t("validation.email") : " "}
            fullWidth
          />
          <Controller
            name="profession_group_id"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={Boolean(errors.profession_group_id)}>
                <InputLabel>{t("persons.professionGroup")}</InputLabel>
                <Select {...field} label={t("persons.professionGroup")} value={field.value || ""}>
                  {professionGroups.map((g) => (
                    <MenuItem key={g.id} value={g.id}>
                      {g.name}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  {errors.profession_group_id ? t("validation.professionGroup") : " "}
                </FormHelperText>
              </FormControl>
            )}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose}>{t("common.cancel")}</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? t("common.loading") : t("common.save")}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
