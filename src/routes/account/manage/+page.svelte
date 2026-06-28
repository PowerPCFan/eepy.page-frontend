<script lang="ts">
	import { dev } from "$app/environment";
	import { createFile, getAuthToken, redirectToLogin } from "$lib";
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import * as InputOTP from "$lib/components/ui/input-otp/index.js";
	import MaterialSymbolsLockOutline from "~icons/material-symbols/lock-outline";
	import MaterialSymbolsSmartphone from "~icons/material-symbols/smartphone";
	import {
		AuthError,
		CodeError,
		ConflictError,
		MFAError,
		ServerContactor,
		serverURL,
		UserError
	} from "../../../serverContactor";
	import type { Session } from "./+page";

	import { goto } from "$app/navigation";
	import { Button } from "$lib/components/ui/button";
	import Checkbox from "$lib/components/ui/checkbox/checkbox.svelte";
	import InlineAlert from "$lib/components/ui/inline-alert/inline-alert.svelte";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import QR from "@svelte-put/qr/img/QR.svelte";
	import { REGEXP_ONLY_DIGITS } from "bits-ui";
	import consola from "consola";
	import Cookies from "js-cookie";
	import { onMount } from "svelte";
	import { toast } from "svelte-sonner";
	import { fade } from "svelte/transition";
	import { UAParser } from "ua-parser-js";
	import MaterialSymbolsDesktopMac from "~icons/material-symbols/desktop-mac";

	let serverContactor: ServerContactor;

	let { data } = $props();
	let sessions: Session[] | undefined = $state(data.sessions);

	let mfaIsVerified: boolean = $state(false);
	let backupCodes: string[] = $state([]);
	let mfaUrl: string = $state("");
	let mfaCode: string = $state("");
	let mfaInvalid: boolean = $state(false);
	let usingBackupCode: boolean = $state(false);
	let deleteAccountChecked: boolean = $state(false);

	let mfaButtonLoading: boolean = $state(false);

	let dialogOpen: boolean = $state(false);
	let deleteOpen: boolean = $state(false);

	let referralCode: string = $state("");
	let referralInvalid: boolean = $state(false);
	let referralCreating: boolean = $state(false);

	let alertTitle = $state("");
	let alertDescription = $state("");
	let alertTrigger = $state(0);

	onMount(() => {
		serverContactor = new ServerContactor(getAuthToken() ?? null);
	});

	function mfaSetup() {
		consola.info("Starting MFA setup");
		// get backup codes & setup authenticator
		serverContactor
			.createMfaCode()
			.catch(error => {
				if (error instanceof AuthError) {
					redirectToLogin(460);
					return;
				}
				if (error instanceof ConflictError) {
					toast.error("Two-factor authentication is already enabled");
					return;
				}
				throw new Error("Failed to begin 2fa setup");
			})
			.then(data => {
				mfaUrl = data?.app_link!;
				backupCodes = data?.backup_codes!;
			});
	}

	function verifyMfa(code: string) {
		// verify that the user's authenticator app actually worked and scanned the qr properly
		serverContactor
			.verifyMfaCode(code)
			.catch(error => {
				mfaButtonLoading = false;
				if (error instanceof AuthError) {
					redirectToLogin(460);
					return;
				}
				if (error instanceof CodeError) {
					consola.warn("Invalid MFA code");
					toast.error("Invalid code", {
						description: "This code has either expired, or is invalid."
					});
					return;
				}
				if (error instanceof ConflictError) {
					consola.error("MFA code already exist. This shouldn't be able to happen");
				}
				throw new Error("Failed to verify code");
			})
			.then(_ => {
				mfaButtonLoading = false;
				toast.success("Successfully enabled two-factor authentication!", { duration: 9000 });
				mfaIsVerified = true;
			});
	}

	function removeMfa(code: string) {
		mfaInvalid = false;
		serverContactor
			.deleteMfaCode(usingBackupCode ? undefined : code, usingBackupCode ? code : undefined)
			.catch(error => {
				// loader.hide();
				consola.warn("Failed to remove MFA");

				mfaButtonLoading = false;
				mfaInvalid = true;
				if (error instanceof AuthError) {
					redirectToLogin(460);
					return;
				}
				if (error instanceof CodeError) {
					consola.warn("Invalid MFA code while removing MFA");
					toast.error("Invalid code", {
						description: "Please refresh and try again"
					});
					return;
				}

				toast.error("An unhandled error occurred.", {
					description: "Please contact support if this error persists."
				});
				throw new Error("Failed to verify code");
			})
			.then(_ => {
				mfaIsVerified = false;
				mfaButtonLoading = false;
				dialogOpen = false;
				toast.success("Two-factor authentication is now disabled");
			});
	}

	function handleDelete(mfaCode: string) {
		// sends an account deletion email to the user
		serverContactor
			.deleteAccount(mfaCode)
			.catch(err => {
				consola.warn("Failed to send account deletion email");
				mfaButtonLoading = false;

				if (err instanceof AuthError) redirectToLogin(460);
				else if (err instanceof MFAError) toast.error("Invalid two-factor authentication code.");
				else
					toast.error("Failed to delete your account", {
						description: "Please contact support if this error persists."
					});
				throw new Error("Failed to delete account");
			})
			.then(_ => {
				mfaButtonLoading = false;
				toast.success("Please check your email", {
					description:
						"A link to delete your account has been sent to your email. If you cannot find it, please check the spam folder",
					duration: 9000
				});
			});
	}
	function gpdrData() {
		// We don't store that much data so we can just fetch it from the server
		serverContactor.getGDPR().then(data => {
			createFile("data.json", JSON.stringify(data));
		});
	}
	function logOut(session?: Session) {
		// If session isn't specified, the user is logging themselves out
		consola.info("Logging out a session");
		serverContactor
			.logOut(session?.hash)
			.catch(err => {
				throw new Error(
					"Failed to delete session. Please file an issue report over on our github (PowerPCFan/eepy.page-frontend)"
				);
			})
			.then(_ => {
				consola.info("Succesfully logged session out");
				if (!session) {
					Cookies.remove("auth-token", { secure: !dev });
					localStorage.removeItem("logged-in");
					localStorage.removeItem("auth-token");
					redirectToLogin(200);
				} else {
					session.loading = false;
					sessions = sessions?.filter(sess => {
						return sess.hash !== session.hash;
					});
				}
			});
	}

	$effect(() => {
		usingBackupCode; // Since svelte5 doesnt let you declare dependencies $effect
		dialogOpen; // same with this
		mfaCode = "";
	});

	$effect(() => {
		if (referralCode.length > 50 || referralCode.length < 3) {
			referralInvalid = true;
		} else if (!/^[a-zA-Z0-9-]+$/.test(referralCode)) {
			referralInvalid = true;
		} else {
			referralInvalid = false;
		}
	});
