<script lang="ts">
    import { afterNavigate, beforeNavigate } from "$app/navigation";
    import Banner from "$lib/components/Banner.svelte";
    import CookieConsent from "$lib/components/CookieConsent.svelte";
    import Header from "$lib/components/Header.svelte";
    import { Toaster } from "$lib/components/ui/sonner";
    import "$lib/nprogress.css";
    import { sidebarOpen } from "$lib/store";
    import consola from "consola";
    import NProgress from "nprogress";
    import MaterialSymbolsAccountCircle from "~icons/material-symbols/account-circle";
    import MaterialSymbolsFlagRounded from "~icons/material-symbols/flag-rounded";
    import MaterialSymbolsHomeRounded from "~icons/material-symbols/home-rounded";
    import MaterialSymbolsTeamDashboard from "~icons/material-symbols/team-dashboard";
    import MaterialSymbolsArrowSplit from "~icons/material-symbols/arrow-split";
    import type { Component } from "svelte";

    import "../app.css";
    import Donate from "$lib/components/Donate.svelte";

    let { children, data } = $props();
    let innerWidth = $state(0);
    let navigationTrigger = $state(0);

    NProgress.configure({
        minimum: 0.55,
        trickle: true,
        trickleSpeed: 200,
    });

    afterNavigate(() => {
        $sidebarOpen = false;
        consola.debug("Navigation done");
        NProgress.done();

        localStorage.setItem("views", (Number(localStorage.getItem("views")) + 1).toString());
        navigationTrigger++;
    });

    beforeNavigate(() => {
        consola.debug("Starting navigation");
        NProgress.start();
    });
</script>

{#snippet navbarLink(Icon: Component, href: string, text: string, preload: boolean = true)}
    {@const preloadValue = preload ? "hover" : "off"}

    <a
        class="hover:text-accent flex flex-row items-center justify-start gap-1.5 text-xl font-medium"
        href={href}
        data-sveltekit-preload-data={preloadValue}>
        <Icon />{text}
    </a>
{/snippet}

<Toaster />

<Header>
    {@render navbarLink(MaterialSymbolsHomeRounded, "/", "Home")}
    {@render navbarLink(MaterialSymbolsTeamDashboard, "/dashboard", "Dashboard", false)}
    {@render navbarLink(MaterialSymbolsArrowSplit, "/dashboard/tunneling", "Tunneling", false)}
    {@render navbarLink(MaterialSymbolsAccountCircle, "/account/manage", "Account", false)}
    {@render navbarLink(MaterialSymbolsFlagRounded, "/report", "Report")}
</Header>

<Banner />

<CookieConsent consentMode={data.consent.mode} />

<Donate />

<svelte:head>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
    <!-- Geist Mono, Geist, Google Sans Flex -->
    <link href="https://fonts.googleapis.com/css2?family=Geist+Mono:ital,wght@0,100..900;1,100..900&family=Geist:wght@100..900&family=Google+Sans+Flex:opsz,wght@6..144,1..1000&display=swap" rel="stylesheet">

    <link rel="preload" as="font" href="/fonts/InterVariable.woff2" type="font/woff2" crossorigin="anonymous" />
</svelte:head>

<svelte:window bind:innerWidth={innerWidth} />

<main class="h-full min-h-screen">
    {@render children()}
</main>

<style>
    @font-face {
        font-family: "Inter";
        src: url("/fonts/InterVariable.woff2") format("woff2");
        font-weight: 100 600;
        font-style: normal;
        font-display: swap;
    }

    :global(*, *::before, *::after) {
        font-family: var(--font-sans);
        box-sizing: border-box;
    }

    :global(code, pre, kbd, samp) {
        font-family: var(--font-mono);
    }

    :global(a) {
        color: var(--color-primary);
        transition: color 0.2s ease-in-out;
    }

    :global(body) {
        overflow-x: hidden;
    }
</style>
