import type { QuestionDetail } from "../types/questions";

export async function getQuestionDetail(
    questionId: string
): Promise<QuestionDetail> {
    
    const response = await fetch(
        `/api/questions/${questionId}`
    );

    if (!response.ok) {
        throw new Error("No se pudo cargar la pregunta.");
    }

    const question: QuestionDetail = await response.json();

    return question;

}