</script>

<div class="account bg-card mt-16 mr-auto ml-auto w-11/12 max-w-5xl rounded-2xl p-6">
	<h1 class="text-3xl font-semibold">Hello, {data.username}!</h1>
	<p>Email: {data.email}</p>
	<h3 id="username">Username: {data.username}</h3>
	<div class="permission flex items-center">
		<MaterialSymbolsLockOutline />
		<p>Maximum domains:<strong>{data.maxDomains}</strong></p>
	</div>

	<div class="permission flex items-center">
		<MaterialSymbolsLockOutline />
		<p>
			Max subdomains:
			<strong>{data.maxSubdomains}</strong>
		</p>
	</div>

	<div class="mt-8">
		<h2 class="text-2xl font-semibold">Manage your account</h2>
		<div class="buttons space-y-1">
			{#if data.mfaEnabled}
				<Dialog.Root onOpenChange={open => (dialogOpen = open)} open={dialogOpen}>
					<Dialog.Trigger>
						<Button variant={"destructive"}>Remove two-factor authentication</Button>
					</Dialog.Trigger>
					<Dialog.Content>
						<Dialog.Header>
							<Dialog.Title>Disable two-factor authentication</Dialog.Title>
							<Dialog.Description>
								Enter your one-time code from your authenticator app
							</Dialog.Description>

							{#if usingBackupCode}
								<div class="space-y-2">
									<Label for="backup-code">Use a backup code</Label>
									<Input bind:value={mfaCode} id="backup-code" />
								</div>
							{:else}
								<InputOTP.Root
									bind:value={mfaCode}
									class="m-auto mt-8 w-fit"
									maxlength={6}
									pattern={REGEXP_ONLY_DIGITS}>
									{#snippet children({ cells })}
										<InputOTP.Group>
											{#each cells as cell (cell)}
												<InputOTP.Slot
													class="h-16 text-2xl"
													aria-invalid={mfaInvalid}
													cell={cell} />
											{/each}
										</InputOTP.Group>
									{/snippet}
								</InputOTP.Root>
							{/if}

							<Button
								onclick={_ => (usingBackupCode = !usingBackupCode)}
								variant={"ghost"}
								>{#if usingBackupCode}Use authenticator app{:else}Use a backup code{/if}</Button>
						</Dialog.Header>

						<Dialog.Footer>
							<Button
								loading={mfaButtonLoading}
								onclick={_ => {
									mfaButtonLoading = true;
									removeMfa(mfaCode);
								}}
								disabled={(!usingBackupCode && mfaCode.length != 6) ||
									(usingBackupCode && mfaCode.length < 16)}
								variant={"destructive"}>Disable 2FA</Button>
						</Dialog.Footer>
					</Dialog.Content>
				</Dialog.Root>
			{:else}
				<Dialog.Root onOpenChange={open => (dialogOpen = open)} open={dialogOpen}>
					<Dialog.Trigger>
						<Button onclick={_ => mfaSetup()}>Enable two-factor authentication</Button>
					</Dialog.Trigger>
					<Dialog.Content>
						<Dialog.Header>
							{#if !mfaUrl}
								<Dialog.Title>Please wait...</Dialog.Title>
								<Dialog.Description>Starting two-factor authentication setup</Dialog.Description>
							{:else}
								<Dialog.Title>Setup 2Fa</Dialog.Title>
								{#if !mfaIsVerified}
									<Dialog.Description>
										Scan this QR code in your authenticator app
									</Dialog.Description>

									<QR backgroundFill="white" data={mfaUrl} />
									<Button href={mfaUrl} variant={"link"}
										>Or alternatively, use this link</Button>

									<h2 class="text-xl font-semibold">
										Now enter your 2FA code
									</h2>

									<InputOTP.Root
										bind:value={mfaCode}
										class="m-auto w-fit"
										maxlength={6}
										pattern={REGEXP_ONLY_DIGITS}>
										{#snippet children({ cells })}
											<InputOTP.Group>
												{#each cells as cell (cell)}
													<InputOTP.Slot
														class="h-16 text-2xl"
														aria-invalid={mfaInvalid}
														cell={cell} />
												{/each}
											</InputOTP.Group>
										{/snippet}
									</InputOTP.Root>
								{:else}
									<h2 class="text-xl font-semibold">
										Please save these backup codes somewhere safe. If you get locked out, you cannot recover your account without these.
									</h2>
									<ul class="list-disc [&>li]:ml-8">
										{#each backupCodes as code}
											<li>{code}</li>
										{/each}
									</ul>
								{/if}
							{/if}
						</Dialog.Header>

						<Dialog.Footer>
							{#if !mfaIsVerified}
								<Button
									loading={mfaButtonLoading}
									onclick={_ => {
										mfaButtonLoading = true;
										verifyMfa(mfaCode);
									}}
									disabled={mfaCode.length != 6}>Enable two-factor authentication</Button>
							{/if}
						</Dialog.Footer>
					</Dialog.Content>
				</Dialog.Root>
			{/if}
			<Dialog.Root onOpenChange={open => (deleteOpen = open)} open={deleteOpen}>
				<Dialog.Trigger>
					<Button variant={"destructive"}>Delete your account</Button>
				</Dialog.Trigger>
				<Dialog.Content>
					<Dialog.Header>
						<Dialog.Title>Delete your account</Dialog.Title>
						{#if data.mfaEnabled}
							<Dialog.Description>
								Enter your one-time code from your authenticator app
							</Dialog.Description>

							{#if usingBackupCode}
								<div class="space-y-2">
									<Label for="backup-code">Use a backup code</Label>
									<Input bind:value={mfaCode} id="backup-code" />
								</div>
							{:else}
								<InputOTP.Root
									bind:value={mfaCode}
									class="m-auto mt-8 w-fit"
									maxlength={6}
									pattern={REGEXP_ONLY_DIGITS}>
									{#snippet children({ cells })}
										<InputOTP.Group>
											{#each cells as cell (cell)}
												<InputOTP.Slot
													class="h-16 text-2xl"
													aria-invalid={mfaInvalid}
													cell={cell} />
											{/each}
										</InputOTP.Group>
									{/snippet}
								</InputOTP.Root>
							{/if}

							<Button
								onclick={_ => (usingBackupCode = !usingBackupCode)}
								variant={"ghost"}
								>{#if usingBackupCode}Use authenticator app{:else}Use a backup code{/if}</Button>
						{/if}
					</Dialog.Header>

					<Dialog.Footer>
						<div class="space-y-2">
							<p class="text-sm">
								This is a destructive action which cannot be undone. Are you sure you want
								to continue?
							</p>
							<div class="flex space-x-2">
								<Checkbox bind:checked={deleteAccountChecked} id="understand" />
								<Label for="understand">
									I understand the consequences, and I would like to continue
								</Label>
							</div>
						</div>
						<Button
							loading={mfaButtonLoading}
							onclick={_ => {
								mfaButtonLoading = true;
								handleDelete(mfaCode);
							}}
							disabled={!deleteAccountChecked ||
								(data.mfaEnabled &&
									((!usingBackupCode && mfaCode.length != 6) ||
										(usingBackupCode && mfaCode.length < 16)))}
							variant={"destructive"}>Delete your account</Button>
					</Dialog.Footer>
				</Dialog.Content>
			</Dialog.Root>
			{#if data.permissions?.get("admin") === true}
				<Button onclick={_ => goto("/account/admin")}>Admin dashboard</Button>
			{/if}
			{#if !data.googleLinked}
				<Button
					onclick={async () => {
						await serverContactor.getOAuthLinkingCode().then(data => {
							const googleAuthUrl = new URL(
								"https://accounts.google.com/o/oauth2/v2/auth"
							);
							googleAuthUrl.searchParams.set(
								"client_id",
								"596305333437-5n6obnm72ir29vi3kier0csqb7redca2.apps.googleusercontent.com"
							);
							const redirectUrl = `${serverURL}/auth/google/callback`;
							googleAuthUrl.searchParams.set("redirect_uri", redirectUrl);
							googleAuthUrl.searchParams.set("response_type", "code");
							googleAuthUrl.searchParams.set("scope", "openid email profile");

							console.log(data);
							googleAuthUrl.searchParams.set(
								"state",
								JSON.stringify({
									url: window.origin,
									mode: "link",
									"linking-code": data["code"],
									redirect: redirectUrl
								})
							);

							window.location.href = googleAuthUrl.toString();
						});
					}}>Link Google account</Button>
			{/if}
			<Button onclick={_ => gpdrData()}>Download your data</Button>
			<Button onclick={_ => goto("/api/dashboard")}
				>Manage your API keys</Button>
			<Button variant={"secondary"} onclick={_ => logOut()}>Log out</Button>
		</div>
	</div>

	<InlineAlert variant={"error"} title={alertTitle} description={alertDescription} />
	<div class="referrals mt-4 space-y-2">
		<h1 class="text-2xl font-semibold">Referrals</h1>
		{#if data.referralCode}
			{@const link = `${window.origin}/login?ref=${data.referralCode}`}
			<div>
				<h2 class="bg-background w-fit rounded-md p-2 text-xl font-semibold">
					{data.referralCode}
				</h2>
				<a class="ml-4" href={link}>{link}</a>
				<p class="ml-4">Referred users: {data.referredPeople}</p>
			</div>
		{:else}
			<div class="space-y-2">
				<Label for="referral">Custom referral code</Label>
				<Input
					disabled={referralCreating}
					bind:value={referralCode}
					maxlength={50}
					aria-invalid={referralInvalid}
					class="max-w-96"
					id="referral"
					placeholder="referral-code" />
			</div>
			<Button
				onclick={() => {
					referralCreating = true;

					serverContactor
						.createReferral(referralCode)
						.catch(err => {
							if (err instanceof UserError || err instanceof TypeError) {
								alertTitle = "An unhandled error occurred.";
								alertDescription = "Please contact support if this error persists.";
							} else if (err instanceof CodeError) {
								alertTitle = "Failed to create a referral code";
								alertDescription = "Referral code already exists!";
							}
							alertTrigger++;
							referralCreating = false;

							return;
						})
						.then(_ => {
							window.location.reload();
							referralCreating = false;
						});
				}}
				loading={referralCreating}>Create</Button>
		{/if}
	</div>

	<div class="mt-4 space-y-4">
		{#each sessions as session}
			{@const ua = new UAParser(session.user_agent)}
			{@const expires = new Date(session.expires * 1000)}
			<div
				transition:fade={{ duration: 100 }}
				class="session bg-popover w-full max-w-96 rounded-xl p-4">
				<div class="device flex items-center">
					{#if ua.getDevice().type === "mobile"}
						<MaterialSymbolsSmartphone class="text-foreground/70 text-4xl" />
					{:else}
						<MaterialSymbolsDesktopMac class="text-foreground/70 text-4xl" />
					{/if}
					<h1 class="text-2xl font-semibold">
						{ua.getOS().name}
					</h1>
					<h2 class="ml-2 text-xl font-medium">
						{ua.getBrowser().name}
						{ua.getBrowser().version}
					</h2>
				</div>
				<p>
					Expires: {expires.toLocaleString()}
				</p>
				<div class="footer flex items-center justify-between">
					<Button
						loading={session.loading}
						onclick={_ => {
							session.loading = true;
							logOut(session);
						}}
						variant={"destructive"}>Log out</Button>
					<p class="mt-auto mb-0 text-right opacity-50">{session.ip}</p>
				</div>
			</div>
		{/each}
	</div>
</div>
