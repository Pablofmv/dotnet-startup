import { useState } from "react";

import type { ResponseItem } from "../types/questions";
import { formatQuestionDate } from "../utils/formatQuestionDate";
import ConfirmDeleteDialog from "./ConfirmDeleteDialog";

import "./ResponsePanel.css";

interface ResponsePanelProps {
    responses: ResponseItem[];
    onDelete: (responseId: string) => Promise<void>;
}

export default function ResponsePanel({
    responses,
    onDelete,
}: ResponsePanelProps) {

    const [selectedResponseId, setSelectedResponseId] = useState<string | null>(null);
    
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState(false);

    async function handleDelete() {
        if (!selectedResponseId || deleting) return;

        setDeleting(true);
        setDeleteError(false);

        try {
            await onDelete(selectedResponseId);
            setSelectedResponseId(null);
        } catch {
            setDeleteError(true);
        } finally {
            setDeleting(false);
        }
    }


    return(
        <section className="response-panel" aria-label="Respuestas">
            {responses.map((response)=> (
                <article key={response.id} className="response-card">
                    <div className="response-top">
                        <span className="response-date">
                            {formatQuestionDate(response.createdAt)}
                        </span>

                        {response.canDelete && (
                            <button
                                type="button"
                                className="response-delete"
                                aria-label="Eliminar respuesta"
                                onClick={()=> {
                                    setDeleteError(false);
                                    setSelectedResponseId(response.id);
                                }}
                            >
                                <img src="/icons/delete.svg" alt=""/>
                            </button>
                        )}
                    </div>

                    <p className="response-body">
                        {response.body}
                    </p>

                    <span className="response-username">
                        {response.username}
                    </span>
                </article>
            ))}

            {deleteError && (
                <p role="alert" className="response-error" aria-label="Error al eliminar la respuesta"> 
                ⚠
                </p>
            )}

            {selectedResponseId && (
                <ConfirmDeleteDialog 
                    title="Eliminar esta respuesta?"
                    message="Esta accion no se puede deshacer."
                    deleting={deleting}
                    onCancel={()=>{
                        setSelectedResponseId(null);
                        setDeleteError(false);
                    }}
                    onConfirm={()=> void handleDelete()}
                />
            )}
        </section>
    );
}