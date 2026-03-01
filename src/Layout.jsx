import MobileLayout from "./components/mobile/MobileLayout";

export default function Layout({ children, currentPageName }) {
  return (
    <MobileLayout currentPageName={currentPageName}>
      {children}
    </MobileLayout>
  );
}