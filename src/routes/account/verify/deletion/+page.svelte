<script lang="ts">
	import { redirectToLogin } from "$lib";
	import Holder from "$lib/components/Holder.svelte";
	import { Button } from "$lib/components/ui/button";
	import { CodeError, UserError, verifyDeletion } from "../../../../serverContactor";

	let doneVerifying: boolean = $state(false);
	let valid: boolean = $state(false);
	let clicked: boolean = $state(false);

	function confirmDeletion() {
		clicked = true;
		const urlParams = new URLSearchParams(window.location.search);

		verifyDeletion(urlParams.get("code") || "undefined")
			.catch(err => {
				if (err instanceof CodeError) console.error("Code is invalid");
				if (err instanceof UserError) console.error("User does not exist");
				valid = false;
				doneVerifying = true;
				throw new Error("Verification failed!");
			})
			.then(_ => {
				valid = true;
				doneVerifying = true;
			});
	}

	$effect(() => {
		if (valid) redirectToLogin(200, 3);
	});
</script>

<Holder>
	<h1 class="text-2xl font-semibold">Account deletion verification</h1>
	<br />
	{#if !clicked}
		<p>
			Are you sure you want to delete your account? This action is permanent and cannot be
			undone. The following actions will happen:
		</p>
		<ol>
			<li>Your account will be permanently deleted</li>
			<li>
				Every domain on your account will also be deleted and become available for other users
				to register
			</li>
			<li>Your personal information will be erased from our servers</li>
			<li>Your account's username will be available for other users to register</li>
		</ol>
		<Button onclick={_ => confirmDeletion()} variant={"destructive"}
			>I understand the consequences, and I would like to continue</Button>
	{/if}
	<h2>
		{#if !doneVerifying && clicked}
			Checking verification validity...
		{:else if !valid && clicked && doneVerifying}
			Invalid code
		{:else if valid && clicked && doneVerifying}
			Account deleted
		{/if}
	</h2>
	{#if doneVerifying}
		<p>
			{#if valid}
				Redirecting to login in 3 seconds...
			{:else}
				This code has either expired, or is invalid.
			{/if}
		</p>
	{/if}
</Holder>
