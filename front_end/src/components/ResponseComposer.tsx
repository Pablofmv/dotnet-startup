import { useState } from "react";
import type { FormEvent } from "react";

import { createResponse } from "../api/responses";

import "./ResponseComposer.css";

interface ResponseComposerProps {
    questionId: string;
    onPublished: () => void;
}


export default function ResponseComposer({
    questionId,
    onPublished,
}: ResponseComposerProps) {

    const [body, setBody] = useState("");

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(false);
    const [message, setMessage] = useState("");

    const maxCharacters = 180;
    const isValid = body.trim().length > 0 && body.length <= maxCharacters;

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ){
        event.preventDefault();

        const responseText = body.trim();

        if(
            submitting || responseText.length === 0 || body.length > maxCharacters
        ){
            return;
        }

        setSubmitting(true);
        setError(false);
        setMessage("");

        try{
            await createResponse(questionId, {
                body: responseText,
            });

            setBody("");
            onPublished();
        } catch (error) {
            if (
                error instanceof Error &&
                error.message === "API error: 429"
            )
            {
                setMessage("Has alcanzado el limite de respuestas. Intenta mas tarde.")
            } else {
                setError(true);
            }
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form className="response-composer" onSubmit={handleSubmit}>
            <div className="response-composer-row">
                <textarea 
                    aria-label = "Escribe tu respuesta"
                    placeholder="Escribe tu respuesta..."
                    value={body}
                    onChange={(event) => setBody(event.target.value)}
                    maxLength={maxCharacters}
                    rows={1} 
                    disabled={submitting}
                />

                <button
                    type="submit"
                    aria-label="Enviar respuesta"
                    disabled={!isValid || submitting}
                >
                    <img src="/icons/send.svg" alt=""></img>
                </button>
            </div>
                <span className="response-character-count">
                    {body.length} / {maxCharacters}
                </span>

                {error && (
                    <p
                        role="alert"
                        aria-label="Error al publicar respuesta"
                        className="response-error"
                    >
                    ⚠
                    </p>
                )}

                {message && (
                    <p className="response-rate-message" role="alert">
                        <img src="/icons/alert-circle.svg" alt="" />
                        {message}
                    </p>
                )}
        </form>
    );
}