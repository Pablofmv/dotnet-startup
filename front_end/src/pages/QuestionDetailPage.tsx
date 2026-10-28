
import { useEffect, useState } from "react";

import { getQuestionDetail } from "../api/questionDetail";
import { getResponses, deleteResponse } from "../api/responses";


import type {
  QuestionDetail,
  ResponseItem,
} from "../types/questions";

import { formatQuestionDate } from "../utils/formatQuestionDate";
import ResponsePanel from "../components/ResponsePanel";
import ResponseComposer from "../components/ResponseComposer";

import "./QuestionDetailPage.css";

type Props = {
  questionId: string;
  onBack: () => void;
};

export default function QuestionDetailPage({
  questionId,
  onBack,
}: Props) {
  const [question, setQuestion] =
    useState<QuestionDetail | null>(null);

  const [questionLoading, setQuestionLoading] = useState(true);
  const [questionError, setQuestionError] = useState(false);

  const [responses, setResponses] = useState<ResponseItem[]>([]);
  const [responsesLoading, setResponsesLoading] = useState(true);
  const [responsesError, setResponsesError] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadQuestion() {
      setQuestionLoading(true);
      setQuestionError(false);
      setQuestion(null);

      try {
        const result = await getQuestionDetail(questionId);

        if (active) {
          setQuestion(result);
        }
      } catch {
        if (active) setQuestionError(true);
      } finally {
        if (active) setQuestionLoading(false);
      }
    }

    void loadQuestion();

    return () => {
      active = false;
    };
  }, [questionId]);

  useEffect(() => {
    let active = true;

    async function loadResponses() {
      setResponsesLoading(true);
      setResponsesError(false);

      try {
        const result = await getResponses(questionId, page);

        if (!active) return;

        if (result.totalPages > 0 && page > result.totalPages) {
          setPage(result.totalPages);
          return;
        }

        setResponses(result.responses);
        setTotalPages(result.totalPages);
      } catch {
        if (active) setResponsesError(true);
      } finally {
        if (active) setResponsesLoading(false);
      }
    }

    void loadResponses();

    return () => {
      active = false;
    };
  }, [questionId, page, refreshCount]);

  async function handleDeleteResponse(responseId: string) {
    await deleteResponse(questionId, responseId);
    setResponses([]);
    setRefreshCount((count) => count + 1);
  }

  function handleResponsePublished(){
    setResponses([]);
    setResponsesLoading(true);
    setPage(Math.max(1,totalPages + 1));
    setRefreshCount((count)=>count + 1);
  }

  function handlePageChange(nextPage: number) {
    setResponses([]);
    setResponsesLoading(true);
    setPage(nextPage);
  }

  return (
    <main className="question-detail-page">
      <div className="question-detail-container">
        <button
          type="button"
          className="question-detail-back"
          onClick={onBack}
          aria-label="Volver"
        >
          ←
        </button>

        {questionLoading && (
          <p className="question-detail-message"
             role="status" aria-label="Cargando pregunta">
            ⟳
          </p>
        )}

        {!questionLoading && questionError && (
          <p className="question-detail-message"
             role="alert" aria-label="Error al cargar pregunta">
            ⚠
          </p>
        )}

        {!questionLoading && !questionError && question && (
          <>
            <article className="question-detail-card">
              <span className="question-detail-date">
                {formatQuestionDate(question.createdAt)}
              </span>

              <p className="question-detail-text">
                {question.questionText}
              </p>
            </article>

            {responsesLoading && (
              <p className="question-detail-message"
                 role="status" aria-label="Cargando respuestas">
                ⟳
              </p>
            )}

            {!responsesLoading && responsesError && (
              <p className="question-detail-message"
                 role="alert" aria-label="Error al cargar respuestas">
                ⚠
              </p>
            )}

            {!responsesLoading && !responsesError && (
              <>
                {responses.length > 0 && (
                  <ResponsePanel
                    responses={responses}
                    onDelete={handleDeleteResponse}
                  />
                )}

                {totalPages > 1 && (
                  <nav
                    className="response-pagination"
                    aria-label="Paginación de respuestas"
                  >
                    <button
                      type="button"
                      aria-label="Respuestas anteriores"
                      disabled={page === 1}
                      onClick={() => handlePageChange(page - 1)}
                    >
                      ←
                    </button>

                    <div className="response-page-dots">
                      {Array.from(
                        { length: totalPages },
                        (_, index) => (
                          <span
                            key={index}
                            className={
                              page === index + 1
                                ? "response-dot active"
                                : "response-dot"
                            }
                          />
                        )
                      )}
                    </div>

                    <button
                      type="button"
                      aria-label="Respuestas siguientes"
                      disabled={page >= totalPages}
                      onClick={() => handlePageChange(page + 1)}
                    >
                      →
                    </button>
                  </nav>
                )}
              </>
            )}
            <ResponseComposer 
              questionId={questionId}
              onPublished={handleResponsePublished}
            />
          </>
        )}
      </div>
    </main>
  );
}
