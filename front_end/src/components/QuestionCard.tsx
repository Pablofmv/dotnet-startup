import { useState } from "react";

import type { QuestionFeedItem } from "../types/questions";
import { formatQuestionDate } from "../utils/formatQuestionDate";
import ConfirmDeleteDialog from "./ConfirmDeleteDialog";

import "./QuestionCard.css";

interface QuestionCardProps {
    question: QuestionFeedItem;
    onDelete: (questionId: string) => Promise<void>;
}

export default function QuestionCard({
    question,
    onDelete,
} : QuestionCardProps) {
    
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState(false);

    async function handleDelete() {
        if (deleting) return;

        setDeleting(true);
        setDeleteError(false);

        try {
            await onDelete(question.id);
            setShowConfirmation(false);
        } catch {
            setDeleteError(true);
        } finally {
            setDeleting(false);
        }
    }

    return (
        <article className="question-card">
            <div className="question-card-top">
                <span className="question-card-time">
                    {formatQuestionDate(question.createdAt)}
                </span>

                {question.canDelete && (
                    <button
                        type ="button"
                        className="question-card-delete"
                        aria-label="Eliminar pregunta"
                        onClick={() => {
                            setDeleteError(false);
                            setShowConfirmation(true);
                        }}
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            aria-hidden="true"
                            >
                            <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            <p className ="question-card-text">
                {question.questionText}
            </p>

            <div className="question-card-meta">
                <span>{question.username}</span>

                <span
                    className="question-card-responses"
                    aria-label={`${question.responseCount} respuestas`}
                >
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-4-.9L3 21l1.5-4.5A8.4 8.4 0 1 1 21 11.5Z" />
                    </svg>
                    <span>{question.responseCount}</span>
                </span>
            </div>

            {deleteError && (
                <p className="question-card-error" role="alert">
                    No se pudo eliminar la pregunta.
                </p>
            )}

            {showConfirmation && (
                <ConfirmDeleteDialog 
                    title="¿Eliminar esta pregunta?"
                    message="Esta acción también eliminará todas sus respuestas."
                    deleting={deleting}
                    onCancel={() => setShowConfirmation(false)}
                    onConfirm={() => void handleDelete()}
                />
            )}

        </article>
    );
}

