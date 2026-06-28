import type { Reroute } from "@sveltejs/kit";

export const reroute: Reroute = request => {
    return request.url.pathname;
};
