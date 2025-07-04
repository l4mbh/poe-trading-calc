import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SharesPage from "./pages/SharesPage";
import UpdatesPage from "./pages/UpdatesPage";
import MainLayout from "./components/MainLayout";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="shares" element={<SharesPage />} />
        <Route path="updates" element={<UpdatesPage />} />
      </Route>
    </Routes>
  );
}

export default App;
