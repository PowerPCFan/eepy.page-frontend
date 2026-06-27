<script lang="ts">
	import * as Select from "$lib/components/ui/select/index.js";
	import { activeTheme, sidebarOpen } from "$lib/store";
	import { SvelteMap } from "svelte/reactivity";
	import { fade } from "svelte/transition";
	import MaterialSymbolsAutorenewRounded from "~icons/material-symbols/autorenew-rounded";
	import MaterialSymbolsCloseRounded from "~icons/material-symbols/close-rounded";
	import MaterialSymbolsDarkModeRounded from "~icons/material-symbols/dark-mode-rounded";
	import MaterialSymbolsLightModeRounded from "~icons/material-symbols/light-mode-rounded";
	import MaterialSymbolsMenuRounded from "~icons/material-symbols/menu-rounded";
	import { changeTheme } from "../../helperFuncs";
	import Label from "./ui/label/label.svelte";

	let { children } = $props();

	// cache the images
	let images = $state(new SvelteMap<string, string | undefined>());
</script>

<header
	id="header"
	class="bg-card flex h-full w-screen max-w-screen items-center space-x-6 pt-1 pr-4 pb-1 pl-4 sentry-unmask">
	<button
		id="popout-toggle"
		class="relative hidden h-12 w-12"
		onclick={_ => ($sidebarOpen = !$sidebarOpen)}>
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

	<div class="flex gap-4.5">
		{@render children()}
	</div>

	<div class="mr-4 ml-auto flex space-x-2">
		<div id="lang-picker-navbar">
			<Select.Root onValueChange={changeTheme} type="single" name="Theme mode">
				<Select.Trigger class="flex w-28 items-center gap-1">
					{#if $activeTheme === "light"}
						<MaterialSymbolsLightModeRounded class="h-5 w-5" />
						Light
					{:else if $activeTheme === "dark"}
						<MaterialSymbolsDarkModeRounded class="h-5 w-5" />
						Dark
					{:else if $activeTheme === "auto"}
						<MaterialSymbolsAutorenewRounded class="h-5 w-5" />
						Auto
					{/if}
				</Select.Trigger>
				<Select.Content>
					<Select.Item aria-selected={$activeTheme === "dark"} value="dark" label="dark">
						<MaterialSymbolsDarkModeRounded />
						Dark
					</Select.Item>
					<Select.Item
						aria-selected={$activeTheme === "light"}
						value="light"
						label="light">
						<MaterialSymbolsLightModeRounded />
						Light
					</Select.Item>
					<Select.Item aria-selected={$activeTheme === "auto"} value="auto" label="auto">
						<MaterialSymbolsAutorenewRounded />
						Auto</Select.Item>
				</Select.Content>
			</Select.Root>
		</div>
	</div>
</header>
{#if $sidebarOpen}
	<div
		transition:fade={{ duration: 100 }}
		id="popout"
		class="popout bg-card absolute z-50 hidden h-[calc(100vh-48px)] w-full max-w-60 flex-col space-y-4 rounded-br-2xl pl-4 opacity-95">
		{@render children()}

		<div class="mt-auto mb-4">
			<Label class="text-md mb-0">Theme</Label>
			<Select.Root onValueChange={changeTheme} type="single" name="Theme mode">
				<Select.Trigger class="w-24">
					{#if $activeTheme === "light"}
						Light
					{:else if $activeTheme === "dark"}
						Dark
					{:else if $activeTheme === "auto"}
						Auto
					{/if}
				</Select.Trigger>
				<Select.Content>
					<Select.Item aria-selected={$activeTheme === "dark"} value="dark" label="dark">
						<MaterialSymbolsDarkModeRounded />
						Dark
					</Select.Item>
					<Select.Item
						aria-selected={$activeTheme === "light"}
						value="light"
						label="light">
						<MaterialSymbolsLightModeRounded />
						Light
					</Select.Item>
					<Select.Item aria-selected={$activeTheme === "auto"} value="auto" label="auto">
						<MaterialSymbolsAutorenewRounded />
						Auto</Select.Item>
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
		:global(#header svg) {
			display: block;
		}
		#header {
			justify-content: space-between;
		}

		#lang-picker-navbar {
			display: none;
		}
		#popout-toggle {
			display: block;
		}
		#popout {
			display: flex;
		}
	}
</style>
