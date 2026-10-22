import { useState } from "react";

import { AuthProvider, useAuth } from "./context/AuthContext";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MainPage from "./pages/MainPage";
import CreateQuestionPage from "./pages/CreateQuestionPage";

type AuthenticatedPage = "feed" | "create-question";

function AppContent() {
  const { user, loading } = useAuth();

  const [authPage, setAuthPage] = useState<
    "login" | "register"
  >("login");

  const [currentPage, setCurrentPage] =
    useState<AuthenticatedPage>("feed");

  const [selectedCategoryId, setSelectedCategoryId] =
    useState<string | null>(null);

  function handleQuestionPublished(categoryId: string) {
    setSelectedCategoryId(categoryId);
    setCurrentPage("feed");
  }

  if (loading) {
    return <p>Cargando...</p>;
  }

  if (user) {
    if (currentPage === "create-question") {
      return (
        <CreateQuestionPage
          onBack={() => setCurrentPage("feed")}
          onPublished={handleQuestionPublished}
        />
      );
    }

    return (
      <MainPage
        initialCategoryId={selectedCategoryId}
        onCreateQuestion={() =>
          setCurrentPage("create-question")
        }
      />
    );
  }

  if (authPage === "register") {
    return (
      <RegisterPage
        onLogin={() => setAuthPage("login")}
      />
    );
  }

  return (
    <LoginPage
      onRegister={() => setAuthPage("register")}
    />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
