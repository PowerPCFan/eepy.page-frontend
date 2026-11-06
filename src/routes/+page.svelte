<script lang="ts">
    import { goto } from "$app/navigation";
    import { domainAvailable } from "$lib";
    import { t } from "$lib/i18n";
    import GitHub from "$lib/assets/github.svg";
    import Gift from "$lib/assets/gift.svg";
    import Globe from "$lib/assets/click-globe.svg";
    import Dashboard from "$lib/assets/dash.svg";
    import Services from "$lib/assets/services.svg";
    import Split from "$lib/assets/split.svg";
    import Footer from "$lib/components/Footer.svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import Label from "$lib/components/ui/label/label.svelte";
    import Loader from "$lib/components/ui/loader/loader.svelte";
    import Separator from "$lib/components/ui/separator/separator.svelte";
    import { fade } from "svelte/transition";
    import MaterialSymbolsCheckCircleRounded from "~icons/material-symbols/check-circle-rounded";
    import MaterialSymbolsKeyboardArrowDownRounded from "~icons/material-symbols/keyboard-arrow-down-rounded";

    let placeholderMessages = ["project", "username", "cool-website", "important", "personal", "blog"];

    let testDomain: string = $state("");
    let placeholderInputFocused: boolean = $state(false);
    let testPlaceholder: string = $state(placeholderMessages[0]!);
    let placeholderIndex = 1;
    let timeoutId: ReturnType<typeof setTimeout>;
    let isTestAvailable: boolean = $state(false);
    let checkingDomainAvailability: boolean = $state(false);
    let latestCheckedDomain = $state("");

    let scrollY: number = $state(0);

    setInterval(() => {
        if (placeholderIndex > placeholderMessages.length - 1) {
            placeholderIndex = 0;
        }
        testPlaceholder = placeholderMessages[placeholderIndex]!;

        placeholderIndex++;
    }, 1500);

    function getDomainAvailability() {
        if (latestCheckedDomain === testDomain || !testDomain) return;
        checkingDomainAvailability = true;

        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(async () => {
            isTestAvailable = await domainAvailable(testDomain + ".eepy.page");
            checkingDomainAvailability = false;
            latestCheckedDomain = testDomain;
        }, 600);
    }
</script>

<svelte:head>
    <title>Free Subdomains, Made Simple | eepy.page</title>
    <meta
        name="description"
        content="A modern, completely free subdomain service for your projects. Register custom subdomains for your projects in seconds with independent DNS management and fast, reliable DNS." />
    <link rel="canonical" href="https://www.eepy.page/" />
    <meta property="og:title" content="eepy.page: Free Subdomains, Made Simple" />
    <meta
        property="og:description"
        content="A modern, completely free subdomain service for your projects. Register custom subdomains for your projects in seconds with independent DNS management and fast, reliable DNS." />
    <meta property="og:url" content="https://www.eepy.page/" />
    <meta property="og:type" content="website" />
    <meta name="twitter:title" content="eepy.page: Free Subdomains, Made Simple" />
    <meta
        name="twitter:description"
        content="A modern, completely free subdomain service for your projects. Register custom subdomains for your projects in seconds with independent DNS management and fast, reliable DNS." />
    <meta name="twitter:url" content="https://www.eepy.page/" />
</svelte:head>

<svelte:window bind:scrollY={scrollY} />

