import CreateQuestionForm from "../components/CreateQuestionForm";

import "./CreateQuestionPage.css";

interface CreateQuestionPageProps {
    onBack: () => void;
    onPublished: (categoryId: string) => void;
}

export default function CreateQuestionPage({
    onBack,
    onPublished,
} : CreateQuestionPageProps) {
    return (
        <main className="create-question-page">
            <div className="create-question-container">
                <header className="create-question-header">
                    <button
                        type="button"
                        className="create-question-back"
                        onClick={onBack}
                        aria-label="Volver"
                    >
                        <span aria-hidden="true">←</span>
                    </button>

                    <h1>Hacer pregunta</h1>
                </header>

                <CreateQuestionForm onPublished={onPublished}/>
            </div>
        </main>
    )
}