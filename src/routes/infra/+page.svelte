<script lang="ts">
    import Holder from "$lib/components/Holder.svelte";

    interface InfraDomain {
        hostname: string;
        purpose: string;
    }

    interface Sections {
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

    const sections: Sections[] = [
        {
            title: "Web Applications",
            list: publicDomains,
        },
        {
            title: "Backend/APIs",
            list: apiDomains,
        },
        {
            title: "Authoritative Nameservers",
            list: dnsDomains,
        },
        {
            title: "Email Infrastructure",
            list: mailDomains,
        }
    ]
</script>

<svelte:head>
    <title>Infrastructure & Domains | eepy.page</title>
    <meta
        name="description"
        content="List of official eepy.page domains to distinguish genuine services from user-registered subdomains." />
    <link rel="canonical" href="https://www.eepy.page/infra" />
    <meta property="og:title" content="Infrastructure & Domains | eepy.page" />
    <meta
        property="og:description"
        content="List of official eepy.page domains to distinguish genuine services from user-registered subdomains." />
    <meta property="og:url" content="https://www.eepy.page/infra" />
    <meta property="og:type" content="website" />
</svelte:head>

<Holder>
    <div class="space-y-8 p-2 sm:p-4 text-foreground">
        <div class="space-y-3">
            <h1 class="text-2xl sm:text-3xl font-bold tracking-tight">Official Domains</h1>
            <p class="text-muted-foreground text-sm sm:text-base leading-relaxed">
                Because eepy.page allows users to register arbitrary subdomain, it is possible for abuse to occur.
                In the case that this happens, it's important to know which domains are part of our official infrastructure.
                This page lists all of our official domains to help you verify genuine eepy.page services and avoid phishing or impersonation.
                Unless a domain is explicitly existed below, you can assume that it is user-generated content that has zero connection to official eepy.page services.
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
