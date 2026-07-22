import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "./index.css";
import "./i18n"; // Initialize i18n
import App from "./App.tsx";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 minutes - increased from 5
      gcTime: 30 * 60 * 1000, // 30 minutes - increased from 10
      retry: 1,
      refetchOnWindowFocus: false, // Prevent refetch on window focus
      refetchOnMount: false, // Only refetch if data is stale
      refetchOnReconnect: false, // Prevent refetch on reconnect
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <MantineProvider
          defaultColorScheme="light"
          theme={{
            components: {
              // Ensure every Modal overlays the full app (header/navbar/footer)
              Modal: {
                defaultProps: {
                  withinPortal: true,
                  zIndex: 10000,
                  overlayProps: {
                    backgroundOpacity: 0.55,
                    blur: 2,
                  },
                },
              },
              Drawer: {
                defaultProps: {
                  withinPortal: true,
                  zIndex: 10000,
                },
              },
              // Modal zIndex=10000 — dropdown undan yuqori bo'lishi shart
              Select: {
                defaultProps: {
                  comboboxProps: { withinPortal: true, zIndex: 11000 },
                },
              },
              MultiSelect: {
                defaultProps: {
                  comboboxProps: { withinPortal: true, zIndex: 11000 },
                },
              },
              Autocomplete: {
                defaultProps: {
                  comboboxProps: { withinPortal: true, zIndex: 11000 },
                },
              },
            },
          }}
        >
          <Notifications position="top-right" zIndex={11000} />
          <BrowserRouter>
            <App />
          </BrowserRouter>
          <ReactQueryDevtools initialIsOpen={false} />
        </MantineProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);
