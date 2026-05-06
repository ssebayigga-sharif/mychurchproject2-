"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type{ CarbonTheme, ThemeContextValue } from "../types/church.types";

const ThemeContext = createContext<ThemeContextValue | null>(null);

const THEME_CLASSES = ["cds--theme--white", "cds--theme--g10", "cds--theme--g90", "cds--theme--g100"] as const;

const initialTheme = (): CarbonTheme => {
    try {
        const stored = localStorage.getItem("app-theme");
        if (stored === "white" || stored === "g10" || stored === "g90" || stored === "g100") {
            return stored;
        }
    } catch { }
    return "white";
 };

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => { 
    const [isTheme, setIsTheme] = useState<CarbonTheme>(initialTheme)
    const isDark = isTheme === "g90" || isTheme === "g100";
    
    const toggleTheme = () => {
        setIsTheme((prev) => ( prev ==="white" ? "g100" : "white"))
    };

    useEffect(() => {
        try {
            localStorage.setItem("app-theme", isTheme);
            // Set data attribute for CSS variable targeting
            document.body.setAttribute("data-carbon-theme", isTheme);
            // Remove old theme classes, then add the current one
            THEME_CLASSES.forEach(cls => document.body.classList.remove(cls));
            document.body.classList.add(`cds--theme--${isTheme}`);
        } catch { }
    }, [isTheme])
    
    return (
        <ThemeContext.Provider value={{ isTheme, isDark, toggleTheme, setIsTheme }}>
            {children}
        </ThemeContext.Provider>
    )
};

export function useTheme() { 
    const context = useContext(ThemeContext);

    if (!context) throw new Error("Use theme must be used inside ThemeProvider");
    return context;
};

