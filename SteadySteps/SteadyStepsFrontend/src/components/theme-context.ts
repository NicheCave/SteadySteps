import { createContext, useContext } from "react"

export type Theme = "dark" | "light" | "system"

export type ThemeProviderState = {
    theme: Theme
    setTheme: (theme: Theme) => void
}

// Context and hook live apart from the provider component so theme-provider.tsx
// exports components only and stays Fast Refresh friendly.
export const ThemeProviderContext = createContext<ThemeProviderState>({
    theme: "system",
    setTheme: () => null,
})

export const useTheme = () => {
    const context = useContext(ThemeProviderContext)

    if (context === undefined)
        throw new Error("useTheme must be used within a ThemeProvider")

    return context
}
