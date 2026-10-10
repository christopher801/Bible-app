import { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppProvider } from './context/AppContext.jsx';
import MainLayout from './layouts/MainLayout.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { pageLoaders } from './pages/index.js';

const P = Object.fromEntries(Object.entries(pageLoaders).map(([name, load]) => [name, lazy(load)]));

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppProvider>
          <Suspense fallback={<div className="page" role="status" aria-busy="true" style={{ minHeight: '60vh' }} />}>
            <Routes>
              <Route element={<MainLayout />}>
                <Route path="/" element={<P.Home />} />
                <Route path="/bible" element={<P.BibleBooks />} />
                <Route path="/bible/:book" element={<P.BookPage />} />
                <Route path="/bible/:book/:chapter" element={<P.Reader />} />
                <Route path="/search" element={<P.Search />} />
                <Route path="/favorites" element={<P.Favorites />} />
                <Route path="/highlights" element={<P.Highlights />} />
                <Route path="/notes" element={<P.Notes />} />
                <Route path="/history" element={<P.History />} />
                <Route path="/reading-plans" element={<P.ReadingPlans />} />
                <Route path="/devotional" element={<P.Devotional />} />
                <Route path="/settings" element={<P.Settings />} />
                <Route path="/install" element={<P.Install />} />
                <Route path="/about" element={<P.About />} />
                <Route path="/privacy" element={<P.Privacy />} />
                <Route path="/terms" element={<P.Terms />} />
                <Route path="/licenses" element={<P.Licenses />} />
                <Route path="/contact" element={<P.Contact />} />
                <Route path="*" element={<P.NotFound />} />
              </Route>
            </Routes>
          </Suspense>
        </AppProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
