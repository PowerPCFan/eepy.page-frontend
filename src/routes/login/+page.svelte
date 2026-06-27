<script lang="ts">
	import { browser } from "$app/environment";
	import { page } from "$app/state";
	import {
		AuthError,
		CaptchaError,
		ConflictError,
		getAuthToken,
		login,
		MFAError,
		PermissionError,
		register,
		resendEmail,
		serverURL,
		setAuthToken,
		UserError
	} from "$lib";
	import favicon from "$lib/assets/favicon.svg";
	import { Button } from "$lib/components/ui/button/index";
	import Checkbox from "$lib/components/ui/checkbox/checkbox.svelte";
	import InlineAlert from "$lib/components/ui/inline-alert/inline-alert.svelte";
	import * as InputOTP from "$lib/components/ui/input-otp/index.js";
	import { Input } from "$lib/components/ui/input/index";
	import { Label } from "$lib/components/ui/label/index";
	import Separator from "$lib/components/ui/separator/separator.svelte";
	import { activeTheme } from "$lib/store";
	import { REGEXP_ONLY_DIGITS } from "bits-ui";
	import consola from "consola";
	import Cookies from "js-cookie";
	import { onMount } from "svelte";
	import { fade } from "svelte/transition";
	import { localizeHref } from "../../paraglide/runtime";

	let { data } = $props();

	let isLoggingIn: boolean = $state(true);
	let username: string = $state("");
	let email: string = $state("");
	let password: string = $state("");
	let repeatPassword: string = $state("");
	let agreementsChecked: boolean = $state(false);

	let emailInvalid: boolean = $derived(validateEmail(email));
	let actionButtonDisabled: boolean = $state(false);
	let buttonLoadingState: boolean = $state(false);

	let errorTitle: string = $state("");
	let errorDescription: string = $state("");

	let alertTitle: string = $state("");
	let alertDescription: string = $state("");

	let requiresMfa: boolean = $state(false);
	let mfaInvalid: boolean = $state(false);
	let mfaCode: string = $state("");

	let widgetId: string = "";

	// forces svelte to load the div before onMount
	let turnstileWidget: HTMLDivElement;

	let captchaToken: string = "";
	let captchaDone: boolean = $state(false);

	let accountNeedsEmailVerification: boolean = $state(false);
	let resendEmailClicked: boolean = $state(false);

	function validateEmail(email: string) {
		return !String(email)
			.toLowerCase()
			.match(
				/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
			);
	}

	function resetTurnstile() {
		consola.debug("Resetting captcha");
		captchaDone = false;
		// @ts-ignore
		turnstile.reset(widgetId);
	}

	function logIn() {
		login(username, password, captchaToken, mfaCode ? mfaCode : undefined)
			.catch(error => {
				buttonLoadingState = false;
				errorTitle = "Login failed";
				if (error instanceof AuthError || error instanceof UserError)
					errorDescription = "Username and password do not match.";
				else if (error instanceof PermissionError) {
					errorDescription = "Please verify your account";
					accountNeedsEmailVerification = true;
				} else if (error instanceof MFAError) {
					if (!requiresMfa) {
						errorTitle = "";
						errorDescription = "";
						requiresMfa = true;
						resetTurnstile();
						return;
					} else {
						errorDescription = "Invalid two-factor authentication code.";
					}
				} else if (error instanceof CaptchaError)
					errorDescription = "Please solve the captcha before continuing";
				else
					errorDescription =
						"There was an error while logging in. If this continues, please contact support.";
				consola.warn(errorDescription);

				resetTurnstile();
				throw new Error("Login failed");
			})
			.then(session => {
				// @ts-expect-error no types implemented for this
				const sessionId: string = session["auth-token"];
				window.gtag?.("event", "log_in");

				const date = new Date(Date.now() + 604800 * 1000).toUTCString();
				if (!getAuthToken()) {
					console.error("Browser did not accept cookies...");
				}
				Cookies.set("logged-in", "yes");
				setAuthToken(sessionId);
				localStorage.setItem("logged-in", "y");
				setTimeout(() => {
					// 3s timeout is for firefox, since an immediate redirect can cause a bug where localStorage doesnt save
					window.location.href = data.redirectURL ?? "/";
				}, 3000);
			});
	}

	function signUp() {
		register(username, password, email, captchaToken)
			.catch(error => {
				buttonLoadingState = false;
				errorTitle = "Sign up failed";
				if (error instanceof ConflictError) errorDescription = "Username is taken";
				if (error instanceof UserError) errorDescription = "Email is already in use";
				if (error instanceof CaptchaError)
					errorDescription = "Please solve the captcha before continuing";

				resetTurnstile();
				consola.warn(errorDescription);
				throw new Error("Signup failed");
			})
			.then(_ => {
				buttonLoadingState = false;
				window.gtag?.("event", "sign_up");
				alertTitle = "Successfully registered!";
				alertDescription = "Please log in.";

				isLoggingIn = true;
				resetTurnstile();
			});
	}

	onMount(() => {
		// if using synchronous loading, will be called once the DOM is ready
		//@ts-ignore
		turnstile.ready(function () {
			let container = document.getElementById("turnstile-container");

			if (container) {
				container.innerHTML = "";
			}
			// @ts-ignore
			widgetId = turnstile.render("#turnstile-container", {
				sitekey: "0x4AAAAAABiGbbOhSUc5vWl9",
				theme: $activeTheme,
				callback: function (token: string) {
					captchaToken = token;
					captchaDone = true;
					consola.info("Solved captcha");
				}
			});
		});

		if (data.referrerCode) {
			Cookies.set("referrer", data.referrerCode, { expires: 14 });
		}

		if (Number(data.statusCode) && Number(data.statusCode) !== 200) {
			consola.warn(`Login error ${data.statusCode}`);
			switch (Number(data.statusCode)) {
				case 460:
				case 465: {
					alertTitle = "Login failed";
					alertDescription = "Looks like you were signed out";
					break;
				}

				case 469: {
					errorTitle = "Login failed";
					errorDescription =
						"This email has already been linked to an existing account! Please connect your account in settings.";
					break;
				}
				default: {
					errorTitle = "An unhandled error occurred.";
					errorDescription =
						"There was an error while logging in. If this continues, please contact support.";
					break;
				}
			}

			const url = page.url;
			url.searchParams.delete("c");
			history.pushState({ data }, "", url.href);
		}
	});

	$effect(() => {
		if (!captchaDone) {
			consola.warn("Captcha not done...");
			actionButtonDisabled = true;
			return;
		}

		if (isLoggingIn) {
			if (!username || !password) actionButtonDisabled = true;
			else actionButtonDisabled = false;

			consola.debug(`Checking login...: ${actionButtonDisabled}`);
		} else {
			if (
				repeatPassword !== password ||
				!username ||
				!email ||
				emailInvalid ||
				!agreementsChecked
			)
				actionButtonDisabled = true;
			else actionButtonDisabled = false;
		}
	});
