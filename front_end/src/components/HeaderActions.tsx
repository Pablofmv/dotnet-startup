import "./HeaderActions.css"

interface HeaderActionsProps {
    onCreateQuestion: () => void;
}

export default function HeaderActions({
    onCreateQuestion,
} : HeaderActionsProps) {
    return (
        <div className="header-actions">
            <button
                type="button"
                className="header-action"
                onClick={onCreateQuestion}
                aria-label="Hacer pregunta"
                title="Hacer pregunta"
            >
                <img src="/icons/ask.svg" alt=""/>
            </button>

            <button
                type="button"
                className="header-action"
                aria-label="Perfil"
                title="Perfil"
                disabled
            >
                <img src="/icons/profile.svg" alt=""/>
            </button>

        </div>
    );
}