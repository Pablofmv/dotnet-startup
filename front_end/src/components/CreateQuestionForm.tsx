
import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import { getLocalReferenceData } from "../api/referenceData";
import { createQuestion } from "../api/questions";

import type { Category } from "../types/referenceData";
import type { CreateQuestionRequest } from "../types/questions";

import "./CreateQuestionForm.css";

interface CreateQuestionFormProps {
  onPublished: (categoryId: string) => void;
}

export default function CreateQuestionForm({
  onPublished,
}: CreateQuestionFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);

  const [categoryId, setCategoryId] = useState("");
  const [questionText, setQuestionText] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [published, setPublished] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadCategories() {
      try {
        const result = await getLocalReferenceData();

        if (active) {
          setCategories(result.categories);
        }
      } catch {
        if (active) {
          setError(true);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadCategories();

    return () => {
      active = false;
    };
  }, []);

  const questionIsValid =
    questionText.trim().length > 0 &&
    questionText.length <= 130;

  const formIsValid =
    categoryId !== "" && questionIsValid;

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (submitting || published || !formIsValid) {
      return;
    }

    setSubmitting(true);
    setMessage("");

    const request: CreateQuestionRequest = {
      questionText: questionText.trim(),
      categoryId,
    };

    try {
      await createQuestion(request);

      setPublished(true);
      onPublished(categoryId);
    } catch (error) {
      const detail =
        error instanceof Error ? error.message : "";

      if (detail === "API error: 429") {
        setMessage(
          "Has alcanzado el límite de preguntas. Intenta más tarde."
        );
      } else if (detail === "API error: 401") {
        setMessage(
          "Tu sesión no es válida. Inicia sesión nuevamente."
        );
      } else {
        setMessage("No se pudo publicar la pregunta.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p>Cargando categorías...</p>;
  }

  if (error) {
    return (
      <p role="alert">
        No se pudieron cargar las categorías.
      </p>
    );
  }

  return (
    <form
      className="create-question-form"
      onSubmit={handleSubmit}
    >
      <label htmlFor="question-category">
        Categoría
      </label>

      <select
        id="question-category"
        value={categoryId}
        onChange={(event) =>
          setCategoryId(event.target.value)
        }
        disabled={submitting || published}
        required
      >
        <option value="">
          Selecciona una categoría
        </option>

        {categories.map((category) => (
          <option
            key={category.id}
            value={category.id}
          >
            {category.name}
          </option>
        ))}
      </select>

      <label htmlFor="question-text">
        Pregunta
      </label>

      <textarea
        id="question-text"
        placeholder="Escribe tu pregunta..."
        value={questionText}
        onChange={(event) =>
          setQuestionText(event.target.value)
        }
        maxLength={130}
        rows={4}
        disabled={submitting || published}
        required
      />

      <p className="question-character-count">
        {questionText.length} / 130
      </p>

      {questionText.length > 0 && !questionIsValid && (
        <p className="create-question-error">
          La pregunta no puede estar vacía.
        </p>
      )}

      <button
        type="submit"
        className="create-question-submit"
        disabled={
          !formIsValid || submitting || published
        }
      >
        {submitting
          ? "Publicando..."
          : published
            ? "Publicado"
            : "Publicar pregunta"}
      </button>

      {message && (
        <p role="status" className="create-question-ready">
          {message}
        </p>
      )}
    </form>
  );
}
