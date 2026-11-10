<script lang="ts">
    import * as Select from "$lib/components/ui/select/index.js";
    import { t, setLocale, currentLocale } from "$lib/i18n";
    import { activeTheme, sidebarOpen } from "$lib/store";
    import UserNav from "$lib/components/UserNav.svelte";
    import { fade } from "svelte/transition";
    import MaterialSymbolsAutorenewRounded from "~icons/material-symbols/autorenew-rounded";
    import MaterialSymbolsCloseRounded from "~icons/material-symbols/close-rounded";
    import MaterialSymbolsDarkModeRounded from "~icons/material-symbols/dark-mode-rounded";
    import MaterialSymbolsLightModeRounded from "~icons/material-symbols/light-mode-rounded";
    import MaterialSymbolsMenuRounded from "~icons/material-symbols/menu-rounded";
    import MSHomeRounded from "~icons/material-symbols/home-rounded";
    import MSTeamDashboard from "~icons/material-symbols/dashboard-2";
    import MSArrowSplit from "~icons/material-symbols/arrow-split";
    import MSAccountCircle from "~icons/material-symbols/account-circle";
    import MSMenuBook from "~icons/material-symbols/menu-book";
    import MSHelp from "~icons/material-symbols/help";
    import MSFlagRounded from "~icons/material-symbols/flag-rounded";
    import CircleFlagsUs from "~icons/cif/us";
    import CircleFlagsFi from "~icons/cif/fi";
    import CircleFlagsEs from "~icons/cif/es";
    import CircleFlagsIt from "~icons/cif/it";
    import { changeTheme } from "../../helperFuncs";
    import Label from "./ui/label/label.svelte";

    const LANGUAGES = [
        { code: "en", label: "English", icon: CircleFlagsUs },
        { code: "es", label: "Español", icon: CircleFlagsEs },
        { code: "it", label: "Italiano", icon: CircleFlagsIt },
        { code: "fi", label: "Suomi", icon: CircleFlagsFi },
    ] as const;

    let { children } = $props();
</script>

