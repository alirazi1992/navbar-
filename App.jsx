import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "@/components/Layout.jsx";
import AdminDashboard from "@/pages/AdminDashboard.jsx";
import UsersManagement from "@/pages/UsersManagement.jsx";
import VesselsManagement from "@/pages/VesselsManagement.jsx";
import EnvironmentalData from "@/pages/EnvironmentalData.jsx";
import IncidentsManagement from "@/pages/IncidentsManagement.jsx";
import ContentManagement from "@/pages/ContentManagement.jsx";
import NotificationsManagement from "@/pages/NotificationsManagement.jsx";
import ClientDashboard from "@/pages/ClientDashboard.jsx";
import MyVessels from "@/pages/MyVessels.jsx";
import MapRadar from "@/pages/MapRadar.jsx";
import RouteInfo from "@/pages/RouteInfo.jsx";
import NewsRegulations from "@/pages/NewsRegulations.jsx";
import ClientProfile from "@/pages/ClientProfile.jsx";

function NotFound() {
  return (
    <div className="flex min-h-[30vh] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700/70 bg-slate-900/70 p-10 text-center text-slate-300">
      <p className="text-3xl font-semibold text-white">404</p>
      <p className="mt-2 text-sm text-slate-400">
        The requested view could not be found. Use the navigation menu to choose a page.
      </p>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/admin" replace />} />
        <Route path="admin" element={<AdminDashboard />} />
        <Route path="admin/users" element={<UsersManagement />} />
        <Route path="admin/vessels" element={<VesselsManagement />} />
        <Route path="admin/environment" element={<EnvironmentalData />} />
        <Route path="admin/incidents" element={<IncidentsManagement />} />
        <Route path="admin/content" element={<ContentManagement />} />
        <Route path="admin/notifications" element={<NotificationsManagement />} />

        <Route path="client" element={<ClientDashboard />} />
        <Route path="client/vessels" element={<MyVessels />} />
        <Route path="client/map" element={<MapRadar />} />
        <Route path="client/routes" element={<RouteInfo />} />
        <Route path="client/news" element={<NewsRegulations />} />
        <Route path="client/profile" element={<ClientProfile />} />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
