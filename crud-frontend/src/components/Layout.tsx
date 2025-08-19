import React from "react";
import {
  AppShell,
  AppShellHeader,
  AppShellNavbar,
  AppShellMain,
  AppShellFooter,
  Container,
  Stack,
  Paper,
} from "@mantine/core";
import { Header } from "./Header";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ProfileModal } from "./ProfileModal";
import { useTheme } from "../contexts/ThemeContext";

interface LayoutProps {
  children: React.ReactNode;
  opened: boolean;
  setOpened: (opened: boolean) => void;
  userProfile: any;
  onProfileClick: () => void;
  onLogout: () => void;
  onNavigate: (page: string) => void;
  currentPage: string;
  profileModalOpened: boolean;
  setProfileModalOpened: (opened: boolean) => void;
  setUserProfile: (profile: any) => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  opened,
  setOpened,
  userProfile,
  onProfileClick,
  onLogout,
  onNavigate,
  currentPage,
  profileModalOpened,
  setProfileModalOpened,
  setUserProfile,
}) => {
  return (
    <>
      <AppShell
        header={{ height: 65 }}
        navbar={{
          width: 300,
          breakpoint: "sm",
          collapsed: { mobile: !opened },
        }}
        footer={{ height: 60 }}
        padding="md"
        styles={{
          main: {
            backgroundColor: `var(--bg-primary)`,
            transition: "background-color 0.3s ease",
          },
        }}
      >
        {/* Header */}
        <AppShellHeader
          style={{
            backgroundColor: `var(--bg-header)`,
            borderBottom: `2px solid var(--border-color) !important`,
            boxShadow: `var(--shadow)`,
            transition:
              "background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
            zIndex: 1000,
          }}
        >
          <Header
            userProfile={userProfile}
            onProfileClick={onProfileClick}
            onLogout={onLogout}
          />
        </AppShellHeader>

        {/* Navbar */}
        <AppShellNavbar
          style={{
            backgroundColor: `var(--bg-navbar)`,
            borderRight: `2px solid var(--border-color)`,
            boxShadow: `var(--shadow)`,
            transition:
              "background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
            zIndex: 999,
          }}
        >
          <Navbar onNavigate={onNavigate} currentPage={currentPage} />
        </AppShellNavbar>

        {/* Main Content */}
        <AppShellMain>
          <Container size="xl" py="xl">
            <Stack gap="xl">
              <Paper
                withBorder
                radius="xl"
                p="xl"
                shadow="md"
                style={{
                  backgroundColor: `var(--bg-primary)`,
                  borderColor: `var(--border-color)`,
                  transition: "all 0.3s ease",
                }}
              >
                {children}
              </Paper>
            </Stack>
          </Container>
        </AppShellMain>

        {/* Footer */}
        <AppShellFooter
          style={{
            backgroundColor: `var(--bg-footer)`,
            borderTop: `2px solid var(--border-color)`,
            boxShadow: `var(--shadow)`,
            color: `var(--text-secondary)`,
            transition:
              "background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease",
            zIndex: 998,
          }}
        >
          <Footer />
        </AppShellFooter>
      </AppShell>

      {/* Profile Modal */}
      <ProfileModal
        opened={profileModalOpened}
        onClose={() => setProfileModalOpened(false)}
        userProfile={userProfile}
        setUserProfile={setUserProfile}
        onSave={() => {
          setProfileModalOpened(false);
        }}
        onRefresh={() => {}}
      />
    </>
  );
};
