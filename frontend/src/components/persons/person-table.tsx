import {
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Tooltip,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslation } from "react-i18next";
import { useThrottledCallback } from "@/hooks/use-throttled-callback";
import { setListParams, toggleSort } from "@/store/persons-slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { SortField } from "@/types/api";

interface PersonTableProps {
  isAdmin: boolean;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export function PersonTable({ isAdmin, onEdit, onDelete }: PersonTableProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { items, total, listParams, listStatus } = useAppSelector((s) => s.persons);

  const colCount = isAdmin ? 7 : 6;
  const handleSort = (field: SortField) => dispatch(toggleSort(field));
  const handleEdit = useThrottledCallback(onEdit);
  const handleDelete = useThrottledCallback(onDelete);

  const sortHeader = (field: SortField, labelKey: string) => (
    <SortHeader
      field={field}
      label={t(labelKey)}
      active={listParams.sortField === field}
      direction={listParams.sortDirection}
      onSort={handleSort}
    />
  );

  return (
    <Paper variant="outlined">
      <TableContainer>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              {sortHeader("first_name", "persons.firstName")}
              {sortHeader("last_name", "persons.lastName")}
              <TableCell>{t("persons.tcknMasked")}</TableCell>
              {sortHeader("email", "persons.email")}
              <TableCell>{t("persons.professionGroup")}</TableCell>
              {sortHeader("created_at", "persons.createdAt")}
              {isAdmin && <TableCell align="right">{t("common.actions")}</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {listStatus === "loading" && items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={colCount} align="center">
                  {t("common.loading")}
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={colCount} align="center">
                  <Typography color="text.secondary">{t("persons.noRows")}</Typography>
                </TableCell>
              </TableRow>
            ) : (
              items.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>{row.first_name}</TableCell>
                  <TableCell>{row.last_name}</TableCell>
                  <TableCell>{row.tckn_masked}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>{row.profession_group?.name ?? "—"}</TableCell>
                  <TableCell>{new Date(row.created_at).toLocaleString()}</TableCell>
                  {isAdmin && (
                    <TableCell align="right">
                      <Tooltip title={t("common.edit")}>
                        <IconButton size="small" onClick={() => handleEdit(row.id)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t("common.delete")}>
                        <IconButton size="small" color="error" onClick={() => handleDelete(row.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={total}
        page={listParams.page - 1}
        onPageChange={(_, p) => dispatch(setListParams({ page: p + 1 }))}
        rowsPerPage={listParams.size}
        onRowsPerPageChange={(e) =>
          dispatch(setListParams({ size: parseInt(e.target.value, 10), page: 1 }))
        }
        rowsPerPageOptions={[10, 20, 50, 100]}
        labelRowsPerPage={t("pagination.rowsPerPage")}
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} ${t("pagination.of")} ${count !== -1 ? count : `>${to}`}`
        }
      />
    </Paper>
  );
}

interface SortHeaderProps {
  field: SortField;
  label: string;
  active: boolean;
  direction: "asc" | "desc";
  onSort: (field: SortField) => void;
}

function SortHeader({ field, label, active, direction, onSort }: SortHeaderProps) {
  return (
    <TableCell sortDirection={active ? direction : false}>
      <TableSortLabel
        active={active}
        direction={active ? direction : "asc"}
        onClick={() => onSort(field)}
      >
        {label}
      </TableSortLabel>
    </TableCell>
  );
}
