import { useEffect, useState } from "react";
import type { ThemeMode } from "./types";

const themeStorageKey = "ct-theme-mode";

const getStoredTheme = (): ThemeMode => {
    if (typeof window === "undefined") {
        return "light";
    }

    return window.localStorage.getItem(themeStorageKey) === "dark" ? "dark" : "light";
};

export const useThemeMode = () => {
    const [themeMode, setThemeMode] = useState<ThemeMode>(getStoredTheme);

    useEffect(() => {
        window.localStorage.setItem(themeStorageKey, themeMode);
    }, [themeMode]);

    return [themeMode, setThemeMode] as const;
};
