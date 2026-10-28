import { apiRequest  } from "./client";
import type { CurrentUser } from "../types/auth";

export function updateUsername(username: string) : Promise<CurrentUser> {

    return apiRequest<CurrentUser>("/auth/username", {
        method:"PATCH",
        body:JSON.stringify({username}),
    });
}

export function logout(): Promise<void> {
    return apiRequest<void>("/auth/logout", {
        method: "POST",
    });
}