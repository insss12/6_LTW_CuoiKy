import { Outlet } from "react-router-dom";

import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";

function MainLayout() {
  return (
    <div className="app">
      <SiteHeader />

      <main className="main-content">
        <Outlet />
      </main>

      <SiteFooter />
    </div>
  );
}

export default MainLayout;