export interface RegisterRequest {
    email: string;
    password: string,
    communityId: string;
    residenceId: string;
    address?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
    address?: string;
}

export interface CurrentUser {
    id: string;
    username: string;
    email: string;
    communityId: string;
    residenceId: string;
}