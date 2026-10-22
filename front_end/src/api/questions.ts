import { apiRequest } from "./client";
import type { QuestionFeed, CreateQuestionRequest, CreateQuestionResponse } from "../types/questions";

export function getQuestions(categoryId: string, page: number = 1) : Promise<QuestionFeed> {
    const params = new URLSearchParams({
        categoryId,
        page: String(page),
        pageSize: "4",
    });

    return apiRequest<QuestionFeed>(
        `/questions?${params.toString()}`
    );
}

export function deleteQuestion(
    questionId:string
) : Promise <void> {
    return apiRequest<void>(
        `/questions/${questionId}`,
        {
            method: "DELETE",
        }
    );
}

export function createQuestion(
    request: CreateQuestionRequest
) : Promise<CreateQuestionResponse>{
    return apiRequest<CreateQuestionResponse>(
        "/questions",
        {
            method:"POST",
            body: JSON.stringify(request),
        }
    );
}