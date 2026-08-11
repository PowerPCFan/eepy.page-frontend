export function shouldRedirectToLogin(authToken: string | null, pathname: string = "") {
    return !authToken && pathname !== "/account";
}

export function isAuthFailureStatus(statusCode: number | string | null) {
    return [401, 403, 460].includes(Number(statusCode));
}