</script>

<svelte:head>
	<link
		rel="preload"
		href="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
		as="script" />
	<script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"></script>
</svelte:head>

<div class="login-holder bg-card m-auto mt-8 w-[100vw] max-w-[500px] rounded-lg p-8">
	<div class="flex flex-col">
		<img class="w-8" src={favicon} alt="logo" />
		<h1 class="text-3xl font-bold">
			{#if isLoggingIn}
				Log into your frii.site account
			{:else}
				Sign up for a frii.site account
			{/if}
		</h1>
	</div>
	<InlineAlert title={errorTitle} description={errorDescription} variant={"error"} />
	<InlineAlert title={alertTitle} description={alertDescription} variant={"note"} />
	{#if accountNeedsEmailVerification}
		<Button
			variant={"ghost"}
			class="mt-4"
			loading={resendEmailClicked}
			onclick={_ => {
				resendEmailClicked = true;
				resendEmail(username)
					.catch(_ => {
						resendEmailClicked = false;
						errorDescription = "Failed to send verification";
						throw new Error("Failed to send resend email");
					})
					.then(_ => {
						resendEmailClicked = false;
						alertTitle = "Please verify your account";
						alertDescription =
							"An email has been sent to your inbox. Please check your spam folder.";
					});
			}}>Resend email verification</Button>
	{/if}
	{#if requiresMfa}
		<div class="mfa-screen mt-12">
			<h2 class="text-2xl font-semibold">Two-factor authentication</h2>
			<p>Enter the verification code from your authenticator app.</p>
			<form>
				<InputOTP.Root
					bind:value={mfaCode}
					class="m-auto mt-8 w-fit"
					maxlength={6}
					pattern={REGEXP_ONLY_DIGITS}>
					{#snippet children({ cells })}
						<InputOTP.Group>
							{#each cells as cell (cell)}
								<InputOTP.Slot
									class="h-14 text-2xl"
									aria-invalid={mfaInvalid}
									cell={cell} />
							{/each}
						</InputOTP.Group>
					{/snippet}
				</InputOTP.Root>

				<Button
					onclick={() => {
						buttonLoadingState = true;
						logIn();
					}}
					loading={buttonLoadingState}
					disabled={!captchaDone || mfaCode.length != 6}
					type="submit"
					class="mt-4 w-full">Sign in</Button>
			</form>

			<a class="text-sm" href={localizeHref("/account/recover/2fa")}
				>Disable two-factor authentication with a backup code</a>
		</div>
	{:else}
		<form class="mt-6">
			<div class="flex flex-col gap-6">
				<div class="grid gap-2">
					<Label for="username">Username</Label>
					<Input
						bind:value={username}
						id="username"
						type="text"
						placeholder="username"
						required />

					{#if !isLoggingIn}
						<Label for="email">Email</Label>
						<Input
							aria-invalid={emailInvalid}
							bind:value={email}
							id="email"
							type="email"
							placeholder="user@gmail.com"
							required />
					{/if}
					<div class="flex h-4 items-center">
						<Label for="password">Password</Label>
						{#if isLoggingIn}
							<a
								tabindex="-1"
								transition:fade={{ duration: 100 }}
								href={localizeHref("/account/recover/")}
								class="ml-auto inline-block text-sm underline-offset-4 hover:underline">
								Forgot your password?
							</a>
						{/if}
					</div>
					<Input
						bind:value={password}
						id="password"
						type="password"
						placeholder="*********"
						required />
					{#if !isLoggingIn}
						<Label for="repeat-password">Confirm password</Label>
						<Input
							aria-invalid={!!repeatPassword && repeatPassword !== password}
							bind:value={repeatPassword}
							id="repeat-password"
							type="password"
							placeholder="*********"
							required />

						<div class="agreement flex">
							<Checkbox
								bind:checked={agreementsChecked}
								class="mr-2"
								id="agreements" />
							<Label for="agreements"
								>{@html 'I agree to the <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>'}</Label>
						</div>
					{/if}
				</div>
			</div>

			<Button
				onclick={() => {
					buttonLoadingState = true;
					isLoggingIn ? logIn() : signUp();
				}}
				loading={buttonLoadingState}
				disabled={!browser || actionButtonDisabled}
				type="submit"
				class="mt-4 w-full">{isLoggingIn ? "Sign in" : "Sign up"}</Button>
		</form>

		<a
			onclick={_ => (isLoggingIn = !isLoggingIn)}
			href="##"
			class="ml-auto inline-block text-sm underline-offset-4 hover:underline">
			{isLoggingIn ? "Sign up instead" : "Log in instead"}
		</a>
	{/if}
	{#if !requiresMfa}
		<Separator />
		<Button
			onclick={_ => {
				const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
				googleAuthUrl.searchParams.set(
					"client_id",
					"596305333437-5n6obnm72ir29vi3kier0csqb7redca2.apps.googleusercontent.com"
				);
				const redirectUrl = `${serverURL}/auth/google/callback`;

				googleAuthUrl.searchParams.set("redirect_uri", redirectUrl);
				googleAuthUrl.searchParams.set("response_type", "code");
				googleAuthUrl.searchParams.set("scope", "openid email profile");
				googleAuthUrl.searchParams.set(
					"state",
					JSON.stringify({
						url: window.origin,
						mode: "login",
						redirect: redirectUrl,
						referrer: data.referrerCode || Cookies.get("referrer")
					})
				);

				window.location.href = googleAuthUrl.toString();
			}}
			class="mt-2 w-full">Or continue with Google</Button>
	{/if}
</div>

<div bind:this={turnstileWidget} class="m-auto mt-6 w-fit" id="turnstile-container">
	<p>Loading captcha..</p>
</div>
