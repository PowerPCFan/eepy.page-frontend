import type { LayoutServerLoad } from "./$types";

type ConsentMode = "opt-in" | "opt-out";
const OPT_OUT_COUNTRIES = new Set(["US", "AU", "NZ", "SG", "JP"]);

function getConsentMode(headers: Headers): ConsentMode {
    const country = headers.get("cf-ipcountry") ?? headers.get("x-vercel-ip-country") ?? headers.get("cloudfront-viewer-country") ?? headers.get("x-country-code");
    const countryCode = country ? country.toUpperCase() : null;
    return countryCode && OPT_OUT_COUNTRIES.has(countryCode) ? "opt-out" : "opt-in";
}

export const load: LayoutServerLoad = ({ request }) => {
    return {
        consent: {
            mode: getConsentMode(request.headers),
        },
    };
};