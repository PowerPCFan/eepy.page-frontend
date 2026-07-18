export const CONSENT_COOKIE_NAME = "eepy_cookie_consent";

export const CONSENT_CATEGORIES = {
    necessary: "necessary",
    preferences: "preferences",
    analytics: "analytics",
} as const;

type ConsentCookie = {
    categories?: string[];
};

function readCookie(name: string): string | null {
    if (typeof document === "undefined") return null;

    const cookie = document.cookie.split("; ").find(row => row.startsWith(`${name}=`));

    return cookie ? cookie.slice(name.length + 1) : null;
}

export function hasConsentCategory(category: string): boolean {
    const cookie = readCookie(CONSENT_COOKIE_NAME);
    if (!cookie) return false;

    try {
        const consent = JSON.parse(decodeURIComponent(cookie)) as ConsentCookie;
        return consent.categories?.includes(category) ?? false;
    } catch {
        return false;
    }
}
