import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SharesPage from "./pages/SharesPage";
import UpdatesPage from "./pages/UpdatesPage";
import StatisticsPage from "./pages/StatisticsPage";
import MainLayout from "./components/MainLayout";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="shares" element={<SharesPage />} />
        <Route path="updates" element={<UpdatesPage />} />
        <Route path="statistics" element={<StatisticsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
