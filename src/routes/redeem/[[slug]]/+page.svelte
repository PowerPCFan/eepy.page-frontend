<script lang="ts">
	import { browser } from "$app/environment";
	import { AuthError, getAuthToken, redirectToLogin, ServerContactor } from "$lib";
	import Holder from "$lib/components/Holder.svelte";
	import Button from "$lib/components/ui/button/button.svelte";
	import Input from "$lib/components/ui/input/input.svelte";
	import Label from "$lib/components/ui/label/label.svelte";
	import Loader from "$lib/components/ui/loader/loader.svelte";
	import consola from "consola";
	import { Confetti } from "svelte-confetti";

	let { data } = $props();

	let success: boolean | undefined = $state(undefined);
	let inputValue: string = $state("");
	let inputRequired: boolean = $state(false);

	if (browser) {
		if (!data["code"]) {
			inputRequired = true;
		} else {
			redeem(data["code"]);
		}
	}

	async function redeem(code: string) {
		inputRequired = false;
		success = undefined;
		let serverContactor = new ServerContactor(getAuthToken() ?? "");
		try {
			await serverContactor.redeemCode(code);
			consola.log("Succesfully redeemed!");

			success = true;
		} catch (error) {
			consola.log("Failed to redeem");
			if (error instanceof AuthError) {
				redirectToLogin(460);
			}

			inputRequired = true;
			success = false;
		}
	}
</script>

<Holder>
	{#if success === false}
		<div class="mb-8">
			<h1 class="text-2xl font-semibold">Activation failed</h1>
			<p>The code may have already been used.</p>
			<a href="mailto:support@frii.site">Contact support</a>
		</div>
	{/if}
	{#if inputRequired}
		<h1 class="text-2xl font-semibold">Service Activation</h1>
		<p>Please enter your activation code below</p>

		<div class="mt-4 space-y-2">
			<Label>Activation code</Label>
			<Input bind:value={inputValue} placeholder="xxxxxxxxx" />
		</div>

		<Button onclick={_ => redeem(inputValue)} class="mt-2">Activate</Button>
	{:else if success === undefined}
		<h1 class="text-2xl font-semibold">Activating...</h1>
		<p>Please wait</p>

		<div class="w-12">
			<Loader asForeground={true} />
		</div>
	{:else if success === true}
		<div class="absolute top-64 left-42">
			<Confetti
				colorArray={["#007bff"]}
				cone
				fallDistance={"60px"}
				amount={150}
				x={[-1.2, 1.2]} />
		</div>
		<h1 class="text-2xl font-semibold">Successfully activated!</h1>
		<p>Thank you for your purchase!</p>
	{/if}
</Holder>
