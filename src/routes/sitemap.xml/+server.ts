import type { RequestHandler } from '@sveltejs/kit';
import * as sitemap from 'super-sitemap';

export const prerender = false;

type Priority = 0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1.0;
type ChangeFreq = 'always' | 'daily' | 'hourly' | 'monthly' | 'never' | 'weekly' | 'yearly';

const Priorities: Record<string, Priority> = {
    '/': 1.0,
    '/faq': 0.8,
    '/support': 0.7,
    '/report': 0.7,
    '/report/abuse-vuln': 0.7,
    '/infra': 0.6,
    '/login': 0.6,
    '/terms': 0.5,
    '/privacy': 0.5,
};

const ChangeFreqs: Record<string, ChangeFreq> = {
    '/': 'daily',
    '/faq': 'weekly',
    '/support': 'weekly',
    '/report': 'weekly',
    '/report/abuse-vuln': 'weekly',
    '/infra': 'monthly',
    '/login': 'monthly',
    '/terms': 'monthly',
    '/privacy': 'monthly',
};

const ExcludedRoutes: Array<string> = [
    '^/dashboard.*',
    '^/account.*',
    '^/api.*',
    '^/sentry.*',
    '^/redeem.*',
    '^/kofi-item-purchased.*',
    '^/support/info.*',
    '^/wrapped.*',
    '^/adblock-info.*',
]

export const GET: RequestHandler = (async () => {
    return await sitemap.response({
        origin: 'https://www.eepy.page',
        excludeRoutePatterns: ExcludedRoutes,
        defaultChangefreq: 'weekly',
        defaultPriority: 0.7,
        sort: 'alpha',
        processPaths: ((paths) => {
            return paths.map((pathObj) => ({
                ...pathObj,
                priority: Priorities[pathObj.path] ?? 0.7,
                changefreq: ChangeFreqs[pathObj.path] ?? 'weekly',
            }));
        }),
    });
});
