<script lang="ts">
    import { goto } from "$app/navigation";
    import { domainAvailable } from "$lib";
    import { t } from "$lib/i18n";
    import Globe from "$lib/assets/click-globe.svg";
    import Gift from "$lib/assets/gift.svg";
    import Services from "$lib/assets/services.svg";
    import Dashboard from "$lib/assets/dash.svg";
    import Split from "$lib/assets/split.svg";
    import Footer from "$lib/components/Footer.svelte";
    import MacOSWindow from "$lib/components/MacOSWindow.svelte";
    import ArrowRightIcon from "@lucide/svelte/icons/arrow-right";
    import Button from "$lib/components/ui/button/button.svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import Label from "$lib/components/ui/label/label.svelte";
    import Loader from "$lib/components/ui/loader/loader.svelte";
    import Separator from "$lib/components/ui/separator/separator.svelte";
    import { fade } from "svelte/transition";
    import MaterialSymbolsCheckCircleRounded from "~icons/material-symbols/check-circle-rounded";
    import MaterialSymbolsKeyboardArrowDownRounded from "~icons/material-symbols/keyboard-arrow-down-rounded";
    import MaterialSymbolsAccountCircle from "~icons/material-symbols/account-circle";
    import Checkmark from "~icons/material-symbols/check";
    import DiscordLogo from "~icons/simple-icons/discord";
    import GitHubLogo from "~icons/simple-icons/github";
    import BlueskyLogo from "~icons/simple-icons/bluesky";
    import XLogo from "~icons/simple-icons/x";
    import CodebergLogo from "~icons/simple-icons/codeberg";
    import NekowebLogo from "$lib/assets/nekoweb.png";
    import NeocitiesLogo from "$lib/assets/neocities.svg";
    import Nice from "$lib/assets/nice.png";
    import Shrug from "$lib/assets/shrug.png";
    import Bucktooth from "$lib/assets/bucktooth.png";
    import type { Component } from "svelte";
    import { cn } from "$lib/utils";
    import Code from "~icons/material-symbols/code";
    import ErrorOutline from "~icons/material-symbols/error-outline";
    import SettingsBackupRestore from "~icons/material-symbols/settings-backup-restore";
    import PlayCircle from "~icons/material-symbols/play-circle-outline";
    import Star from "~icons/material-symbols/star";
    import MaterialSymbolsBalance from "~icons/material-symbols/balance";
    import MaterialSymbolsVisibility from "~icons/material-symbols/visibility-outline";
    import MaterialSymbolsFile from "~icons/material-symbols/description-outline";
    import MaterialSymbolsFolder from "~icons/material-symbols/folder";

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

