import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Theme } from "@carbon/react";
import { ThemeProvider, useTheme as useAppTheme } from "./context/ThemeContext";

function CarbonThemeSync({ children }: { children: React.ReactNode }) {
  const { isTheme } = useAppTheme();
  return <Theme theme={isTheme}>{children}</Theme>;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ThemeProvider>

    <CarbonThemeSync>
      <React.StrictMode>
    <App />
  </React.StrictMode>
    </CarbonThemeSync>
  </ThemeProvider>
);
