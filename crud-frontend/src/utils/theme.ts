// Theme utility functions and constants

export const THEME_COLORS = {
  light: {
    primary: "#ffffff",
    secondary: "#f8f9fa",
    tertiary: "#e9ecef",
    card: "#ffffff",
    header: "#ffffff",
    navbar: "#ffffff",
    footer: "#ffffff",
    text: {
      primary: "#213547",
      secondary: "#6c757d",
      muted: "#adb5bd",
    },
    border: {
      primary: "#dee2e6",
      light: "#f1f3f5",
    },
    accent: {
      primary: "#646cff",
      hover: "#535bf2",
      light: "#e7e9ff",
    },
    shadow: {
      sm: "0 2px 8px rgba(0, 0, 0, 0.1)",
      md: "0 10px 25px rgba(0, 0, 0, 0.15)",
      lg: "0 20px 40px rgba(0, 0, 0, 0.2)",
    },
  },
  dark: {
    primary: "#141517",
    secondary: "#1a1b1e",
    tertiary: "#2c2e33",
    card: "#1a1b1e",
    header: "#1a1b1e",
    navbar: "#1a1b1e",
    footer: "#1a1b1e",
    text: {
      primary: "#ffffff",
      secondary: "#e9ecef",
      muted: "#adb5bd",
    },
    border: {
      primary: "#2c2e33",
      light: "#1a1b1e",
    },
    accent: {
      primary: "#646cff",
      hover: "#535bf2",
      light: "#2c2e33",
    },
    shadow: {
      sm: "0 2px 8px rgba(0, 0, 0, 0.4)",
      md: "0 10px 25px rgba(0, 0, 0, 0.5)",
      lg: "0 20px 40px rgba(0, 0, 0, 0.6)",
    },
  },
} as const;

export const getThemeColor = (
  theme: "light" | "dark",
  path: string
): string => {
  const pathParts = path.split(".");
  let current: any = THEME_COLORS[theme];

  for (const part of pathParts) {
    if (current && typeof current === "object" && part in current) {
      current = current[part];
    } else {
      console.warn(`Theme color path not found: ${path} for theme: ${theme}`);
      return "#000000"; // fallback color
    }
  }

  return current;
};

export const getContrastColor = (backgroundColor: string): string => {
  // Simple contrast calculation - in production, use a more sophisticated algorithm
  const hex = backgroundColor.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  return brightness > 128 ? "#000000" : "#ffffff";
};

export const getThemeTransition = (properties: string[] = ["all"]): string => {
  const duration = "0.3s";
  const easing = "ease";
  return properties.map((prop) => `${prop} ${duration} ${easing}`).join(", ");
};

export const getThemeShadow = (
  theme: "light" | "dark",
  size: "sm" | "md" | "lg" = "sm"
): string => {
  return THEME_COLORS[theme].shadow[size];
};

export const getThemeBorder = (
  theme: "light" | "dark",
  type: "primary" | "light" = "primary"
): string => {
  return `1px solid ${THEME_COLORS[theme].border[type]}`;
};

export const getThemeBackground = (
  theme: "light" | "dark",
  type:
    | "primary"
    | "secondary"
    | "tertiary"
    | "card"
    | "header"
    | "navbar"
    | "footer"
): string => {
  return THEME_COLORS[theme][type];
};

export const getThemeText = (
  theme: "light" | "dark",
  type: "primary" | "secondary" | "muted"
): string => {
  return THEME_COLORS[theme].text[type];
};

export const getThemeAccent = (
  theme: "light" | "dark",
  type: "primary" | "hover" | "light"
): string => {
  return THEME_COLORS[theme].accent[type];
};

// CSS Custom Properties generator
export const generateThemeCSS = (theme: "light" | "dark"): string => {
  const colors = THEME_COLORS[theme];
  return `
    --bg-primary: ${colors.primary};
    --bg-secondary: ${colors.secondary};
    --bg-tertiary: ${colors.tertiary};
    --bg-card: ${colors.card};
    --bg-header: ${colors.header};
    --bg-navbar: ${colors.navbar};
    --bg-footer: ${colors.footer};
    --text-primary: ${colors.text.primary};
    --text-secondary: ${colors.text.secondary};
    --text-muted: ${colors.text.muted};
    --border-color: ${colors.border.primary};
    --border-light: ${colors.border.light};
    --accent-color: ${colors.accent.primary};
    --accent-hover: ${colors.accent.hover};
    --accent-light: ${colors.accent.light};
    --shadow: ${colors.shadow.sm};
    --shadow-lg: ${colors.shadow.md};
    --shadow-xl: ${colors.shadow.lg};
  `;
};

// Theme validation
export const isValidTheme = (theme: string): theme is "light" | "dark" => {
  return theme === "light" || theme === "dark";
};

// Theme preference detection
export const getSystemThemePreference = (): "light" | "dark" => {
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return "light";
};

// Theme persistence
export const saveThemeToStorage = (theme: "light" | "dark"): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("theme", theme);
  }
};

export const getThemeFromStorage = (): "light" | "dark" | null => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("theme");
    return isValidTheme(saved) ? saved : null;
  }
  return null;
};

// Theme change listener for system preference changes
export const addSystemThemeListener = (
  callback: (theme: "light" | "dark") => void
): (() => void) => {
  if (typeof window === "undefined" || !window.matchMedia) {
    return () => {}; // No-op function if not in browser
  }

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const handler = (e: MediaQueryListEvent) => {
    callback(e.matches ? "dark" : "light");
  };

  mediaQuery.addEventListener("change", handler);

  return () => {
    mediaQuery.removeEventListener("change", handler);
  };
};
