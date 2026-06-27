<script lang="ts">
	import { afterNavigate, beforeNavigate } from "$app/navigation";
	import Analytics from "$lib/components/Analytics.svelte";
	import Banner from "$lib/components/Banner.svelte";
	import Header from "$lib/components/Header.svelte";
	import { Toaster } from "$lib/components/ui/sonner";
	import "$lib/nprogress.css";
	import { sidebarOpen } from "$lib/store";
	import consola from "consola";
	import NProgress from "nprogress";
	import type { Component } from "svelte";
	import MaterialSymbolsAccountCircle from "~icons/material-symbols/account-circle";
	import MaterialSymbolsCollectionsBookmarkOutlineRounded from "~icons/material-symbols/collections-bookmark-outline-rounded";
	import MaterialSymbolsFlagRounded from "~icons/material-symbols/flag-rounded";
	import MaterialSymbolsHomeRounded from "~icons/material-symbols/home-rounded";
	import MaterialSymbolsMenuBookRounded from "~icons/material-symbols/menu-book-rounded";
	import MaterialSymbolsTeamDashboard from "~icons/material-symbols/team-dashboard";

	import Button from "$lib/components/ui/button/button.svelte";
	import { isBrowser } from "@sentry/core";
	import "../app.css";
	import { localizeHref } from "../paraglide/runtime";

	let { children } = $props();
	let localSponsorHidden = $state(false);
	let innerWidth = $state(0);
	let adsVisible = $state(false);
	let towerAdsVisible = $state(false);
	let navigationTrigger = $state(0);

	NProgress.configure({
		minimum: 0.55,
		trickle: true,
		trickleSpeed: 200
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
	{@render navbarLink(MaterialSymbolsHomeRounded, localizeHref("/"), "Home")}
	{@render navbarLink(
		MaterialSymbolsTeamDashboard,
		localizeHref("/dashboard"),
		"Dashboard",
		false
	)}
	{@render navbarLink(
		MaterialSymbolsAccountCircle,
		localizeHref("/account/manage"),
		"Account",
		false
	)}
	{@render navbarLink(
		MaterialSymbolsCollectionsBookmarkOutlineRounded,
		localizeHref("/blogs"),
		"Blogs"
	)}
	{@render navbarLink(MaterialSymbolsFlagRounded, localizeHref("/report"), "Report")}
	{@render navbarLink(
		MaterialSymbolsMenuBookRounded,
		"https://guides.frii.site",
		"Guides"
	)}
</Header>

<Banner />

<Analytics />

{#if isBrowser() && Number(localStorage.getItem("views")) > 7 && !localStorage.getItem("donation-dismissed") && !localSponsorHidden}
	<div class="flex w-full items-center justify-around p-4">
		<div>
			<h1 class="text-2xl font-semibold">Have you considered donating?</h1>
			<p class="max-w-[60ch]">
				frii.site has never been profitable, but due to Namecheap raising our domain's prices, we are losing more money than we ever have. Even small donations <nobr>(e.g. 1€ or $1)</nobr> would help out immensely.
			</p>
			<a href="https://ko-fi.com/ctih1">View donation options</a>
		</div>

		<Button
			variant={"destructive"}
			onclick={_ => {
				localSponsorHidden = true;
				localStorage.setItem("donation-dismissed", "true");
			}}>Never remind me again</Button>
	</div>
{/if}

<svelte:head>
	<link
		rel="preload"
		as="font"
		href="/fonts/InterVariable.woff2"
		type="font/woff2"
		crossorigin="anonymous" />
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

	:global(*) {
		font-family: "Inter", sans-serif;
	}

	:global(a) {
		color: var(--color-primary);
		transition: color 0.2s ease-in-out;
	}

	:global(body) {
		overflow-x: hidden;
	}
</style>