{#snippet serviceLogo(component: Component | string, name: string, className: string = "text-white")}
    <div class="flex flex-col gap-1 text-muted-foreground items-center w-12 h-auto">
        {#if typeof component === "string"}
            <img src={component} alt={name} class={cn("w-12 h-12", className)} />
        {:else}
            <!-- svelte-ignore svelte_component_deprecated -->
            <svelte:component this={component} class={cn("w-12 h-12", className)} />
        {/if}
        <span class="text-xs text-center text-foreground">{@html name}</span>
    </div>
{/snippet}

{#snippet mockDashboard(rows: Array<{ type: string; domain: string; target: string; }>) }
    <div class="p-4 space-y-1.5 font-mono text-xs">
        <div class="grid grid-cols-12 text-[10px] uppercase text-muted-foreground px-2 pb-1 border-b border-border/40 font-sans font-semibold">
            <span class="col-span-2">Type</span>
            <span class="col-span-5">Domain</span>
            <span class="col-span-3">Target</span>
            <span class="col-span-2 text-right">Actions</span>
        </div>
        {#each rows as row}
            <div class="grid grid-cols-12 items-center px-2 py-1.5 rounded-md bg-muted/30 text-[11px]">
                <span class="col-span-2 font-bold uppercase tracking-wide">{row.type}</span>
                <span class="col-span-5 text-foreground"><span class="font-semibold">{row.domain}</span>.eepy.page</span>
                <span class="col-span-3 text-muted-foreground truncate">{row.target}</span>
                <span class="col-span-2 ml-3 py-1 text-center rounded-sm border border-border text-muted-foreground">Edit</span>
            </div>
        {/each}
    </div>
{/snippet}

{#snippet mockGithub()}
    <div class="w-full mx-auto border border-border overflow-hidden bg-muted/30 text-xs">
        <div class="bg-muted/30 border-b border-border">
            <div class="px-4 py-2 flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <GitHubLogo />
                    <span>PowerPCFan</span>
                    <span class="text-foreground/50">/</span>
                    <span class="font-bold">eepy.page-backend</span>
                    <span class="text-[0.4rem] mt-0.5">&#9660;</span>
                </div>
                <div class="w-32 h-6 flex flex-row justify-center items-center text-[10px] rounded-[0.4rem] border border-border"><span>Type [/] to search</span></div>
            </div>
            <div>
                <div class="w-full border-b border-[#21262d] px-2">
                    <div class="flex items-center space-x-1 text-muted-foreground">
                        <div class="flex items-center space-x-1 px-3 py-1.5 font-semibold text-foreground border-b-[1.5px] border-amber-600">
                            <Code class="w-4 h-4 opacity-80" />
                            <span>Code</span>
                        </div>
                        <div class="flex items-center space-x-1 px-3 py-1.5">
                            <ErrorOutline class="w-4 h-4 opacity-60" />
                            <span>Issues</span>
                        </div>
                        <div class="flex items-center space-x-1 px-3 py-1.5">
                            <SettingsBackupRestore class="w-4 h-4 opacity-60" />
                            <span>Pull requests</span>
                        </div>
                        <div class="flex items-center space-x-1 px-3 py-1.5">
                            <PlayCircle class="w-4 h-4 opacity-60" />
                            <span>Actions</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="px-4 py-3 bg-background border-b border-border flex items-center justify-between">
            <div class="flex items-center space-x-1 text-sm">
                <MaterialSymbolsAccountCircle />
                <p>PowerPCFan</p>
                <span class="text-gray-400 dark:text-gray-600">/</span>
                <p class="font-bold">eepy.page-backend</p>
                <span class="ml-2 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground/75 border border-border rounded-full">Public</span>
            </div>
            <div class="flex space-x-1.5">
                <div class="px-2 py-1 bg-muted/35 border border-border rounded font-medium flex items-center space-x-1">
                    <Star class="text-amber-400" />
                    <span>Srar!</span>
                    <span class="px-1 rounded-sm text-[10px]">683,416</span>
                </div>
            </div>
        </div>

        <div class="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="md:col-span-3 space-y-3">
                <div class="bg-muted/50 border border-border rounded-t-md p-2.5 mb-0 flex items-center justify-between text-muted-foreground tracking-snug">
                    <div class="flex items-center space-x-1.5">
                        <MaterialSymbolsAccountCircle />
                        <span class="font-semibold text-foreground hover:underline cursor-pointer">PowerPCFan</span>
                        <span class="text-[11px]">feat(auth): improve security</span>
                    </div>
                    <span class="text-[11px] text-muted-foreground/65 whitespace-nowrap ml-2">aaf4c61 &bull; 2h ago</span>
                </div>

                <div class="border-x border-b border-border rounded-b-md overflow-hidden bg-white dark:bg-[#0d1117]">
                    <div class="flex items-center p-2.5 border-b">
                        <div class="flex items-center space-x-2.5 w-40">
                            <MaterialSymbolsFolder />
                            <span class="font-medium">scripts</span>
                        </div>
                        <span class="text-muted-foreground truncate text-right">Add backend update script</span>
                    </div>

                    <div class="flex items-center p-2.5 border-b">
                        <div class="flex items-center space-x-2.5 w-40">
                            <MaterialSymbolsFolder />
                            <span class="font-medium">src</span>
                        </div>
                        <span class="text-muted-foreground truncate text-right">feat(auth): improve security</span>
                    </div>

                    <div class="flex items-center p-2.5 border-b">
                        <div class="flex items-center space-x-2.5 w-40">
                            <MaterialSymbolsFile />
                            <span class="truncate">.env</span>
                        </div>
                        <span class="text-muted-foreground truncate text-right">The Onion said to upload this file</span>
                    </div>

                    <div class="flex items-center p-2.5 border-b">
                        <div class="flex items-center space-x-2.5 w-40">
                            <MaterialSymbolsFile />
                            <span class="truncate">README.md</span>
                        </div>
                        <span class="text-muted-foreground truncate text-right">Update links in README</span>
                    </div>

                    <div class="flex items-center p-2.5 border-b">
                        <div class="flex items-center space-x-2.5 w-40">
                            <MaterialSymbolsFile />
                            <span class="truncate">requirements.txt</span>
                        </div>
                        <span class="text-muted-foreground truncate text-right">Update package versions</span>
                    </div>
                </div>
            </div>

            <div class="space-y-4 pt-1 md:pt-0">
                <div>
                    <h3 class="font-semibold border-b border-border pb-1.5 mb-2">About</h3>
                    <p class="text-muted-foreground wrap-anywhere">For issues and discussions, please use the frontend repo (PowerPCFan/eepy.page-frontend)</p>
                </div>

                <div class="text-[11px] space-y-1.5 text-muted-foreground/75">
                    <div class="flex items-center space-x-1.5">
                        <MaterialSymbolsBalance />
                        <span>GPL-3.0 license</span>
                    </div>
                    <div class="flex items-center space-x-1.5">
                        <MaterialSymbolsVisibility />
                        <span><span class="font-bold">1</span> watching</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
{/snippet}

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
            <div class="visual-icon w-2/5">
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

    <div class="selling-points mt-20 sm:mt-32 px-6 sm:px-12 lg:px-24 max-w-7xl mx-auto">
        <div class="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            <div class="text w-full lg:w-1/2 bg-card/60 backdrop-blur-xs border border-border/50 rounded-2xl p-6 sm:p-8 shadow-xs order-2 lg:order-1">
                <h2 class="w-fit text-3xl sm:text-4xl font-semibold tracking-tight">{t("common.landing.alwaysFree.title")}</h2>
                <p class="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
                    {t("common.landing.alwaysFree.paragraph1")}<br><br>
                    {t("common.landing.alwaysFree.paragraph2")}
                </p>
            </div>
            <div class="visual w-full lg:w-1/2 order-1 lg:order-2 relative group">
                <MacOSWindow title={t("common.landing.alwaysFree.title")} class="w-full lg:rotate-3">
                    <div class="p-5 gap-1 flex flex-row font-sans text-xs justify-around w-full">
                        <div class="w-20 flex flex-col items-center gap-2">
                            <img alt="emoji" class="w-17" src={Nice} />
                            <span class="text-center">{t("common.landing.alwaysFree.graphicText1")}</span>
                        </div>
                        <div class="w-18 flex flex-col items-center gap-2">
                            <img alt="emoji" class="w-17 brightness-110" src={Shrug} />
                            <span class="text-center">{t("common.landing.alwaysFree.graphicText2")}</span>
                        </div>
                        <div class="w-18 flex flex-col items-center gap-2">
                            <img alt="emoji" class="w-17" src={Bucktooth} />
                            <span class="text-center">{t("common.landing.alwaysFree.graphicText3")}</span>
                        </div>
                    </div>
                </MacOSWindow>

                <div class="hidden lg:block absolute -top-5 -right-3 sm:-top-7 sm:-right-5 z-20 pointer-events-none">
                    <div class="size-16 sm:size-20 rounded-2xl bg-card/90 dark:bg-zinc-900/90 border border-border/80 shadow-2xl backdrop-blur-xl p-3 flex items-center justify-center">
                        <img class="size-full object-contain filter invert dark:invert-0 opacity-85 dark:opacity-95" alt="" src={Gift} />
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="selling-points mt-20 sm:mt-32 px-6 sm:px-12 lg:px-24 max-w-7xl mx-auto">
        <div class="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            <div class="visual w-full lg:w-1/2 relative group">
                <MacOSWindow title={t("common.landing.servicesSupport.title")} class="w-full lg:-rotate-3">
                    <div class="p-4 flex flex-col items-center gap-2 w-full max-w-2xl mx-auto">
                        <div class="w-full flex flex-col items-center">
                            <p class="text-muted-foreground text-xs uppercase tracking-wide">{t("common.landing.servicesSupport.webHosting")}</p>
                            <div class="px-6 xl:px-12 pt-4 pb-2 flex flex-row gap-2 justify-between w-full">
                                {@render serviceLogo(GitHubLogo, "GitHub Pages")}
                                {@render serviceLogo(CodebergLogo, "Codeberg Pages", "text-[#2185d0]")}
                                {@render serviceLogo(NeocitiesLogo, "Neocities")}
                                {@render serviceLogo(NekowebLogo, "Nekoweb")}
                            </div>
                        </div>
                        <div class="w-full flex flex-col items-center">
                            <p class="text-muted-foreground text-xs uppercase tracking-wide">{t("common.landing.servicesSupport.supportedSocials")}</p>
                            <div class="px-12 xl:px-24 pb-4 pt-2 flex flex-row gap-2 justify-between w-full">
                                {@render serviceLogo(DiscordLogo, "Discord", "text-[#5865F2]")}
                                {@render serviceLogo(BlueskyLogo, "Bluesky", "text-[#1185FE]")}
                                {@render serviceLogo(XLogo, "X&nbsp;(Twitter)")}
                            </div>
                        </div>
                        <div class="w-full flex flex-col items-center rounded-lg py-4 px-8 bg-card/75">
                            <p class="text-muted-foreground text-sm text-center">{t("common.landing.servicesSupport.andMore")}</p>
                        </div>
                    </div>
                </MacOSWindow>

                <div class="hidden lg:block absolute -bottom-5 -right-3 sm:-bottom-7 sm:-right-5 z-20 pointer-events-none">
                    <div class="size-16 sm:size-20 rounded-2xl bg-card/90 dark:bg-zinc-900/90 border border-border/80 shadow-2xl backdrop-blur-xl p-3 flex items-center justify-center">
                        <img class="size-full object-contain filter invert dark:invert-0 opacity-85 dark:opacity-95" alt="" src={Services} />
                    </div>
                </div>
            </div>
            <div class="text w-full lg:w-1/2 bg-card/60 backdrop-blur-xs border border-border/50 rounded-2xl p-6 sm:p-8 shadow-xs">
                <h2 class="w-fit text-3xl sm:text-4xl font-semibold tracking-tight">{t("common.landing.servicesSupport.title")}</h2>
                <p class="mt-4 text-base sm:text-lg leading-relaxed">
                    {t("common.landing.servicesSupport.lead")}
                </p>
            </div>
        </div>
    </div>

    <div class="selling-points mt-20 sm:mt-32 px-6 sm:px-12 lg:px-24 max-w-7xl mx-auto">
        <div class="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            <div class="text w-full lg:w-1/2 bg-card/60 backdrop-blur-xs border border-border/50 rounded-2xl p-6 sm:p-8 shadow-xs order-2 lg:order-1">
                <h2 class="w-fit text-3xl sm:text-4xl font-semibold tracking-tight">{t("common.landing.management.title")}</h2>
                <p class="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
                    {t("common.landing.management.paragraph1")}<br><br>
                    {t("common.landing.management.paragraph2")}<br><br>
                    {t("common.landing.management.paragraph3")}
                </p>
            </div>
            <div class="visual w-full lg:w-1/2 order-1 lg:order-2 relative group">
                <MacOSWindow title="Dashboard | eepy.page" class="w-full lg:rotate-3">
                    {@render mockDashboard([
                        { type: "A", domain: "example", target: "1.1.1.1" },
                        { type: "CNAME", domain: "api.example", target: "example.com" },
                        { type: "A", domain: "grafana.example", target: "192.168.1.10" },
                    ])}
                </MacOSWindow>

                <div class="hidden lg:block absolute -top-5 -right-3 sm:-top-7 sm:-right-5 z-20 pointer-events-none">
                    <div class="size-16 sm:size-20 rounded-2xl bg-card/90 dark:bg-zinc-900/90 border border-border/80 shadow-2xl backdrop-blur-xl p-3 flex items-center justify-center">
                        <img class="size-full object-contain filter invert dark:invert-0 opacity-85 dark:opacity-95" alt="" src={Dashboard} />
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="selling-points mt-20 sm:mt-32 px-6 sm:px-12 lg:px-24 max-w-7xl mx-auto">
        <div class="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            <div class="visual w-full lg:w-1/2 relative group">
                <MacOSWindow title="eepy — eepy@Eepys-MacBook-Air — zsh — 120×30" class="w-full lg:-rotate-3">
                    <div class="p-4 bg-zinc-950 font-mono text-xs text-zinc-300 space-y-2 select-text">
                        <div class="flex flex-col justify-center text-zinc-100!">
                            <span class="font-mono!">Last login: Mon Nov  9 12:30:22 on ttys000</span>
                            <span>&nbsp;</span>
                            <span class="font-mono!">eepy@Eepys-MacBook-Air ~ % ssh -R \<br>&nbsp;&nbsp;&nbsp;&nbsp;example.eepy.page:80:localhost:8000 serveo.net</span>
                            <span>&nbsp;</span>
                        </div>
                        <div class="text-[11px] text-zinc-100 my-2 space-y-0.5">
                            <div class="flex flex-row gap-1 font-mono!">
                                <Checkmark class="text-green-400 mt-px" /> Forwarding active!
                            </div>
                            <span>&nbsp;</span>
                        </div>
                        <div class="space-y-1 text-[11px] tracking-wide">
                            <div class="flex items-center gap-2 text-zinc-400">
                                <span class="text-green-400 font-bold font-mono!">200</span>
                                <span class="font-mono!">GET&nbsp;&nbsp;/</span>
                            </div>
                            <div class="flex items-center gap-2 text-zinc-400">
                                <span class="text-yellow-400 font-bold font-mono!">302</span>
                                <span class="font-mono!">POST&nbsp;/api/legacy/getInfo</span>
                            </div>
                            <div class="flex items-center gap-2 text-zinc-400">
                                <span class="text-red-400 font-bold font-mono!">404</span>
                                <span class="font-mono!">GET&nbsp;&nbsp;/.env</span>
                            </div>
                        </div>
                    </div>
                </MacOSWindow>

                <div class="hidden lg:block absolute -bottom-5 -right-3 sm:-bottom-7 sm:-right-5 z-20 pointer-events-none">
                    <div class="size-16 sm:size-20 rounded-2xl bg-card/90 dark:bg-zinc-900/90 border border-border/80 shadow-2xl backdrop-blur-xl p-3 flex items-center justify-center">
                        <img class="size-full object-contain filter invert dark:invert-0 opacity-85 dark:opacity-95" alt="" src={Split} />
                    </div>
                </div>
            </div>
            <div class="text w-full lg:w-1/2 bg-card/60 backdrop-blur-xs border border-border/50 rounded-2xl p-6 sm:p-8 shadow-xs">
                <h2 class="w-fit text-3xl sm:text-4xl font-semibold tracking-tight">{t("common.landing.tunneling.title")}</h2>
                <p class="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
                    {t("common.landing.tunneling.paragraph1")}
                    <br><br>
                    {t("common.landing.tunneling.paragraph2")}
                </p>
            </div>
        </div>
    </div>

    <div class="selling-points mt-20 sm:mt-32 px-6 sm:px-12 lg:px-24 max-w-7xl mx-auto">
        <div class="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            <div class="text w-full lg:w-1/2 bg-card/60 backdrop-blur-xs border border-border/50 rounded-2xl p-6 sm:p-8 shadow-xs order-2 lg:order-1">
                <h2 class="w-fit text-3xl sm:text-4xl font-semibold tracking-tight">{t("common.landing.openSource.title")}</h2>
                <p class="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
                    {t("common.landing.openSource.paragraph1")}<br><br>
                    {t("common.landing.openSource.paragraph2")}
                </p>

                <Separator class="mt-6 mb-6 opacity-60" />
                <div class="flex flex-col gap-2.5">
                    <p class="text-sm font-medium text-foreground">{t("common.landing.openSource.reposLead")}</p>
                    <a class="text-primary hover:underline font-medium text-sm flex items-center gap-1.5" href="https://github.com/PowerPCFan/eepy.page-frontend" target="_blank" rel="noopener noreferrer">
                        <ArrowRightIcon class="size-3.5" /> {t("common.landing.openSource.frontendRepo")}
                    </a>
                    <a class="text-primary hover:underline font-medium text-sm flex items-center gap-1.5" href="https://github.com/PowerPCFan/eepy.page-backend" target="_blank" rel="noopener noreferrer">
                        <ArrowRightIcon class="size-3.5" /> {t("common.landing.openSource.backendRepo")}
                    </a>
                </div>
            </div>
            <div class="visual w-full lg:w-1/2 order-1 lg:order-2 relative group">
                <MacOSWindow title="PowerPCFan/eepy.page-frontend: A modern, completely free subdomain service for your projects." class="w-full lg:rotate-3">
                    {@render mockGithub()}
                </MacOSWindow>
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

    @media (max-width: 1024px) {
        .selling-points {
            padding-inline: 1.25rem !important;
        }

        .text, .visual {
            width: 100% !important;
        }

        .visual-icon {
            display: none;
        }
    }

    @media (max-width: 600px) {
        .introduction {
            min-height: calc(100svh - var(--vpOffset, 0px) - 3.5rem);
            padding-top: 3.5rem;
            padding-bottom: 4.5rem;
        }

        .domain-input,
        .domain-input :global(input) {
            width: 100%;
        }

        .domain-suffix {
            margin-left: 0;
        }

        .selling-points {
            margin-top: 4rem;
        }

        .text h2 {
            font-size: 2rem;
            line-height: 1.12;
        }
    }
</style>
