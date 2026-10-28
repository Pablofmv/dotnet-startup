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

let cachedData: Promise<{
    communities: Community[];
    residences: Residence[];
    categories: Category[];
}> | null = null;

export function getLocalReferenceData() {
    if(cachedData) {
        return cachedData;
    }

    cachedData = Promise.all([
        getCommunities(),
        getResidences(),
        getCategories(),
    ])
    .then(([communities, residences, categories]) => ({
        communities,
        residences,
        categories,
    }))
    .catch((error) => {
        cachedData = null;
        throw error;
    });

    return cachedData;
}