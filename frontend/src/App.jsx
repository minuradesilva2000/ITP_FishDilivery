import "./App.css";
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastProvider } from "./components/ui/toast";
import { Toaster } from "./components/ui/toaster";

import Dashboard from "./pages/Admin/Dashboard";
import Login from "./pages/Loginn";

function App() {
  return (
    <>
      <ToastProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard/*" element={<Dashboard />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </>
  );
}

export default App;
