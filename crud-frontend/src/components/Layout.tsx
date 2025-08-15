import React from "react";
import {
  AppShell,
  AppShellHeader,
  AppShellNavbar,
  AppShellMain,
  AppShellFooter,
  Container,
  Stack,
} from "@mantine/core";
import { Header } from "./Header";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
  opened: boolean;
  setOpened: (opened: boolean) => void;
  userProfile: {
    name: string;
    email: string;
  };
  onProfileClick: () => void;
  onLogout: () => void;
  onNavigate?: (page: string) => void;
  currentPage?: string;
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
}) => {
  return (
    <AppShell
      header={{ height: 80 }}
      navbar={{ width: 300, breakpoint: "sm", collapsed: { mobile: !opened } }}
      footer={{ height: 60 }}
      padding="md"
      bg="gray.1"
    >
      {/* Header */}
      <AppShellHeader bg="blue" c="white">
        <Header
          userProfile={userProfile}
          onProfileClick={onProfileClick}
          onLogout={onLogout}
        />
      </AppShellHeader>

      {/* Navbar */}
      <AppShellNavbar bg="white">
        <Navbar onNavigate={onNavigate} currentPage={currentPage} />
      </AppShellNavbar>

      {/* Main Content */}
      <AppShellMain>
        <Container size="xl" py="xl">
          <Stack gap="xl">{children}</Stack>
        </Container>
      </AppShellMain>

      {/* Footer */}
      <AppShellFooter bg="white" c="gray.7">
        <Footer />
      </AppShellFooter>
    </AppShell>
  );
};
