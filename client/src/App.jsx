import { Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import HomePage from "./pages/HomePage";
import CommunityRecipesPage from "./pages/CommunityRecipesPage";
import RecipeDetailPage from "./pages/RecipeDetailPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import NotFoundPage from "./pages/NotFoundPage";

import MyRecipesPage from "./pages/MyRecipesPage";
import RecipeFormPage from "./pages/RecipeFormPage";
import FavoritesPage from "./pages/FavoritesPage";
import AdminCommentsPage from "./pages/AdminCommentsPage";

import "./styles/Community.css";
import "./styles/admin.css";

import "./styles/Community.css";
import "./styles/admin.css";

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<HomePage />} />

        <Route path="/cong-dong" element={<CommunityRecipesPage />} />

        <Route path="/cong-thuc/:id" element={<RecipeDetailPage />} />

        <Route path="/dang-nhap" element={<LoginPage />} />

        <Route path="/dang-ky" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/yeu-thich" element={<FavoritesPage />} />

          <Route path="/cong-thuc-cua-toi" element={<MyRecipesPage />} />

          <Route path="/dang-cong-thuc" element={<RecipeFormPage />} />

          <Route path="/sua-cong-thuc/:id" element={<RecipeFormPage />} />
        </Route>

        <Route element={<ProtectedRoute roles={["admin"]} />}>
          <Route path="/quan-tri/binh-luan" element={<AdminCommentsPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;