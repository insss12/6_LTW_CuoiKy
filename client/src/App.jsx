import { Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import HomePage from "./pages/HomePage";
import RecipeDetailPage from "./pages/RecipeDetailPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import NotFoundPage from "./pages/NotFoundPage";

import MyRecipesPage from "./pages/MyRecipesPage";
import RecipeFormPage from "./pages/RecipeFormPage";

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>

        <Route index element={<HomePage />} />

        <Route
          path="/cong-thuc/:id"
          element={<RecipeDetailPage />}
        />

        <Route
          path="/dang-nhap"
          element={<LoginPage />}
        />

        <Route
          path="/dang-ky"
          element={<RegisterPage />}
        />

        {/* Các trang dưới đây bắt buộc phải đăng nhập */}
        <Route element={<ProtectedRoute />}>

          <Route
            path="/cong-thuc-cua-toi"
            element={<MyRecipesPage />}
          />

          <Route
            path="/dang-cong-thuc"
            element={<RecipeFormPage />}
          />

          <Route
            path="/sua-cong-thuc/:id"
            element={<RecipeFormPage />}
          />

        </Route>

        <Route path="*" element={<NotFoundPage />} />

      </Route>
    </Routes>
  );
}

export default App;
