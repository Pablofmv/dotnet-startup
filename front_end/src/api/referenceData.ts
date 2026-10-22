import { apiRequest } from "./client";
import type { Community, Residence, Category } from "../types/referenceData";

export function getCommunities(): Promise<Community[]> {
    return apiRequest<Community[]>(
        "/reference-data/communities"
    );
}

export function getResidences(): Promise<Residence[]> {
    return apiRequest<Residence[]>(
        "/reference-data/residences"
    );
}

export function getCategories(): Promise<Category[]> {
    return apiRequest<Category[]>(
        "/reference-data/categories"
    );
}