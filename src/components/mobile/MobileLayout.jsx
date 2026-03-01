import { useState, useCallback } from "react";
import ThemeProvider from "./ThemeProvider";
import BottomTabs from "./BottomTabs";
import TopHeader from "./TopHeader";
import PageTransition from "./PageTransition";
import PullToRefresh from "./PullToRefresh";

const PRIMARY_PAGES = ["Home", "Comics", "Videos", "Profile", "Settings"];

export default function MobileLayout({ children, currentPageName }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isSubPage = !PRIMARY_PAGES.includes(currentPageName);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const pageTitle = currentPageName
    ? currentPageName.replace(/([A-Z])/g, " $1").trim()
    : "";

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsRefreshing(false);
  }, []);

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col">
        {/* Top header: always on mobile */}
        <div className="md:hidden">
          <TopHeader title={pageTitle} showBack={isSubPage} />
        </div>

        {/* Main content */}
        <main
          className="flex-1 md:pt-0"
          style={{ paddingTop: "calc(3.5rem + env(safe-area-inset-top))", paddingBottom: isMobile ? "calc(4rem + env(safe-area-inset-bottom))" : "0" }}
        >
          <PullToRefresh onRefresh={handleRefresh}>
            <PageTransition>
              {children}
            </PageTransition>
          </PullToRefresh>
        </main>

        {/* Bottom tabs: mobile only */}
        <div className="md:hidden">
          <BottomTabs currentPage={currentPageName} />
        </div>
      </div>
    </ThemeProvider>
  );
}