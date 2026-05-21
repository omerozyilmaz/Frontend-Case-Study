import { useCallback, useEffect, useState } from "react";
import { Alert, Box, Button, Snackbar, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useTranslation } from "react-i18next";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { ErrorSnackbar } from "@/components/common/error-snackbar";
import { PersonFilters } from "@/components/persons/person-filters";
import { PersonFormDialog } from "@/components/persons/person-form-dialog";
import { PersonTable } from "@/components/persons/person-table";
import { fetchPerson } from "@/api/persons-api";
import { selectIsAdmin } from "@/store/auth-slice";
import {
  clearFormError,
  clearListError,
  clearSuccess,
  loadPersons,
  removePerson,
  savePerson,
} from "@/store/persons-slice";
import { loadProfessionGroups } from "@/store/profession-groups-slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { PersonDetail } from "@/types/api";
import type { PersonFormValues } from "@/schemas/person-schema";

const SUCCESS_KEYS = {
  create: "persons.createSuccess",
  update: "persons.updateSuccess",
  delete: "persons.deleteSuccess",
} as const;

export function PersonsPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isAdmin = useAppSelector(selectIsAdmin);
  const professionGroups = useAppSelector((s) => s.professionGroups.items);
  const groupsStatus = useAppSelector((s) => s.professionGroups.status);
  const { formStatus, formError, listError, success, listParams } = useAppSelector(
    (s) => s.persons,
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<PersonDetail | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  useEffect(() => {
    if (groupsStatus === "idle" && professionGroups.length === 0) {
      void dispatch(loadProfessionGroups());
    }
  }, [dispatch, groupsStatus, professionGroups.length]);

  useEffect(() => {
    void dispatch(loadPersons(listParams));
  }, [dispatch, listParams]);

  const openCreate = () => {
    setEditingPerson(null);
    setDialogOpen(true);
  };

  const openEdit = useCallback(async (id: number) => {
    const person = await fetchPerson(id).catch(() => null);
    if (!person) return;
    setEditingPerson(person);
    setDialogOpen(true);
  }, []);

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingPerson(null);
    dispatch(clearFormError());
  };

  const confirmDelete = async () => {
    if (pendingDeleteId === null) return;
    const action = await dispatch(removePerson(pendingDeleteId));
    setPendingDeleteId(null);
    if (removePerson.fulfilled.match(action)) {
      void dispatch(loadPersons(listParams));
    }
  };

  const submit = async (values: PersonFormValues) => {
    const action = await dispatch(savePerson({ id: editingPerson?.id, values }));
    if (savePerson.fulfilled.match(action)) {
      setDialogOpen(false);
      setEditingPerson(null);
      void dispatch(loadPersons(listParams));
    }
  };

  const successText = success ? t(SUCCESS_KEYS[success]) : null;

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5" fontWeight={600}>
          {t("persons.title")}
        </Typography>
        {isAdmin && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            {t("persons.addPerson")}
          </Button>
        )}
      </Box>

      <PersonFilters />
      <PersonTable isAdmin={isAdmin} onEdit={openEdit} onDelete={setPendingDeleteId} />

      {isAdmin && (
        <PersonFormDialog
          open={dialogOpen}
          editingPerson={editingPerson}
          professionGroups={professionGroups}
          loading={formStatus === "loading"}
          onClose={closeDialog}
          onSubmit={submit}
        />
      )}

      <ConfirmDialog
        open={pendingDeleteId !== null}
        title={t("common.deleteTitle")}
        message={t("common.confirmDelete")}
        confirmLabel={t("common.delete")}
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />

      <ErrorSnackbar message={formError} onClose={() => dispatch(clearFormError())} />
      <ErrorSnackbar message={listError} onClose={() => dispatch(clearListError())} />

      <Snackbar
        open={Boolean(successText)}
        autoHideDuration={4000}
        onClose={() => dispatch(clearSuccess())}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => dispatch(clearSuccess())}>
          {successText}
        </Alert>
      </Snackbar>
    </Box>
  );
}