<header
    id="header"
    class="header sticky top-0 z-40 flex min-h-14 w-full max-w-full items-center gap-1 sm:gap-2 border-b border-border/60 bg-card/80 backdrop-blur-xl px-3 sm:px-6 py-2 transition-colors">

    <button
        id="popout-toggle"
        class="relative hidden h-9 w-9 items-center justify-center rounded-lg text-foreground hover:bg-muted/50 transition-transform duration-150 active:scale-95 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        onclick={_ => ($sidebarOpen = !$sidebarOpen)}
        aria-label={t("common.nav.toggleMenu")}>
        <span class="relative flex h-7 w-7 items-center justify-center">
            <span
                class="absolute transition-all duration-200 ease-out"
                class:opacity-100={!$sidebarOpen}
                class:scale-100={!$sidebarOpen}
                class:rotate-0={!$sidebarOpen}
                class:opacity-0={$sidebarOpen}
                class:scale-75={$sidebarOpen}
                class:rotate-90={$sidebarOpen}>
                <MaterialSymbolsMenuRounded class="h-6 w-6" />
            </span>
            <span
                class="absolute transition-all duration-200 ease-out"
                class:opacity-100={$sidebarOpen}
                class:scale-100={$sidebarOpen}
                class:rotate-0={$sidebarOpen}
                class:opacity-0={!$sidebarOpen}
                class:scale-75={!$sidebarOpen}
                class:-rotate-90={!$sidebarOpen}>
                <MaterialSymbolsCloseRounded class="h-6 w-6" />
            </span>
        </span>
    </button>

    <a
        href="/"
        class="brand-logo flex items-center gap-2 font-bold text-lg sm:text-xl hover:opacity-85 transition-opacity shrink-0 mr-1 sm:mr-3"
    >
        <img src="/favicon.svg" alt="eepy.page" class="size-6 sm:size-7" />
        <span class="tracking-tight text-muted-foreground font-bold leading-0 mb-0.5">eepy.page</span>
    </a>

    <nav class="desktop-links flex min-w-0 items-center gap-0">
        {@render children()}
    </nav>

    <div class="ml-auto flex items-center gap-2">
        <div id="lang-picker-navbar" class="flex items-center gap-2">
            <Select.Root
                type="single"
                value={$currentLocale}
                onValueChange={(val) => {
                    if (val && val !== $currentLocale) {
                        setLocale(val);
                    }
                }}
                name="Language">
                <Select.Trigger class="flex w-30 items-center gap-2 h-9 rounded-lg border-border/80 bg-background/50 hover:bg-background transition-colors text-xs font-medium">
                    {#if $currentLocale === "fi"}
                        <CircleFlagsFi class="size-4 shrink-0 rounded-full" />
                        <span class="truncate">Suomi</span>
                    {:else if $currentLocale === "es"}
                        <CircleFlagsEs class="size-4 shrink-0 rounded-full" />
                        <span class="truncate">Español</span>
                    {:else if $currentLocale === "it"}
                        <CircleFlagsIt class="size-4 shrink-0 rounded-full" />
                        <span class="truncate">Italiano</span>
                    {:else}
                        <CircleFlagsUs class="size-4 shrink-0 rounded-full" />
                        <span class="truncate">English</span>
                    {/if}
                </Select.Trigger>
                <Select.Content class="backdrop-blur-xl bg-popover/90 border-border/60">
                    {#each LANGUAGES as lang}
                        {@const Icon = lang.icon}
                        <Select.Item aria-selected={$currentLocale === lang.code} value={lang.code} label={lang.label}>
                            <Icon class="size-4 shrink-0 rounded-full" />
                            <span>{lang.label}</span>
                        </Select.Item>
                    {/each}
                </Select.Content>
            </Select.Root>

            <Select.Root onValueChange={changeTheme} type="single" name={t("common.theme.name")}>
                <Select.Trigger class="flex w-26 items-center gap-1.5 h-9 rounded-lg border-border/80 bg-background/50 hover:bg-background transition-colors text-xs">
                    {#if $activeTheme === "light"}
                        <MaterialSymbolsLightModeRounded class="h-4 w-4" />
                        {t("common.theme.light")}
                    {:else if $activeTheme === "dark"}
                        <MaterialSymbolsDarkModeRounded class="h-4 w-4" />
                        {t("common.theme.dark")}
                    {:else if $activeTheme === "auto"}
                        <MaterialSymbolsAutorenewRounded class="h-4 w-4" />
                        {t("common.theme.auto")}
                    {/if}
                </Select.Trigger>
                <Select.Content class="backdrop-blur-xl bg-popover/90 border-border/60">
                    <Select.Item aria-selected={$activeTheme === "light"} value="light" label={t("common.theme.light")}>
                        <MaterialSymbolsLightModeRounded />
                        {t("common.theme.light")}
                    </Select.Item>
                    <Select.Item aria-selected={$activeTheme === "dark"} value="dark" label={t("common.theme.dark")}>
                        <MaterialSymbolsDarkModeRounded />
                        {t("common.theme.dark")}
                    </Select.Item>
                    <Select.Item aria-selected={$activeTheme === "auto"} value="auto" label={t("common.theme.auto")}>
                        <MaterialSymbolsAutorenewRounded />
                        {t("common.theme.auto")}
                    </Select.Item>
                </Select.Content>
            </Select.Root>
        </div>

        <div class="desktop-user-nav flex items-center">
            <UserNav />
        </div>
    </div>
</header>

{#if $sidebarOpen}
    <div
        tabindex="-1"
        role="presentation"
        transition:fade={{ duration: 150 }}
        class="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden"
        onclick={() => ($sidebarOpen = false)}
        onkeydown={(e) => e.key === 'Escape' && ($sidebarOpen = false)}>
    </div>

    <div
        transition:fade={{ duration: 150 }}
        id="popout"
        class="popout bg-card fixed top-14 left-0 z-50 flex h-[calc(100dvh-3.5rem)] w-[min(19rem,85vw)] flex-col space-y-4 overflow-y-auto rounded-br-2xl p-4 border-r border-b border-border/70 shadow-2xl">

        <UserNav mobile={true} onNavigate={() => ($sidebarOpen = false)} />

        <nav class="flex flex-col space-y-1 py-1">
            <a
                href="/"
                class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                onclick={() => ($sidebarOpen = false)}
            >
                <MSHomeRounded class="size-4 text-muted-foreground" />
                <span>{t("common.nav.home")}</span>
            </a>
            <a
                href="/dashboard"
                class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                onclick={() => ($sidebarOpen = false)}
            >
                <MSTeamDashboard class="size-4 text-muted-foreground" />
                <span>{t("common.nav.dashboard")}</span>
            </a>
            <a
                href="/dashboard/tunneling"
                class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                onclick={() => ($sidebarOpen = false)}
            >
                <MSArrowSplit class="size-4 text-muted-foreground" />
                <span>{t("common.nav.tunneling")}</span>
            </a>
            <a
                href="/account/manage"
                class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                onclick={() => ($sidebarOpen = false)}
            >
                <MSAccountCircle class="size-4 text-muted-foreground" />
                <span>{t("common.nav.account")}</span>
            </a>
            <a
                href="https://docs.eepy.page/"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                onclick={() => ($sidebarOpen = false)}
            >
                <MSMenuBook class="size-4 text-muted-foreground" />
                <span>{t("common.nav.docs")}</span>
                <span class="ml-auto text-xs text-muted-foreground">&#8599;</span>
            </a>
            <a
                href="/support"
                class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                onclick={() => ($sidebarOpen = false)}
            >
                <MSHelp class="size-4 text-muted-foreground" />
                <span>{t("common.nav.support")}</span>
            </a>
            <a
                href="/report"
                class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                onclick={() => ($sidebarOpen = false)}
            >
                <MSFlagRounded class="size-4 text-muted-foreground" />
                <span>{t("common.nav.report")}</span>
            </a>
        </nav>

        <div class="mt-auto mb-2 pt-4 border-t border-border/50 space-y-3">
            <div>
                <Label class="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2 block">Language</Label>
                <Select.Root
                    type="single"
                    value={$currentLocale}
                    onValueChange={(val) => {
                        if (val && val !== $currentLocale) {
                            setLocale(val);
                        }
                    }}
                    name="Language">
                    <Select.Trigger class="w-full justify-between">
                        <span class="flex items-center gap-2">
                            {#if $currentLocale === "fi"}
                                <CircleFlagsFi class="size-4 shrink-0 rounded-full" />
                                <span>Suomi</span>
                            {:else if $currentLocale === "es"}
                                <CircleFlagsEs class="size-4 shrink-0 rounded-full" />
                                <span>Español</span>
                            {:else if $currentLocale === "it"}
                                <CircleFlagsIt class="size-4 shrink-0 rounded-full" />
                                <span>Italiano</span>
                            {:else}
                                <CircleFlagsUs class="size-4 shrink-0 rounded-full" />
                                <span>English</span>
                            {/if}
                        </span>
                    </Select.Trigger>
                    <Select.Content class="backdrop-blur-xl bg-popover/95 border-border/60">
                        {#each LANGUAGES as lang}
                            {@const Icon = lang.icon}
                            <Select.Item aria-selected={$currentLocale === lang.code} value={lang.code} label={lang.label}>
                                <Icon class="h-4 w-4 shrink-0 rounded-full" />
                                <span>{lang.label}</span>
                            </Select.Item>
                        {/each}
                    </Select.Content>
                </Select.Root>
            </div>

            <div>
                <Label class="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2 block">{t("common.theme.label")}</Label>
                <Select.Root onValueChange={changeTheme} type="single" name={t("common.theme.name")}>
                    <Select.Trigger class="w-full justify-between">
                        {#if $activeTheme === "light"}
                            {t("common.theme.light")}
                        {:else if $activeTheme === "dark"}
                            {t("common.theme.dark")}
                        {:else if $activeTheme === "auto"}
                            {t("common.theme.auto")}
                        {/if}
                    </Select.Trigger>
                    <Select.Content class="backdrop-blur-xl bg-popover/95 border-border/60">
                        <Select.Item aria-selected={$activeTheme === "light"} value="light" label={t("common.theme.light")}>
                            <MaterialSymbolsLightModeRounded />
                            {t("common.theme.light")}
                        </Select.Item>
                        <Select.Item aria-selected={$activeTheme === "dark"} value="dark" label={t("common.theme.dark")}>
                            <MaterialSymbolsDarkModeRounded />
                            {t("common.theme.dark")}
                        </Select.Item>
                        <Select.Item aria-selected={$activeTheme === "auto"} value="auto" label={t("common.theme.auto")}>
                            <MaterialSymbolsAutorenewRounded />
                            {t("common.theme.auto")}
                        </Select.Item>
                    </Select.Content>
                </Select.Root>
            </div>
        </div>
    </div>
{/if}

<style>
    @media (max-width: 1024px) {
        .desktop-links {
            display: none !important;
        }

        #lang-picker-navbar {
            display: none !important;
        }

        .desktop-user-nav {
            display: none !important;
        }

        #popout-toggle {
            display: flex !important;
        }
    }
</style>
