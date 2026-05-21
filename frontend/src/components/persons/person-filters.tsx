import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
  Typography,
  type SelectChangeEvent,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useThrottledCallback } from "@/hooks/use-throttled-callback";
import { resetFilters, setListParams } from "@/store/persons-slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const EMPTY_DRAFT = { nameContains: "", tcknPrefix: "", professionGroupIds: [] as number[] };

export function PersonFilters() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const listParams = useAppSelector((s) => s.persons.listParams);
  const professionGroups = useAppSelector((s) => s.professionGroups.items);

  const [draft, setDraft] = useState({
    nameContains: listParams.nameContains,
    tcknPrefix: listParams.tcknPrefix,
    professionGroupIds: listParams.professionGroupIds,
  });

  const handleGroupChange = (event: SelectChangeEvent<number[]>) => {
    const value = event.target.value;
    setDraft((d) => ({
      ...d,
      professionGroupIds: typeof value === "string" ? [] : value,
    }));
  };

  const handleApply = useThrottledCallback(() => {
    dispatch(setListParams({ ...draft, page: 1 }));
  });

  const handleClear = useThrottledCallback(() => {
    setDraft(EMPTY_DRAFT);
    dispatch(resetFilters());
  });

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          {t("filters.title")}
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr auto" },
            gap: 2,
            alignItems: "start",
          }}
        >
          <TextField
            label={t("filters.nameContains")}
            placeholder={t("filters.namePlaceholder")}
            value={draft.nameContains}
            onChange={(e) => setDraft((d) => ({ ...d, nameContains: e.target.value }))}
            size="small"
            fullWidth
          />
          <TextField
            label={t("filters.tcknPrefix")}
            placeholder={t("filters.tcknPlaceholder")}
            value={draft.tcknPrefix}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                tcknPrefix: e.target.value.replace(/\D/g, "").slice(0, 11),
              }))
            }
            size="small"
            fullWidth
            slotProps={{ htmlInput: { inputMode: "numeric" } }}
          />
          <FormControl size="small" fullWidth>
            <InputLabel>{t("filters.professionGroups")}</InputLabel>
            <Select
              multiple
              value={draft.professionGroupIds}
              onChange={handleGroupChange}
              input={<OutlinedInput label={t("filters.professionGroups")} />}
              renderValue={(selected) =>
                professionGroups
                  .filter((g) => selected.includes(g.id))
                  .map((g) => g.name)
                  .join(", ")
              }
            >
              {professionGroups.map((g) => (
                <MenuItem key={g.id} value={g.id}>
                  {g.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button variant="contained" startIcon={<SearchIcon />} onClick={handleApply}>
              {t("common.search")}
            </Button>
            <Button variant="outlined" startIcon={<ClearIcon />} onClick={handleClear}>
              {t("common.clear")}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
