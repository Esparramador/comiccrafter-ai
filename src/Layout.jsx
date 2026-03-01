import MobileLayout from "./components/mobile/MobileLayout";
import { useEffect, useState } from "react";

export default function Layout({ children, currentPageName }) {
  return (
    <MobileLayout currentPageName={currentPageName}>
      {children}
    </MobileLayout>
  );
}