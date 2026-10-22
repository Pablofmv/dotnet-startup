import { useEffect, useRef } from "react";

import "./ConfirmDeleteDialog.css";

interface ConfirmDeleteDialogProps {
  title: string;
  message: string;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmDeleteDialog({
  title,
  message,
  deleting,
  onCancel,
  onConfirm,
}: ConfirmDeleteDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) return;

    dialog.showModal();

    return () => {
      dialog.close();
    };
  }, []);

  function handleCancel(
    event: React.SyntheticEvent<HTMLDialogElement>
  ) {
    event.preventDefault();

    if (!deleting) {
      onCancel();
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="confirm-dialog"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
      onCancel={handleCancel}
    >
      <h2 id="confirm-dialog-title">{title}</h2>

      <p id="confirm-dialog-message">{message}</p>

      <div className="confirm-dialog-actions">
        <button
          type="button"
          className="confirm-cancel"
          onClick={onCancel}
          disabled={deleting}
        >
          Cancelar
        </button>

        <button
          type="button"
          className="confirm-delete"
          onClick={onConfirm}
          disabled={deleting}
        >
          {deleting ? "Eliminando..." : "Eliminar"}
        </button>
      </div>
    </dialog>
  );
}