import { dev } from "$app/environment";
import { activeTheme } from "$lib/store";
import consola from "consola";
import Cookies from "js-cookie";

export function cyrb53(str: string, seed = 0) {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1  = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2  = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

export function redirectToLogin(
    code: number = 0,
    timeoutSeconds: number = 0,
    no_reroute: boolean = false
): void {
    setTimeout(() => {
        consola.info(`Redirecting to login with code ${code}`);

        Cookies.remove("logged-in");
        Cookies.remove("__Host-auth-token", {
            secure: !dev,
            path: "/",
            sameSite: "Strict"
        });

        if (code === 461) {
            window.location.href = `/account/warn?reason=permission`;
        } else if (code === 462) {
            window.location.href = `/account/warn?reason=feature`;
        } else {
            window.location.href = `/login?r=${no_reroute ? "/" : window.location.pathname}&c=${code}`;
        }
    }, timeoutSeconds * 1000);
}

export function createFile(filename: string, content: string): boolean {
    consola.info("Creating a downloadable file");

    let a: HTMLElement = document.createElement("a");
    a.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(content));
    a.setAttribute("download", filename);
    a.click();
    return true;
}

export function getAuthToken() {
    consola.debug("Getting auth token");
    return Cookies.get("__Host-auth-token");
}

export function setAuthToken(token: string) {
    const tokenExpirationMin = 10;
    const expires = new Date(new Date().getTime() + tokenExpirationMin * 60000);

    consola.debug(`Creating a new token that expires on ${expires}`);

    Cookies.set("__Host-auth-token", token, {
        secure: !dev,
        expires: expires,
        sameSite: "Strict",
        path: "/"
    });
}

const utcDateTimeFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
});

const localDateTimeFormatter = new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short"
});

export function formatUTCDateTime(date: Date | number | string): string {
    const parsedDate = date instanceof Date ? date : new Date(date);
    return `${utcDateTimeFormatter.format(parsedDate)} UTC`;
}

export function formatLocalDateTime(date: Date | number | string): string {
    const parsedDate = date instanceof Date ? date : new Date(date);
    return localDateTimeFormatter.format(parsedDate);
}

export function changeTheme(theme: string) {
    if (theme === "light") {
        document.body.classList.remove("dark");
    } else if (theme === "dark") {
        document.body.classList.add("dark");
    } else if (theme === "auto") {
        if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
            document.body.classList.add("dark");
        } else {
            document.body.classList.add("light");
        }
    }

    activeTheme.set(theme);
    window.location.reload();
}
