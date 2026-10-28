import { apiRequest } from "./client";
import type { CreateResponseRequest, ResponseFeed , CreateResponseResponse } from "../types/questions";

export function getResponses(
    questionId: string,
    page: number = 1
): Promise<ResponseFeed> {
    return apiRequest<ResponseFeed>(
        `/questions/${questionId}/responses?page=${page}`
    );
}

export function deleteResponse(
    questionId: string,
    responseId: string
): Promise<void> {
    return apiRequest<void>(
        `/questions/${questionId}/responses/${responseId}`,
        { method : "DELETE"}
    );
}

export function createResponse(
    questionId: string,
    request: CreateResponseRequest
): Promise<CreateResponseResponse> {
    return apiRequest<CreateResponseResponse> (
        `/questions/${questionId}/responses`,
        {
            method: "POST",
            body: JSON.stringify(request),
        }
    );
}