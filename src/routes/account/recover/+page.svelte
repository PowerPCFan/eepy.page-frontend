<script lang="ts">
	import { browser } from "$app/environment";

	import Button from "$lib/components/Button.svelte";
	import Holder from "$lib/components/Holder.svelte";
	import Modal from "$lib/components/Modal.svelte";

	import { redirectToLogin } from "$lib";
	import Input from "$lib/components/ui/input/input.svelte";
	import {
		CodeError,
		confirmPasswordChange,
		sendForgotCode,
		UserError
	} from "./../../../serverContactor";

	let generatingNew: boolean = false;
	let code: string | null = null;

	if (browser) {
		const params: URLSearchParams = new URLSearchParams(window.location.search);
		code = params.get("c");
		generatingNew = code !== null;
	}

	function handleButton(event: any) {
		if (generatingNew) {
			if (password !== cPassword) {
				modal.open("Passwords don't match.", "Please confirm that your passwords match.");
				return;
			}

			confirmPasswordChange(code ?? "", password)
				.catch(err => {
					if (err instanceof CodeError)
						modal.open("Failed to change password", "Perhaps the code has expired?");
					if (err instanceof UserError) redirectToLogin(404);

					throw new Error("Failed to reset password");
				})
				.then(response => {
					modal.open(
						"Successfully changed password!",
						"You can now log in using your new password."
					);
				});
		} else {
			sendForgotCode(username)
				.catch(err => {
					if (err instanceof UserError) redirectToLogin(404);

					modal.open(
						"Failed to send verification code",
						"Did you double-check your username? Frii.site usernames are case-sensitive."
					);
					throw new Error("Failed to send password reset");
				})
				.then(_ => {
					modal.open(
						"A verification email has been sent to your inbox.",
						"If you can't find it, please check your spam folder."
					);
				});
		}
	}

	let cPassword: string;
	let password: string;
	let username: string;

	let modal: Modal;
</script>

<Modal countdown={undefined} description="" title="" options={["OK"]} bind:this={modal} />
<Holder>
	<h1 class="text-2xl font-semibold">Account recovery</h1>

	{#if generatingNew}
		<Input bind:value={password} placeholder="Password" />
		<Input bind:value={cPassword} placeholder="Confirm password" />
	{:else}
		<p>
			Please enter your frii.site username. A verification code will be sent to your email.
		</p>
		<Input bind:value={username} placeholder="Username" />
	{/if}
	<Button on:click={handleButton} args="fill padding margin-1em-top">Submit</Button>
</Holder>

<style>
</style>
