import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import i18n from "@/i18n";

export function LanguageSwitcher() {
  const lang = i18n.language.startsWith("en") ? "en" : "tr";

  const handleChange = (_: React.MouseEvent<HTMLElement>, value: string | null) => {
    if (value) {
      void i18n.changeLanguage(value);
      localStorage.setItem("crudfab-lang", value);
    }
  };

  return (
    <ToggleButtonGroup size="small" value={lang} exclusive onChange={handleChange} color="standard">
      <ToggleButton value="tr">TR</ToggleButton>
      <ToggleButton value="en">EN</ToggleButton>
    </ToggleButtonGroup>
  );
}
