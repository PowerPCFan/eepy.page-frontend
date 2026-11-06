<script lang="ts">
    import { afterNavigate } from "$app/navigation";
    import { browser, dev } from "$app/environment";
    import { CONSENT_CATEGORIES, CONSENT_COOKIE_NAME, hasConsentCategory } from "$lib/consent";
    import { t, getLocale } from "$lib/i18n";
    import { injectSpeedInsights } from "@vercel/speed-insights/sveltekit";
    import { onMount } from "svelte";
    import * as CookieConsent from "vanilla-cookieconsent";
    import "vanilla-cookieconsent/dist/cookieconsent.css";
    import MaterialSymbolsCookie from "~icons/material-symbols/cookie";

    type ConsentMode = "opt-in" | "opt-out";

    let { consentMode = "opt-in" }: { consentMode?: ConsentMode } = $props();

    const googleAnalyticsId = "G-69P19PMX2R";
    let googleAnalyticsLoaded = false;
    let speedInsightsLoaded = false;

    function currentPagePath(): string {
        return `${window.location.pathname}${window.location.search}`;
    }

    function loadGoogleAnalytics() {
        if (!browser || googleAnalyticsLoaded) return;

        window.dataLayer = window.dataLayer || [];
        window.gtag = function gtag(...args: unknown[]) {
            window.dataLayer?.push(args);
        };

        window.gtag("consent", "default", {
            ad_storage: "denied",
            analytics_storage: "granted",
        });
        window.gtag("js", new Date());
        window.gtag("config", googleAnalyticsId, {
            page_title: document.title,
            page_path: currentPagePath(),
        });

        const script = document.createElement("script");
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`;
        document.head.appendChild(script);

        googleAnalyticsLoaded = true;
    }

    function disableGoogleAnalytics() {
        if (!browser) return;

        window[`ga-disable-${googleAnalyticsId}`] = true;
        window.gtag?.("consent", "update", {
            ad_storage: "denied",
            analytics_storage: "denied",
        });
    }

    function loadSpeedInsights() {
        if (!browser || speedInsightsLoaded) return;

        injectSpeedInsights();
        speedInsightsLoaded = true;
    }

    function enableAnalyticsServices() {
        loadGoogleAnalytics();
        loadSpeedInsights();
    }

    function disableAnalyticsServices() {
        disableGoogleAnalytics();
    }

    function trackPageView() {
        if (!browser || !hasConsentCategory(CONSENT_CATEGORIES.analytics)) return;

        loadGoogleAnalytics();
        window.gtag?.("config", googleAnalyticsId, {
            page_title: document.title,
            page_path: currentPagePath(),
        });
    }

    function openCookiePreferences() {
        CookieConsent.showPreferences();
    }

    onMount(() => {
        CookieConsent.run({
            mode: consentMode,
            revision: 4,
            autoClearCookies: true,
            cookie: {
                name: CONSENT_COOKIE_NAME,
                sameSite: "Lax",
                secure: !dev,
                expiresAfterDays: 182,
            },
            guiOptions: {
                consentModal: {
                    layout: "box wide",
                    position: "middle center",
                    equalWeightButtons: false,
                    flipButtons: false,
                },
                preferencesModal: {
                    layout: "box",
                    equalWeightButtons: true,
                },
            },
            categories: {
                necessary: {
                    enabled: true,
                    readOnly: true,
                },
                analytics: {
                    autoClear: {
                        cookies: [{ name: /^_ga/ }, { name: "_gid" }, { name: /^_gat/ }],
                    },
                    services: {
                        googleAnalytics: {
                            label: "Google Analytics",
                            onAccept: enableAnalyticsServices,
                            onReject: disableAnalyticsServices,
                            cookies: [{ name: /^_ga/ }, { name: "_gid" }, { name: /^_gat/ }],
                        },
                        vercelSpeedInsights: {
                            label: "Vercel Speed Insights",
                            onAccept: loadSpeedInsights,
                        },
                    },
                },
            },
            language: {
                default: "en",
                translations: {
                    en: {
                        consentModal: {
                            title: t("common.cookieConsent.modal.title"),
                            description: t("common.cookieConsent.modal.description"),
                            acceptAllBtn: t("common.cookieConsent.modal.acceptAllBtn"),
                            acceptNecessaryBtn: t("common.cookieConsent.modal.acceptNecessaryBtn"),
                            showPreferencesBtn: t("common.cookieConsent.modal.showPreferencesBtn"),
                            footer: '<a href="/privacy">Privacy Policy</a>',
                        },
                        preferencesModal: {
                            title: t("common.cookieConsent.preferences.title"),
                            acceptAllBtn: t("common.cookieConsent.preferences.acceptAllBtn"),
                            acceptNecessaryBtn: t("common.cookieConsent.preferences.acceptNecessaryBtn"),
                            savePreferencesBtn: t("common.cookieConsent.preferences.savePreferencesBtn"),
                            closeIconLabel: t("common.cookieConsent.preferences.closeIconLabel"),
                            serviceCounterLabel: t("common.cookieConsent.preferences.serviceCounterLabel"),
                            sections: [
                                {
                                    title: t("common.cookieConsent.preferences.necessaryTitle"),
                                    description: t("common.cookieConsent.preferences.necessaryDesc"),
                                    linkedCategory: "necessary",
                                    cookieTable: {
                                        headers: {
                                            name: t("common.cookieConsent.preferences.headers.name"),
                                            domain: t("common.cookieConsent.preferences.headers.domain"),
                                            description: t("common.cookieConsent.preferences.headers.description"),
                                        },
                                        body: [
                                            {
                                                name: t("common.cookieConsent.preferences.cookies.eepyName"),
                                                domain: "eepy.page",
                                                description: t("common.cookieConsent.preferences.cookies.eepyDesc"),
                                            },
                                            {
                                                name: t("common.cookieConsent.preferences.cookies.sentryName"),
                                                domain: "sentry.io",
                                                description: t("common.cookieConsent.preferences.cookies.sentryDesc"),
                                            },
                                        ],
                                    },
                                },
                                {
                                    title: t("common.cookieConsent.preferences.analyticsTitle"),
                                    description: t("common.cookieConsent.preferences.analyticsDesc"),
                                    linkedCategory: "analytics",
                                    cookieTable: {
                                        headers: {
                                            name: t("common.cookieConsent.preferences.headers.name"),
                                            domain: t("common.cookieConsent.preferences.headers.domain"),
                                            description: t("common.cookieConsent.preferences.headers.description"),
                                        },
                                        body: [
                                            {
                                                name: t("common.cookieConsent.preferences.cookies.gaName"),
                                                domain: "Google Analytics",
                                                description: t("common.cookieConsent.preferences.cookies.gaDesc"),
                                            },
                                            {
                                                name: t("common.cookieConsent.preferences.cookies.speedInsightsName"),
                                                domain: "Vercel",
                                                description: t("common.cookieConsent.preferences.cookies.speedInsightsDesc"),
                                            },
                                        ],
                                    },
                                },
                                {
                                    title: t("common.cookieConsent.preferences.settingsTitle"),
                                    description: t("common.cookieConsent.preferences.settingsDesc"),
                                },
                            ],
                        },
                    },
                },
            },
        });

        if (hasConsentCategory(CONSENT_CATEGORIES.analytics)) {
            enableAnalyticsServices();
        }
    });

    afterNavigate(trackPageView);
</script>

<button
    aria-label={t("common.cookieConsent.buttonLabel")}
    class="cookie-settings sentry-unmask"
    title={t("common.cookieConsent.buttonTitle")}
    type="button"
    onclick={openCookiePreferences}>
    <MaterialSymbolsCookie aria-hidden="true" />
</button>

<style>
    .cookie-settings {
        position: fixed;
        left: 1rem;
        bottom: 1rem;
        z-index: 40;
        border: 1px solid color-mix(in oklab, var(--border), var(--foreground) 24%);
        border-radius: 999px;
        background: var(--card);
        color: var(--card-foreground);
        display: grid;
        place-items: center;
        width: 2.5rem;
        height: 2.5rem;
        padding: 0;
        line-height: 1;
        box-shadow: 0 12px 32px rgb(0 0 0 / 18%);
    }

    .cookie-settings:hover {
        background: var(--secondary);
        color: var(--secondary-foreground);
    }

    .cookie-settings :global(svg) {
        width: 1.3rem;
        height: 1.3rem;
    }

    :global(#cc-main) {
        --cc-font-family: "Inter", sans-serif;
        --cc-bg: var(--card);
        --cc-footer-bg: var(--card);
        --cc-footer-border-color: var(--border);
        --cc-primary-color: var(--card-foreground);
        --cc-secondary-color: var(--muted-foreground);
        --cc-btn-primary-bg: var(--primary);
        --cc-btn-primary-color: var(--primary-foreground);
        --cc-btn-primary-hover-bg: color-mix(in oklab, var(--primary), black 16%);
        --cc-btn-primary-hover-color: var(--primary-foreground);
        --cc-btn-secondary-bg: var(--secondary);
        --cc-btn-secondary-color: var(--secondary-foreground);
        --cc-btn-secondary-hover-bg: color-mix(in oklab, var(--secondary), black 10%);
        --cc-btn-secondary-hover-color: var(--secondary-foreground);
        --cc-toggle-on-bg: var(--primary);
        --cc-toggle-off-bg: color-mix(in oklab, var(--foreground), var(--background) 58%);
        --cc-toggle-on-knob-bg: var(--primary-foreground);
        --cc-toggle-off-knob-bg: var(--background);
        --cc-toggle-readonly-bg: color-mix(in oklab, var(--foreground), var(--background) 46%);
        --cc-toggle-readonly-knob-bg: var(--background);
        --cc-toggle-readonly-knob-icon-color: var(--foreground);
        --cc-separator-border-color: var(--border);
        --cc-cookie-category-block-bg: var(--background);
        --cc-cookie-category-block-hover-bg: var(--accent);
        --cc-cookie-category-expanded-block-bg: var(--background);
        --cc-overlay-bg: rgb(0 0 0 / 55%);
        --cc-webkit-scrollbar-bg: var(--background);
        --cc-webkit-scrollbar-hover-bg: var(--muted);
    }

    :global(#cc-main .cm),
    :global(#cc-main .pm) {
        border: 1px solid color-mix(in oklab, var(--border), var(--foreground) 20%);
        border-radius: 0.75rem;
        box-shadow: 0 24px 70px rgb(0 0 0 / 28%);
    }

    :global(#cc-main .cm__btn),
    :global(#cc-main .pm__btn) {
        border-radius: 0.55rem;
        font-weight: 600;
    }

    :global(#cc-main .cm__footer a) {
        color: var(--primary);
    }

    :global(#cc-main .cm__footer a:hover) {
        color: color-mix(in oklab, var(--primary), var(--foreground) 20%);
    }

    :global(#cc-main .pm__section--expandable .pm__section-arrow) {
        background: color-mix(in oklab, var(--foreground), var(--background) 50%);
        box-shadow:
            0 0 0 1px color-mix(in oklab, var(--foreground), var(--background) 26%),
            0 1px 2px rgb(0 0 0 / 18%);
    }

    :global(#cc-main .pm__section--expandable .pm__section-arrow svg) {
        stroke: var(--background);
        stroke-width: 3px;
    }

    :global(#cc-main .section__toggle:not(:checked) ~ .toggle__icon) {
        box-shadow:
            0 0 0 1px color-mix(in oklab, var(--foreground), var(--background) 24%),
            inset 0 0 0 1px rgb(255 255 255 / 12%);
    }

    :global(#cc-main .section__toggle:not(:checked) ~ .toggle__icon .toggle__icon-circle) {
        box-shadow:
            0 1px 2px rgb(0 0 0 / 35%),
            0 0 0 1px color-mix(in oklab, var(--foreground), var(--background) 34%);
    }

    :global(#cc-main .section__toggle:not(:checked) ~ .toggle__icon .toggle__icon-off svg) {
        stroke: color-mix(in oklab, var(--foreground), var(--background) 20%);
        stroke-width: 3px;
    }

    @media (max-width: 640px) {
        :global(#cc-main .cm__btns),
        :global(#cc-main .cm__btn-group) {
            align-items: stretch;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            width: 100%;
        }

        :global(#cc-main .cm__btn-group:first-child) {
            margin-right: 0;
        }
    }
</style>
