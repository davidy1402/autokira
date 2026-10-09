import { useState, useEffect } from 'react';
import CockpitPage from './pages/cockpit.page';
import ResultsPage from './pages/results.page';
import { useCalculatorStore } from './stores/calculator.store';

export function App() {
  const [currentPage, setCurrentPage] = useState<'cockpit' | 'results'>('cockpit');
  const { theme, language } = useCalculatorStore();

  useEffect(() => {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      if (metaThemeColor) metaThemeColor.setAttribute('content', '#191c20');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      if (metaThemeColor) metaThemeColor.setAttribute('content', '#f5f8f8');
    }
  }, [theme]);

  useEffect(() => { document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en'; }, [language]);

  useEffect(() => { document.querySelector<HTMLElement>('#main-content')?.focus({ preventScroll: true }); }, [currentPage]);

  // Setup window.App for prototype compatibility
  useEffect(() => {
    (window as unknown as { App: { transitionTo: (id: string) => void; goBack: () => void } }).App = {
      transitionTo: (pageId: string) => {
        if (pageId === 'results' || pageId === 'cockpit') {
          setCurrentPage(pageId);
          window.scrollTo({ top: 0, behavior: 'instant' });
        }
      },
      goBack: () => {
        setCurrentPage('cockpit');
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-background-default text-text-primary antialiased selection:bg-brand-primary selection:text-text-inverse">
      {currentPage === 'results' ? (
        <ResultsPage
          onBack={() => {
            setCurrentPage('cockpit');
            window.scrollTo({ top: 0, behavior: 'instant' });
          }}
        />
      ) : (
        <CockpitPage
          onCalculate={() => {
            setCurrentPage('results');
            window.scrollTo({ top: 0, behavior: 'instant' });
          }}
        />
      )}
    </div>
  );
}

export default App;
