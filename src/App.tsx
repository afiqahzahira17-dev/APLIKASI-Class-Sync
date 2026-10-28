import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { MobileDeviceShell } from './components/MobileDeviceShell';
import { HeaderNav } from './components/HeaderNav';
import { BottomNavBar } from './components/BottomNavBar';
import { ScheduleView } from './components/ScheduleView';
import { AssignmentView } from './components/AssignmentView';
import { AgendaAnnouncementView } from './components/AgendaAnnouncementView';
import { ClassDetailView } from './components/ClassDetailView';
import { NotificationModal } from './components/NotificationModal';
import { AuthModal } from './components/AuthModal';
import { ClassModal } from './components/ClassModal';
import { XpGlowBanner } from './components/XpGlowBanner';
import { LoginPage } from './components/LoginPage';

const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);

  return (
    <>
      <XpGlowBanner />
      <HeaderNav
        onOpenNotifications={() => setIsNotifOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenClassModal={() => setIsClassModalOpen(true)}
      />

      <main className="flex-1 px-3.5 sm:px-4 pt-3.5 max-w-5xl mx-auto w-full">
        {activeTab === 'jadwal' && (
          <ScheduleView onOpenClassModal={() => setIsClassModalOpen(true)} />
        )}
        {activeTab === 'tugas' && (
          <AssignmentView onOpenClassModal={() => setIsClassModalOpen(true)} />
        )}
        {activeTab === 'agenda' && (
          <AgendaAnnouncementView onOpenClassModal={() => setIsClassModalOpen(true)} />
        )}
        {activeTab === 'kelas' && (
          <ClassDetailView onOpenClassModal={() => setIsClassModalOpen(true)} />
        )}
      </main>

      <BottomNavBar />

      {/* Modals */}
      <NotificationModal isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <ClassModal isOpen={isClassModalOpen} onClose={() => setIsClassModalOpen(false)} />
    </>
  );
};

const AppPortalGate: React.FC = () => {
  const { isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <MobileDeviceShell>
      <MainContent />
    </MobileDeviceShell>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppPortalGate />
    </AppProvider>
  );
}
