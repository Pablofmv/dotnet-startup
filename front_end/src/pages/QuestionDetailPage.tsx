type Props = {
    questionId: string;
    onBack: () => void;
};

export default function QuestionDetailPage({
    questionId,
    onBack
}: Props) {

    return (
        <main>
            <button type="button" onClick={onBack}>
                Volver
            </button>

            <h1>Pregunta</h1>

            <p>Question ID: {questionId}</p>
        </main>
    )
}