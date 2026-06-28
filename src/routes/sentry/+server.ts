import { json } from "@sveltejs/kit";

const SENTRY_HOST = "o4511644088139776.ingest.us.sentry.io";
const SENTRY_PROJECT_ID = "4511644093775872";

export async function POST({ request }) {
    console.log("Sending over sentry envelope");
    try {
        const envelopeBytes = await request.arrayBuffer();
        const envelope = new TextDecoder().decode(envelopeBytes);

        const piece = envelope.split("\n")[0]?.trim();

        let header: Record<string, any> = {};
        if (piece) {
            try {
                header = JSON.parse(piece);
            } catch (err) {
                console.warn("Could not parse Sentry envelope header, skipping DSN check:", piece);
            }
        }

        if (header.dsn) {
            const dsn = new URL(header.dsn);
            const project_id = dsn.pathname?.replace("/", "");

            if (dsn.hostname !== SENTRY_HOST) {
                throw new Error(`Invalid sentry hostname: ${dsn.hostname}`);
            }
            if (!project_id || !(SENTRY_PROJECT_ID === project_id)) {
                throw new Error(`Invalid sentry project id: ${project_id}`);
            }
        }

        await fetch(`https://${SENTRY_HOST}/api/${SENTRY_PROJECT_ID}/envelope/`, {
            method: "POST",
            body: envelopeBytes
        });
        return json({}, { status: 200 });
    } catch (e) {
        console.error("error tunneling to sentry", e);
        return json({ error: "error tunneling to sentry" }, { status: 500 });
    }
}