<div class="content pb-44">
    <section class="introduction mx-auto flex w-full max-w-5xl flex-col items-center justify-center px-6 py-16 pt-6 text-center sm:px-10">
        <div class="mb-2 inline-flex items-center gap-3 px-5 py-2.5">
            <img class="h-8 w-8 sm:h-9 sm:w-9" alt="" aria-hidden="true" src="/favicon.svg" />
            <span class="text-3xl font-bold tracking-tight sm:text-5xl">eepy.page</span>
        </div>

        <h1 class="hero-title text-4xl font-bold sm:text-5xl md:text-6xl lg:text-7xl">
            <div class="text-foreground">{t("common.landing.hero.freeSubdomains")}</div>
            <div class="text-primary">{t("common.landing.hero.madeSimple")}</div>
        </h1>

        <p class="about-us mt-6 max-w-2xl text-lg leading-relaxed font-medium text-foreground/85 sm:text-xl md:text-2xl">
            {t("common.landing.hero.tagline")}
        </p>

        <div class="actions mt-9 flex w-full max-w-md flex-col items-center justify-center gap-3.5 sm:max-w-none sm:flex-row sm:gap-4">
            <Button size="lg" onclick={_ => goto("/login?register=true")} class="h-12 w-full px-8 text-base font-semibold sm:w-auto">
                {t("common.landing.hero.signUp")}
            </Button>
            <Button size="lg" variant={"secondary"} onclick={_ => goto("/dashboard")} class="h-12 w-full px-8 text-base font-semibold sm:w-auto">
                {t("common.landing.hero.dashboard")}
            </Button>
        </div>

        <div class="details mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            <div class="item flex items-center gap-2">
                <div class="rounded-full bg-[radial-gradient(circle,#ffffff_50%,transparent_50%)]">
                    <MaterialSymbolsCheckCircleRounded class="h-5 w-5 shrink-0 text-primary" />
                </div>
                <Label class="text-base font-medium">{t("common.landing.features.free")}</Label>
            </div>
            <div class="item flex items-center gap-2">
                <div class="rounded-full bg-[radial-gradient(circle,#ffffff_50%,transparent_50%)]">
                    <MaterialSymbolsCheckCircleRounded class="h-5 w-5 shrink-0 text-primary" />
                </div>
                <Label class="text-base font-medium">{t("common.landing.features.modernUi")}</Label>
            </div>
            <div class="item flex items-center gap-2">
                <div class="rounded-full bg-[radial-gradient(circle,#ffffff_50%,transparent_50%)]">
                    <MaterialSymbolsCheckCircleRounded class="h-5 w-5 shrink-0 text-primary" />
                </div>
                <Label class="text-base font-medium">{t("common.landing.features.userFriendly")}</Label>
            </div>
        </div>
    </section>

    <div class="selling-points mt-8 px-6 sm:px-16 lg:px-32">
        <div class="flex items-center gap-8">
            <div class="visual w-2/5">
                <img class="w-3/5 max-w-[280px]" alt="Icon depicting a user's mouse clicking on a globe, symbolizing a website" src={Globe} />
            </div>
            <div class="text bg-card/80 backdrop-blur-md border border-border/70 shadow-sm w-3/5 rounded-2xl p-6 sm:p-8">
                <h2 class="mb-2 text-3xl sm:text-4xl font-semibold tracking-tight">{t("common.landing.claim.title")}</h2>
                <p class="text-base sm:text-lg text-muted-foreground">{t("common.landing.claim.desc")} <b>{t("common.landing.claim.descHighlight")}</b></p>

                <div class="domain-tester flex items-center pt-4 pb-2">
                    <div class="domain-input relative flex-1 max-w-md">
                        <Input
                            onkeyup={_ => getDomainAvailability()}
                            onfocus={_ => (placeholderInputFocused = true)}
                            onfocusout={_ => (placeholderInputFocused = false)}
                            bind:value={testDomain}
                            type="text"
                            placeholder={placeholderInputFocused ? "" : testPlaceholder}
                            class="w-full h-10 rounded-r-none border-r-0 text-base" />
                    </div>
                    <span class="domain-suffix inline-flex items-center h-10 px-3 rounded-r-md border border-input bg-muted/50 text-sm font-medium text-muted-foreground">.eepy.page</span>
                </div>

                {#if checkingDomainAvailability}
                    <div class="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader className="w-5 h-5" asForeground={true} />
                        <span>{t("common.landing.claim.checking")}</span>
                    </div>
                {:else if testDomain && latestCheckedDomain === testDomain}
                    <div class="domain-results mt-4">
                        {#if isTestAvailable}
                            <h3 class="text-xl font-semibold text-foreground">
                                The domain <span class="text-primary font-bold">{testDomain}.eepy.page</span> is available!
                            </h3>
                            <Button size="lg" class="mt-3 w-full" onclick={_ => goto("/login?register=true")}>{t("common.landing.claim.claimBtn")}</Button>
                        {:else}
                            <h3 class="text-lg font-medium text-foreground">
                                Unfortunately, <span class="font-bold">{testDomain}.eepy.page</span> is already taken or invalid.
                            </h3>
                            <p class="text-sm text-muted-foreground mt-1">{t("common.landing.claim.tryAnother")}</p>
                        {/if}
                    </div>
                {/if}
            </div>
        </div>
    </div>

    <div class="selling-points mt-20 sm:mt-32 px-6 sm:px-16 lg:px-32">
        <div class="flex items-center gap-8">
            <div class="text w-3/5 bg-card/60 backdrop-blur-xs border border-border/50 rounded-2xl p-6 sm:p-8 shadow-xs">
                <h2 class="w-fit text-3xl sm:text-4xl font-semibold tracking-tight">{t("common.landing.alwaysFree.title")}</h2>
                <p class="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
                    {t("common.landing.alwaysFree.paragraph1")}<br><br>
                    {t("common.landing.alwaysFree.paragraph2")}
                </p>
            </div>
            <div class="visual flex w-2/5 items-center justify-end">
                <img class="w-3/5 max-w-[280px]" alt="Icon representing two people exchanging something" src={Gift} />
            </div>
        </div>
    </div>

    <div class="selling-points mt-20 sm:mt-32 px-6 sm:px-16 lg:px-32">
        <div class="flex items-center gap-8">
            <div class="visual flex w-2/5 items-center justify-start">
                <img class="w-3/5 max-w-[280px]" alt="Icon representing multiple services, in a tree-like format" src={Services} />
            </div>
            <div class="text w-3/5 bg-card/60 backdrop-blur-xs border border-border/50 rounded-2xl p-6 sm:p-8 shadow-xs">
                <h2 class="w-fit text-3xl sm:text-4xl font-semibold tracking-tight">{t("common.landing.servicesSupport.title")}</h2>
                <p class="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
                    {t("common.landing.servicesSupport.lead")}
                </p>
                <ul class="mt-1 list-disc space-y-1 pl-6 text-base sm:text-lg text-muted-foreground">
                    <li>{t("common.landing.servicesSupport.ghPages")}</li>
                    <li>{t("common.landing.servicesSupport.codeberg")}</li>
                    <li>{t("common.landing.servicesSupport.neocities")}</li>
                    <li>{t("common.landing.servicesSupport.nekoweb")}</li>
                    <li>
                        {t("common.landing.servicesSupport.andMore")}
                    </li>
                </ul>
                <p class="mt-4 text-base sm:text-lg text-muted-foreground">
                    {t("common.landing.servicesSupport.socialsLead")}
                </p>
                <ul class="mt-1 list-disc space-y-1 pl-6 text-base sm:text-lg text-muted-foreground">
                    <li>{t("common.landing.servicesSupport.discord")}</li>
                    <li>{t("common.landing.servicesSupport.bluesky")}</li>
                    <li>{t("common.landing.servicesSupport.twitter")}</li>
                </ul>
            </div>
        </div>
    </div>

    <div class="selling-points mt-20 sm:mt-32 px-6 sm:px-16 lg:px-32">
        <div class="flex items-center gap-8">
            <div class="text w-3/5 bg-card/60 backdrop-blur-xs border border-border/50 rounded-2xl p-6 sm:p-8 shadow-xs">
                <h2 class="w-fit text-3xl sm:text-4xl font-semibold tracking-tight">{t("common.landing.management.title")}</h2>
                <p class="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
                    {t("common.landing.management.paragraph1")}<br><br>
                    {t("common.landing.management.paragraph2")}<br><br>
                    {t("common.landing.management.paragraph3")}
                </p>
            </div>
            <div class="visual flex w-2/5 items-center justify-end">
                <img class="w-3/5 max-w-[280px]" alt="Icon representing a configurable dashboard" src={Dashboard} />
            </div>
        </div>
    </div>

    <div class="selling-points mt-20 sm:mt-32 px-6 sm:px-16 lg:px-32">
        <div class="flex items-center gap-8">
            <div class="visual flex w-2/5 items-center justify-start">
                <img class="w-3/5 max-w-[280px]" alt="Icon representing eepy.page tunneling" src={Split} />
            </div>
            <div class="text w-3/5 bg-card/60 backdrop-blur-xs border border-border/50 rounded-2xl p-6 sm:p-8 shadow-xs">
                <h2 class="w-fit text-3xl sm:text-4xl font-semibold tracking-tight">{t("common.landing.tunneling.title")}</h2>
                <p class="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
                    {t("common.landing.tunneling.paragraph1")}
                    <br><br>
                    {t("common.landing.tunneling.paragraph2")}
                </p>
            </div>
        </div>
    </div>

    <div class="selling-points mt-20 sm:mt-32 px-6 sm:px-16 lg:px-32">
        <div class="flex items-center gap-8">
            <div class="text w-3/5 bg-card/60 backdrop-blur-xs border border-border/50 rounded-2xl p-6 sm:p-8 shadow-xs">
                <h2 class="w-fit text-3xl sm:text-4xl font-semibold tracking-tight">{t("common.landing.openSource.title")}</h2>
                <p class="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
                    {t("common.landing.openSource.paragraph1")}<br><br>
                    {t("common.landing.openSource.paragraph2")}
                </p>

                <Separator class="mt-6 mb-6 opacity-60" />
                <div class="flex flex-col gap-2.5">
                    <p class="text-sm font-medium text-foreground">{t("common.landing.openSource.reposLead")}</p>
                    <a class="text-primary hover:underline font-medium text-sm" href="https://github.com/PowerPCFan/eepy.page-frontend">
                        {t("common.landing.openSource.frontendRepo")}
                    </a>
                    <a class="text-primary hover:underline font-medium text-sm" href="https://github.com/PowerPCFan/eepy.page-backend">
                        {t("common.landing.openSource.backendRepo")}
                    </a>
                </div>
            </div>
            <div class="visual flex w-2/5 items-center justify-end">
                <img class="w-3/5 max-w-[280px]" alt="GitHub's logo" src={GitHub} />
            </div>
        </div>
    </div>
</div>

<Footer />

{#if scrollY < 50}
    <div transition:fade={{ duration: 150 }} class="pointer-events-none">
        <MaterialSymbolsKeyboardArrowDownRounded class="absolute bottom-6 left-1/2 -translate-x-1/2 text-2xl opacity-50 animate-bounce-gentle" />
    </div>
{/if}

<style>
    .content {
        background-color: var(--color-background);
        background: radial-gradient(circle at -25% -25%, var(--gradient-start) 0%, var(--gradient-end) 85%);
    }

    .introduction {
        min-height: calc(100svh - var(--vpOffset, 0px) - 3.5rem);
    }

    .hero-title {
        line-height: 1.04;
        letter-spacing: -0.025em;
    }

    @media (max-width: 900px), (orientation: portrait) {
        .visual {
            display: none;
        }

        .text {
            width: 90%;
            margin-left: auto;
            margin-right: auto;
        }

        h2 {
            font-size: 2.75em;
        }
    }

    @media (max-width: 900px) {
        .selling-points {
            padding-inline: 1rem !important;
        }
    }

    @media (max-width: 600px) {
        .introduction {
            min-height: calc(100svh - var(--vpOffset, 0px) - 3.5rem);
            padding-top: 3.5rem;
            padding-bottom: 4.5rem;
        }

        .domain-tester {
            align-items: stretch;
            flex-direction: column;
            gap: 0.5rem;
        }

        .domain-input,
        .domain-input :global(input) {
            width: 100%;
        }

        .domain-suffix {
            margin-left: 0;
        }

        .selling-points {
            margin-top: 5rem;
        }

        .selling-points > div {
            flex-direction: column;
        }

        .text {
            width: calc(100% - 2rem);
        }

        .text h2 {
            font-size: 2rem;
            line-height: 1.12;
        }
    }
</style>
