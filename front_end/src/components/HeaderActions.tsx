import "./HeaderActions.css"

interface HeaderActionsProps {
    onCreateQuestion: () => void;
    onProfile: () => void;
}

export default function HeaderActions({
    onCreateQuestion,
    onProfile,
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
                onClick={onProfile}
                aria-label="Perfil"
                title="Perfil"
            >
                <img src="/icons/profile.svg" alt=""/>
            </button>

        </div>
    );
}