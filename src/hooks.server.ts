import * as Sentry from "@sentry/sveltekit";
import { sequence } from "@sveltejs/kit/hooks";
import type { Handle } from "@sveltejs/kit";
import { rootI18n } from "$lib/i18n";
import { resolveLocaleFromEvent, runWithRequestI18n } from "$lib/server/i18n";

Sentry.init({
    dsn: "https://0282a25a9d71818a00050d292b033a20@o4511644088139776.ingest.us.sentry.io/4511644093775872",
    enableLogs: true
});

const i18nHandle: Handle = async ({ event, resolve }) => {
    const locale = resolveLocaleFromEvent(event);
    const requestI18n = rootI18n.cloneInstance({ lng: locale });
    event.locals.locale = locale;
    event.locals.i18n = requestI18n;

    return runWithRequestI18n(requestI18n, () => {
        return resolve(event, {
            transformPageChunk: ({ html }) => html.replace("%lang%", locale)
        });
    });
};

export const handle = sequence(Sentry.sentryHandle(), i18nHandle);
export const handleError = Sentry.handleErrorWithSentry();
