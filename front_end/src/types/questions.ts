export interface CreateQuestionRequest {
    questionText: string;
    categoryId: string;
}

export interface QuestionFeedItem {
    id: string;
    questionText: string;
    categoryId: string;
    createdAt: string;
    canDelete: boolean;
}

export interface QuestionFeed {
    questions: QuestionFeedItem[];
    page: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface QuestionDetail {
    id: string;
    questionText: string;
    categoryId: string;
    createdAt: string;
    canDelete: string;
}

export interface CreateResponseRequest {
    body: string;
}

export interface ResponseItem {
    id: string;
    body: string;
    createdAt: string;
    canDelete: boolean;
}