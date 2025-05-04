import React, { useState } from "react";
import AdminSidebar from "@components/admin/AdminSidebar";
import { Route, Routes } from "react-router-dom";
import DeliverManager from "./DeliverManager";
import RouteManager from "./RouteManager";

const Dashboard = () => {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleCollapseChange = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  return (
    <div>
      <AdminSidebar onCollapseChange={handleCollapseChange} />
      <Routes>
        <Route
          path="/deliver"
          element={<DeliverManager isSidebarCollapsed={isSidebarCollapsed} />}
        />
        <Route
          path="/route"
          element={<RouteManager isSidebarCollapsed={isSidebarCollapsed} />}
        />
      </Routes>
    </div>
  );
};

export default Dashboard;
