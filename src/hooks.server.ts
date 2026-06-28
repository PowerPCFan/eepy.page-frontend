import * as Sentry from "@sentry/sveltekit";
import { sequence } from "@sveltejs/kit/hooks";

Sentry.init({
    dsn: "https://0282a25a9d71818a00050d292b033a20@o4511644088139776.ingest.us.sentry.io/4511644093775872",
    enableLogs: true
});

export const handle = sequence(Sentry.sentryHandle());
export const handleError = Sentry.handleErrorWithSentry();
