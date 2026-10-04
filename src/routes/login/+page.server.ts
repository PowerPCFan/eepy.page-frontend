import { dev } from "$app/environment";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = ({ url, cookies }) => {
    const authCookie = dev
        ? (cookies.get("auth-token") || cookies.get("__Host-auth-token"))
        : cookies.get("__Host-auth-token");
    const loggedIn = cookies.get("logged-in") && authCookie;

    if (loggedIn) {
        redirect(307, "/account/manage");
    }

    return {
        redirectURL: url.searchParams.get("r"),
        statusCode: url.searchParams.get("c"),
        referrerCode: url.searchParams.get("ref"),
        registerMode: url.searchParams.get("register") === "true",
    };
};
