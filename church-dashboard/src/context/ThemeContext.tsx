import { createContext, useContext, useEffect, useState } from "react";
import type{ CarbonTheme, ThemeContextValue } from "../types/church.types";
//import { ThemeContext } from "@carbon/react";

const ThemeContext = createContext<ThemeContextValue | null>(null);
const initialTheme = (): CarbonTheme => {
    try {
        const stored = localStorage.getItem("app-theme");
        if (stored === "white" || stored === "g90" || stored === "g100") {
            return stored;
        }
    } catch { }
    return "white";
 };

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => { 
    const [isTheme, setIsTheme] = useState<CarbonTheme>(initialTheme)
    const isDark = isTheme === "g90" || isTheme === "g100";
    
    const toggleTheme = () => {
        setIsTheme((prev) => ( prev ==="white" ? "g90" : "white"))
    };

    useEffect(() => {
        try {
            localStorage.setItem("app-theme", isTheme);
            // Apply theme class and data attribute to body for global CSS targeting
            document.body.setAttribute("data-carbon-theme", isTheme);
            document.body.className = `cds--theme--${isTheme}`;
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

