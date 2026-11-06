<script lang="ts">
    import * as Select from "$lib/components/ui/select/index.js";
    import { t, setLocale, currentLocale } from "$lib/i18n";
    import { activeTheme, sidebarOpen } from "$lib/store";
    import { fade } from "svelte/transition";
    import MaterialSymbolsAutorenewRounded from "~icons/material-symbols/autorenew-rounded";
    import MaterialSymbolsCloseRounded from "~icons/material-symbols/close-rounded";
    import MaterialSymbolsDarkModeRounded from "~icons/material-symbols/dark-mode-rounded";
    import MaterialSymbolsLightModeRounded from "~icons/material-symbols/light-mode-rounded";
    import MaterialSymbolsMenuRounded from "~icons/material-symbols/menu-rounded";
    import CircleFlagsUs from "~icons/circle-flags/us";
    import CircleFlagsFi from "~icons/circle-flags/fi";
    import CircleFlagsEs from "~icons/circle-flags/es";
    import CircleFlagsIt from "~icons/circle-flags/it";
    import { changeTheme } from "../../helperFuncs";
    import Label from "./ui/label/label.svelte";

    const LANGUAGES = [
        { code: "en", label: "English", icon: CircleFlagsUs },
        { code: "fi", label: "Suomi", icon: CircleFlagsFi },
        { code: "es", label: "Español", icon: CircleFlagsEs },
        { code: "it", label: "Italiano", icon: CircleFlagsIt }
    ] as const;

    let { children } = $props();
</script>

<header
    id="header"
    class="header sticky top-0 z-40 flex min-h-14 w-full max-w-full items-center gap-4 border-b border-border/60 bg-card/80 backdrop-blur-xl px-4 py-1.5 transition-colors">
    <button
        id="popout-toggle"
        class="relative hidden h-10 w-10 items-center justify-center rounded-lg text-foreground transition-transform duration-150 active:scale-95 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        onclick={_ => ($sidebarOpen = !$sidebarOpen)}
        aria-label={t("common.nav.toggleMenu")}>
        <span class="relative flex h-8 w-8 items-center justify-center">
            <span
                class="absolute transition-all duration-200 ease-out"
                class:opacity-100={!$sidebarOpen}
                class:scale-100={!$sidebarOpen}
                class:rotate-0={!$sidebarOpen}
                class:opacity-0={$sidebarOpen}
                class:scale-75={$sidebarOpen}
                class:rotate-90={$sidebarOpen}>
                <MaterialSymbolsMenuRounded class="h-8 w-8" />
            </span>
            <span
                class="absolute transition-all duration-200 ease-out"
                class:opacity-100={$sidebarOpen}
                class:scale-100={$sidebarOpen}
                class:rotate-0={$sidebarOpen}
                class:opacity-0={!$sidebarOpen}
                class:scale-75={!$sidebarOpen}
                class:-rotate-90={!$sidebarOpen}>
                <MaterialSymbolsCloseRounded class="h-8 w-8" />
            </span>
        </span>
    </button>

    <div class="desktop-links flex min-w-0 gap-5 items-center">
        {@render children()}
    </div>

    <div class="ml-auto flex min-w-0 space-x-2">
        <div id="lang-picker-navbar" class="flex items-center gap-2">
            <!-- Language Selector -->
            <Select.Root
                type="single"
                value={$currentLocale}
                onValueChange={(val) => {
                    if (val && val !== $currentLocale) {
                        setLocale(val);
                    }
                }}
                name="Language">
                <Select.Trigger class="flex w-32 items-center gap-2 h-9 rounded-lg border-border/80 bg-background/50 hover:bg-background transition-colors text-xs font-medium">
                    {#if $currentLocale === "fi"}
                        <CircleFlagsFi class="h-4 w-4 shrink-0 rounded-full" />
                        <span class="truncate">Suomi</span>
                    {:else if $currentLocale === "es"}
                        <CircleFlagsEs class="h-4 w-4 shrink-0 rounded-full" />
                        <span class="truncate">Español</span>
                    {:else if $currentLocale === "it"}
                        <CircleFlagsIt class="h-4 w-4 shrink-0 rounded-full" />
                        <span class="truncate">Italiano</span>
                    {:else}
                        <CircleFlagsUs class="h-4 w-4 shrink-0 rounded-full" />
                        <span class="truncate">English</span>
                    {/if}
                </Select.Trigger>
                <Select.Content class="backdrop-blur-xl bg-popover/90 border-border/60">
                    {#each LANGUAGES as lang}
                        {@const Icon = lang.icon}
                        <Select.Item aria-selected={$currentLocale === lang.code} value={lang.code} label={lang.label}>
                            <Icon class="h-4 w-4 shrink-0 rounded-full" />
                            <span>{lang.label}</span>
                        </Select.Item>
                    {/each}
                </Select.Content>
            </Select.Root>

            <!-- Theme Selector -->
            <Select.Root onValueChange={changeTheme} type="single" name={t("common.theme.name")}>
                <Select.Trigger class="flex w-28 items-center gap-1.5 h-9 rounded-lg border-border/80 bg-background/50 hover:bg-background transition-colors text-xs">
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
    </div>
</header>

{#if $sidebarOpen}
    <!-- Scrim backdrop for mobile drawer dismissal -->
    <div
        tabindex="-1"
        role="presentation"
        transition:fade={{ duration: 150 }}
        class="fixed inset-0 z-40 bg-black/40 md:hidden"
        onclick={() => ($sidebarOpen = false)}
        onkeydown={(e) => e.key === 'Escape' && ($sidebarOpen = false)}>
    </div>

    <div
        transition:fade={{ duration: 150 }}
        id="popout"
        class="popout bg-card fixed top-14 left-0 z-50 hidden h-[calc(100dvh-3.5rem)] w-[min(17rem,85vw)] flex-col space-y-4 overflow-y-auto rounded-br-2xl p-5 border-r border-b border-border/70 shadow-2xl">
        {@render children()}

        <div class="mt-auto mb-4 pt-4 border-t border-border/50 space-y-3">
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
                                <CircleFlagsFi class="h-4 w-4 shrink-0 rounded-full" />
                                <span>Suomi</span>
                            {:else if $currentLocale === "es"}
                                <CircleFlagsEs class="h-4 w-4 shrink-0 rounded-full" />
                                <span>Español</span>
                            {:else if $currentLocale === "it"}
                                <CircleFlagsIt class="h-4 w-4 shrink-0 rounded-full" />
                                <span>Italiano</span>
                            {:else}
                                <CircleFlagsUs class="h-4 w-4 shrink-0 rounded-full" />
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
    @media (max-width: 960px) {
        :global(#header a) {
            display: none;
        }

        #header {
            justify-content: space-between;
        }

        .desktop-links {
            display: none;
        }

        #lang-picker-navbar {
            display: none;
        }
        #popout-toggle {
            display: flex;
            flex: none;
        }
        #popout {
            display: flex;
        }

        :global(#popout a) {
            display: flex;
            font-size: 1.125rem;
            padding: 0.35rem 0.5rem;
            border-radius: 0.5rem;
            transition: background-color 150ms ease-out;
        }

        :global(#popout a:active) {
            background-color: var(--color-accent) / 10%;
        }
    }
</style>
