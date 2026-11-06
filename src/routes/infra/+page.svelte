<script lang="ts">
    import Holder from "$lib/components/Holder.svelte";
    import { t } from "$lib/i18n";

    interface InfraDomain {
        hostname: string;
        purpose: string;
    }

    interface Section {
        title: string;
        list: InfraDomain[];
    }

    const publicDomains: InfraDomain[] = [
        {
            hostname: "www.eepy.page",
            purpose: "Primary user-facing site",
        },
        {
            hostname: "eepy.page",
            purpose: "(Apex domain) Redirects to www.eepy.page, the main site",
        },
        {
            hostname: "canary.eepy.page",
            purpose: "Preview frontend, for using upcoming features before they are released to the main site. Not always available.",
        },
        {
            hostname: "development.eepy.page",
            purpose: "Development frontend. Not always available.",
        }
    ];

    const apiDomains: InfraDomain[] = [
        {
            hostname: "api.eepy.page",
            purpose: "Production API powering the main service (www.eepy.page)",
        },
        {
            hostname: "beta.eepy.page",
            purpose: "Preview API powering canary.eepy.page deployments",
        },
        {
            hostname: "alpha.eepy.page",
            purpose: "Testing API powering development.eepy.page deployments",
        }
    ];

    const dnsDomains: InfraDomain[] = [
        {
            hostname: "ns1.eepy.page",
            purpose: "Primary authoritative nameserver for eepy.page. Not a public resolver.",
        },
        {
            hostname: "ns2.eepy.page",
            purpose: "Secondary nameserver (currently points to the same server as ns1.eepy.page)",
        }
    ];

    const mailDomains: InfraDomain[] = [
        {
            hostname: "mail.eepy.page",
            purpose: "Official domain used for outbound mail (noreply@mail.eepy.page)",
        },
        {
            hostname: "eepy.page",
            purpose: "Inbound email addresses are on the root domain (e.g. support@eepy.page, report@eepy.page)"
        }
    ];

    const otherDomains: InfraDomain[] = [
        {
            hostname: "docs.eepy.page",
            purpose: "Documentation and guides for the frontend and the API",
        },
        {
            hostname: "weblate.eepy.page",
            purpose: "Weblate instance for managing and contributing to translations",
        }
    ];

    let sections: Section[] = $derived([
        {
            title: t("support.infra.sections.web"),
            list: publicDomains,
        },
        {
            title: t("support.infra.sections.api"),
            list: apiDomains,
        },
        {
            title: t("support.infra.sections.dns"),
            list: dnsDomains,
        },
        {
            title: t("support.infra.sections.mail"),
            list: mailDomains,
        },
        {
            title: t("support.infra.sections.other"),
            list: otherDomains,
        },
    ]);
</script>

<svelte:head>
    <title>{t("support.infra.title")} | eepy.page</title>
    <meta
        name="description"
        content="List of official eepy.page domains to distinguish genuine services from user-registered subdomains." />
    <link rel="canonical" href="https://www.eepy.page/infra" />
    <meta property="og:title" content="{t("support.infra.title")} | eepy.page" />
    <meta
        property="og:description"
        content="List of official eepy.page domains to distinguish genuine services from user-registered subdomains." />
    <meta property="og:url" content="https://www.eepy.page/infra" />
    <meta property="og:type" content="website" />
    <meta name="twitter:title" content="{t("support.infra.title")} | eepy.page" />
    <meta
        name="twitter:description"
        content="List of official eepy.page domains to distinguish genuine services from user-registered subdomains." />
    <meta name="twitter:url" content="https://www.eepy.page/infra" />
</svelte:head>

<Holder>
    <div class="space-y-8 p-2 sm:p-4 text-foreground">
        <div class="space-y-3">
            <h1 class="text-2xl sm:text-3xl font-bold tracking-tight">{t("support.infra.title")}</h1>
            <p class="text-muted-foreground text-sm sm:text-base leading-relaxed">
                {t("support.infra.description")}
            </p>
        </div>

        {#each sections as section}
            <div class="space-y-4">
                <h2 class="text-lg sm:text-xl font-semibold">{section.title}</h2>
                <div class="grid gap-3 sm:grid-cols-2">
                    {#each section.list as item}
                        <div class="rounded-lg border border-border/60 bg-background/50 p-4 space-y-2">
                            <div class="flex items-center justify-between gap-2">
                                <span class="font-mono text-sm font-semibold text-primary">{item.hostname}</span>
                            </div>
                            <p class="text-xs text-muted-foreground leading-relaxed">{item.purpose}</p>
                        </div>
                    {/each}
                </div>
            </div>
        {/each}
    </div>
</Holder>
