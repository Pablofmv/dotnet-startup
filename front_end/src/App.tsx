import { useState } from "react";

import { AuthProvider, useAuth } from "./context/AuthContext";

import QuestionDetailPage from "./pages/QuestionDetailPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MainPage from "./pages/MainPage";
import CreateQuestionPage from "./pages/CreateQuestionPage";
import ProfilePage from "./pages/ProfilePage";

type AuthenticatedPage = "feed" | "create-question" | "question-detail" | "profile";

function AppContent() {
  const { user, loading } = useAuth();

  const [authPage, setAuthPage] = useState<"login" | "register">("login");

  const [currentPage, setCurrentPage] = useState<AuthenticatedPage>("feed");

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const [feedPage, setFeedPage] = useState(1);

  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);

  function handleQuestionPublished(categoryId: string) {
    setSelectedCategoryId(categoryId);
    setFeedPage(1);
    setCurrentPage("feed");
  }

  function handleSelectQuestion(questionId:string, categoryId:string) {
    setSelectedQuestionId(questionId);
    setSelectedCategoryId(categoryId);
    setCurrentPage("question-detail");
  }

  if (loading) {
    return <p>Cargando...</p>;
  }

  if (user) {

    if (currentPage === "profile") {
      return (
        <ProfilePage
          onBack={()=>setCurrentPage("feed")}
        />
      );
    }

    if (currentPage === "create-question") {
      return (
        <CreateQuestionPage
          onBack={() => setCurrentPage("feed")}
          onPublished={handleQuestionPublished}
        />
      );
    }

    if(currentPage ==="question-detail" && selectedQuestionId) {
      return (
        <QuestionDetailPage 
          questionId={selectedQuestionId}
          onBack={() => setCurrentPage("feed")}
        />
      );
    }

    return (
      <MainPage
        initialCategoryId={selectedCategoryId}
        page={feedPage}
        onPageChange={setFeedPage}
        onCreateQuestion={() =>
          setCurrentPage("create-question")
        }
        onProfile={()=> setCurrentPage("profile")}
        onSelectQuestion={handleSelectQuestion}
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
