import { Toggle } from "@carbon/react";
import { useTheme } from "../../context/ThemeContext";

export const ThemeToggle = () => {

    const { isDark, toggleTheme } = useTheme();

    return (
        <Toggle
            id="theme-toggle"
            labelA="light"
            labelB="Dark"
            toggled={isDark}
            onChange={toggleTheme}
            hideLabel
        />
    )
};