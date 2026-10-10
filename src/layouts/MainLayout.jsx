import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useApp } from '../context/AppContext.jsx';
import AppHeader from '../components/AppHeader.jsx';
import Sidebar from '../components/Sidebar.jsx';
import BottomNav from '../components/BottomNav.jsx';
import AppFooter from '../components/AppFooter.jsx';
import OfflineIndicator from '../components/OfflineIndicator.jsx';

const css = `
.skip-link { position: absolute; left: 8px; top: -60px; z-index: 3000; background: var(--accent); color: var(--on-accent); padding: 10px 16px; border-radius: 8px; font-weight: 700; text-decoration: none; }
.skip-link:focus { top: 8px; }
.shell { min-height: 100dvh; }
.shell__col { min-height: 100dvh; display: flex; flex-direction: column; padding-bottom: calc(var(--bottomnav-h) + env(safe-area-inset-bottom)); }
.shell__main { flex: 1; min-width: 0; outline: none; }
@media (min-width: 992px) { .shell__col { margin-left: var(--sidebar-w); padding-bottom: 0; } }
`;

export default function MainLayout() {
  const { t } = useApp();
  const { pathname } = useLocation();

  // New page → scroll to top (the reader scrolls to a verse itself when asked).
  useEffect(() => {
    if (!window.location.search.includes('verse=')) window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="shell">
      <style>{css}</style>
      <a href="#main" className="skip-link">
        {t('a11y.skip')}
      </a>
      <Sidebar />
      <div className="shell__col">
        <AppHeader />
        <OfflineIndicator />
        <main id="main" className="shell__main" tabIndex={-1}>
          <Outlet />
        </main>
        <AppFooter />
      </div>
      <BottomNav />
    </div>
  );
}
