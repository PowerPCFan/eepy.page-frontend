<script lang="ts">
    import * as Select from "$lib/components/ui/select/index.js";
    import { activeTheme, sidebarOpen } from "$lib/store";
    import { fade } from "svelte/transition";
    import MaterialSymbolsAutorenewRounded from "~icons/material-symbols/autorenew-rounded";
    import MaterialSymbolsCloseRounded from "~icons/material-symbols/close-rounded";
    import MaterialSymbolsDarkModeRounded from "~icons/material-symbols/dark-mode-rounded";
    import MaterialSymbolsLightModeRounded from "~icons/material-symbols/light-mode-rounded";
    import MaterialSymbolsMenuRounded from "~icons/material-symbols/menu-rounded";
    import { changeTheme } from "../../helperFuncs";
    import Label from "./ui/label/label.svelte";

    let { children } = $props();
</script>

<header
    id="header"
    class="header bg-card sentry-unmask flex min-h-14 w-full max-w-full items-center gap-4 overflow-x-clip px-4 py-1">
    <button id="popout-toggle" class="relative hidden h-12 w-12" onclick={_ => ($sidebarOpen = !$sidebarOpen)}>
        {#key $sidebarOpen}
            <div transition:fade={{ duration: 100 }} class="absolute top-0">
                {#if !$sidebarOpen}
                    <MaterialSymbolsMenuRounded class="h-12 w-12" />
                {:else}
                    <MaterialSymbolsCloseRounded class="h-12 w-12" />
                {/if}
            </div>
        {/key}
    </button>

    <div class="desktop-links flex min-w-0 gap-4.5">
        {@render children()}
    </div>

    <div class="ml-auto flex min-w-0 space-x-2">
        <div id="lang-picker-navbar">
            <Select.Root onValueChange={changeTheme} type="single" name="Theme mode">
                <Select.Trigger class="flex w-28 items-center gap-1">
                    {#if $activeTheme === "light"}
                        <MaterialSymbolsLightModeRounded class="h-5 w-5" />
                        Light (beta)
                    {:else if $activeTheme === "dark"}
                        <MaterialSymbolsDarkModeRounded class="h-5 w-5" />
                        Dark
                    {:else if $activeTheme === "auto"}
                        <MaterialSymbolsAutorenewRounded class="h-5 w-5" />
                        Auto
                    {/if}
                </Select.Trigger>
                <Select.Content>
                    <Select.Item aria-selected={$activeTheme === "light"} value="light" label="light">
                        <MaterialSymbolsLightModeRounded />
                        Light (beta)
                    </Select.Item>
                    <Select.Item aria-selected={$activeTheme === "dark"} value="dark" label="dark">
                        <MaterialSymbolsDarkModeRounded />
                        Dark
                    </Select.Item>
                    <Select.Item aria-selected={$activeTheme === "auto"} value="auto" label="auto">
                        <MaterialSymbolsAutorenewRounded />
                        Auto
                    </Select.Item>
                </Select.Content>
            </Select.Root>
        </div>
    </div>
</header>
{#if $sidebarOpen}
    <div
        transition:fade={{ duration: 100 }}
        id="popout"
        class="popout bg-card fixed top-14 left-0 z-50 hidden h-[calc(100dvh-3.5rem)] w-[min(16rem,85vw)] flex-col space-y-4 overflow-y-auto rounded-br-2xl p-4 opacity-95 shadow-xl">
        {@render children()}

        <div class="mt-auto mb-4">
            <Label class="text-md mb-0">Theme</Label>
            <Select.Root onValueChange={changeTheme} type="single" name="Theme mode">
                <Select.Trigger class="w-24">
                    {#if $activeTheme === "light"}
                        Light (beta)
                    {:else if $activeTheme === "dark"}
                        Dark
                    {:else if $activeTheme === "auto"}
                        Auto
                    {/if}
                </Select.Trigger>
                <Select.Content>
                    <Select.Item aria-selected={$activeTheme === "light"} value="light" label="light">
                        <MaterialSymbolsLightModeRounded />
                        Light (beta)
                    </Select.Item>
                    <Select.Item aria-selected={$activeTheme === "dark"} value="dark" label="dark">
                        <MaterialSymbolsDarkModeRounded />
                        Dark
                    </Select.Item>
                    <Select.Item aria-selected={$activeTheme === "auto"} value="auto" label="auto">
                        <MaterialSymbolsAutorenewRounded />
                        Auto
                    </Select.Item>
                </Select.Content>
            </Select.Root>
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
            display: block;
            flex: none;
        }
        #popout {
            display: flex;
        }

        :global(#popout a) {
            display: flex;
            font-size: 1.125rem;
        }
    }
</style>
