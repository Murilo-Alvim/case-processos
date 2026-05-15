import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { DashboardPage } from "./pages/DashboardPage";
import { AreasPage } from "./pages/AreasPage";
import { ProcessMapPage } from "./pages/ProcessMapPage";
import { ToolsPage } from "./pages/ToolsPage";
import { ResponsiblesPage } from "./pages/ResponsiblesPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="/areas" element={<AreasPage />} />
        <Route path="/mapa" element={<ProcessMapPage />} />
        <Route path="/mapa/:areaId" element={<ProcessMapPage />} />
        <Route path="/ferramentas" element={<ToolsPage />} />
        <Route path="/responsaveis" element={<ResponsiblesPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
