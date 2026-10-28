import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";

import { getLocalReferenceData } from "../api/referenceData";

import {
  getQuestions,
  deleteQuestion,
} from "../api/questions";

import type { Category } from "../types/referenceData";
import type { QuestionFeed } from "../types/questions";

import HeaderActions from "../components/HeaderActions";
import QuestionCard from "../components/QuestionCard";
import Pagination from "../components/Pagination";

import "./MainPage.css";

interface MainPageProps {
  initialCategoryId: string | null;
  page: number;
  onPageChange: (page:number) => void;
  onCreateQuestion: () => void;
  onProfile: () => void;
  onSelectQuestion: (
    questionId: string,
    categoryId: string
  ) => void;
}

interface FeedState {
  requestKey: string;
  feed: QuestionFeed | null;
  error: boolean;
}

export default function MainPage({
  initialCategoryId,
  page,
  onPageChange,
  onCreateQuestion,
  onProfile,
  onSelectQuestion,
}: MainPageProps) {
  const { user } = useAuth();

  const [community, setCommunity] = useState("");
  const [residence, setResidence] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);

  const [selectedCategoryId, setSelectedCategoryId] =
    useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [refreshCount, setRefreshCount] = useState(0);

  const [feedState, setFeedState] =
    useState<FeedState | null>(null);

  const requestKey =
    `${selectedCategoryId}:${page}:${refreshCount}`;

  const currentState =
    feedState?.requestKey === requestKey
      ? feedState
      : null;

  const feed = currentState?.feed ?? null;
  const questionsError = currentState?.error ?? false;
  const questionsLoading =
    selectedCategoryId !== null && currentState === null;

  useEffect(() => {
    if (!user) return;

    let active = true;

    async function loadReferenceData() {
      setLoading(true);
      setError(false);

      try {
        const {
          communities,
          residences,
          categories: categoryData,
        } = await getLocalReferenceData();

        if (!active) return;

        const currentCommunity = communities.find(
          (c) => c.id === user!.communityId
        );

        const currentResidence = residences.find(
          (r) => r.id === user!.residenceId
        );

        if (!currentCommunity || !currentResidence) {
          setError(true);
          return;
        }

        setCommunity(currentCommunity.name);
        setResidence(currentResidence.state);

        const categoryExists = categoryData.some(
          (category) => category.id === initialCategoryId
        );

        const startingCategoryId = categoryExists
          ? initialCategoryId
          : categoryData[0]?.id ?? null;

        setCategories(categoryData);
        setSelectedCategoryId(startingCategoryId);
      } catch {
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadReferenceData();

    return () => {
      active = false;
    };
  }, [
    user?.communityId,
    user?.residenceId,
    initialCategoryId,
  ]);

  useEffect(() => {
    if (!selectedCategoryId) return;

    let active = true;

    async function loadQuestions() {
      try {
        const result = await getQuestions(
          selectedCategoryId!,
          page
        );

        if (!active) return;

        if (result.questions.length === 0 && page > 1) {
          onPageChange(Math.max(1,page-1));
          return;
        }

        setFeedState({
          requestKey,
          feed: result,
          error: false,
        });
      } catch {
        if (active) {
          setFeedState({
            requestKey,
            feed: null,
            error: true,
          });
        }
      }
    }

    void loadQuestions();

    return () => {
      active = false;
    };
  }, [selectedCategoryId, page, refreshCount]);

  function handleCategoryChange(categoryId: string) {
    if (categoryId === selectedCategoryId) return;

    onPageChange(1);
    setSelectedCategoryId(categoryId);
  }

  async function handleDeleteQuestion(questionId: string) {
    await deleteQuestion(questionId);
    setRefreshCount((count) => count + 1);
  }

  if (loading) {
    return <main className="main-page">Cargando...</main>;
  }

  if (error) {
    return (
      <main className="main-page">
        No se pudo cargar la información.
      </main>
    );
  }

  return (
    <main className="main-page">
      <div className="main-container">
        <header className="main-header">
          <div>
            <h1>{residence}</h1>
            <p className="main-community">{community}</p>
          </div>

          <HeaderActions
            onCreateQuestion={onCreateQuestion}
            onProfile={onProfile}
          />
        </header>

        <nav
          className="main-categories"
          aria-label="Categorías"
        >
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              className={
                selectedCategoryId === category.id
                  ? "main-category active"
                  : "main-category"
              }
              aria-pressed={
                selectedCategoryId === category.id
              }
              onClick={() =>
                handleCategoryChange(category.id)
              }
            >
              {category.name}
            </button>
          ))}
        </nav>

        <section
          className="main-feed"
          aria-label="Preguntas"
        >
          {selectedCategoryId === null ? (
            <p className="main-feed-message">
              No hay categorías disponibles.
            </p>
          ) : questionsLoading ? (
            <p className="main-feed-message">
              Cargando preguntas...
            </p>
          ) : questionsError ? (
            <p
              className="main-feed-message"
              role="alert"
            >
              No se pudieron cargar las preguntas.
            </p>
          ) : feed && feed.questions.length === 0 ? (
            <p className="main-feed-message">
              Todavía no hay preguntas en esta categoría.
            </p>
          ) : (
            feed?.questions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                onDelete={handleDeleteQuestion}
                onSelect={onSelectQuestion}
              />
            ))
          )}
        </section>

        {feed && feed.questions.length > 0 && (
          <Pagination
            page={page}
            hasNextPage={feed.hasNextPage}
            hasPreviousPage={feed.hasPreviousPage}
            onPageChange={onPageChange}
          />
        )}
      </div>
    </main>
  );
}
