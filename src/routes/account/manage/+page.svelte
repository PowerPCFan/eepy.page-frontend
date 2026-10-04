<script lang="ts">
    import { dev } from "$app/environment";
    import { createFile, formatLocalDateTime, getAuthToken, redirectToLogin } from "$lib";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import * as InputOTP from "$lib/components/ui/input-otp/index.js";
    import MaterialSymbolsLockOutline from "~icons/material-symbols/lock-outline";
    import MaterialSymbolsSmartphone from "~icons/material-symbols/smartphone";
    import MaterialSymbolsDesktopMac from "~icons/material-symbols/desktop-mac";
    import MaterialSymbolsSecurity from "~icons/material-symbols/security";
    import MaterialSymbolsLogin from "~icons/material-symbols/login";
    import {
        AuthError,
        CodeError,
        ConflictError,
        MFAError,
        RateLimitError,
        ServerContactor,
        UserError,
    } from "../../../serverContactor";
    import type { Session } from "./+page";

    import { goto } from "$app/navigation";
    import { Button } from "$lib/components/ui/button";
    import Checkbox from "$lib/components/ui/checkbox/checkbox.svelte";
    import InlineAlert from "$lib/components/ui/inline-alert/inline-alert.svelte";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { Separator } from "$lib/components/ui/separator";
    import QR from "@svelte-put/qr/img/QR.svelte";
    import { REGEXP_ONLY_DIGITS } from "bits-ui";
    import copy from "clipboard-copy";
    import consola from "consola";
    import Cookies from "js-cookie";
    import { onMount } from "svelte";
    import { toast } from "svelte-sonner";
    import { fade } from "svelte/transition";
    import { UAParser } from "ua-parser-js";
    import { Codeblock } from "$lib/components/ui/codeblock";

    let serverContactor: ServerContactor;

    let { data } = $props();
    let sessions: Session[] | undefined = $state(undefined);

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

    function showRateLimitError(error: unknown) {
        if (!(error instanceof RateLimitError)) return false;

        alertTitle = error.title;
        alertDescription = error.message;
        alertTrigger++;
        return true;
    }

    onMount(() => {
        serverContactor = new ServerContactor(getAuthToken() ?? null);
    });

    function getSecretKey(url: string): string {
        if (!url) return "";
        try {
            if (url.startsWith("otpauth://")) {
                const parsed = new URL(url);
                return parsed.searchParams.get("secret") || "";
            }
        } catch {
            // ignore
        }
        const match = url.match(/[?&]secret=([^&]+)/i);
        if (match) return match[1];
        return url;
    }

    function formatSecretKey(secret: string): string {
        if (!secret) return "";
        const clean = secret.replace(/\s+/g, "").toLowerCase();
        return clean.match(/.{1,4}/g)?.join(" ") || clean;
    }

    let secretKey = $derived(formatSecretKey(getSecretKey(mfaUrl)));

    async function mfaSetup() {
        consola.info("Starting MFA setup");
        mfaUrl = "";
        backupCodes = [];
        mfaCode = "";
        mfaInvalid = false;
        mfaIsVerified = false;
        try {
            const res = await serverContactor.createMfaCode();
            if (res) {
                mfaUrl = res.app_link;
                backupCodes = res.backup_codes;
            }
        } catch (error) {
            if (showRateLimitError(error)) return;
            if (error instanceof AuthError) {
                redirectToLogin(460);
                return;
            }
            if (error instanceof ConflictError) {
                toast.error("Two-factor authentication is already enabled");
                return;
            }
            toast.error("Failed to begin 2FA setup");
        }
    }

    async function verifyMfa(code: string) {
        // verify that the user's authenticator app actually worked and scanned the qr properly
        mfaInvalid = false;
        mfaButtonLoading = true;
        try {
            await serverContactor.verifyMfaCode(code);
            mfaButtonLoading = false;
            toast.success("Successfully enabled two-factor authentication!", { duration: 9000 });
            mfaIsVerified = true;
            data.mfaEnabled = true;
        } catch (error) {
            mfaButtonLoading = false;
            mfaInvalid = true;
            if (showRateLimitError(error)) return;
            if (error instanceof AuthError) {
                redirectToLogin(460);
                return;
            }
            if (error instanceof CodeError) {
                consola.warn("Invalid MFA code");
                toast.error("Invalid code", {
                    description: "This code has either expired, or is invalid.",
                });
                return;
            }
            if (error instanceof ConflictError) {
                consola.error("MFA code already exists. This shouldn't be able to happen");
                toast.error("Two-factor authentication is already enabled");
                return;
            }
            toast.error("Failed to verify code");
        }
    }

    async function removeMfa(code: string) {
        mfaInvalid = false;
        mfaButtonLoading = true;
        try {
            await serverContactor.deleteMfaCode(
                usingBackupCode ? undefined : code,
                usingBackupCode ? code : undefined
            );
            mfaIsVerified = false;
            mfaButtonLoading = false;
            dialogOpen = false;
            data.mfaEnabled = false;
            toast.success("Two-factor authentication is now disabled");
        } catch (error) {
            consola.warn("Failed to remove MFA");
            mfaButtonLoading = false;
            mfaInvalid = true;
            if (showRateLimitError(error)) return;
            if (error instanceof AuthError) {
                redirectToLogin(460);
                return;
            }
            if (error instanceof CodeError) {
                consola.warn("Invalid MFA code while removing MFA");
                toast.error("Invalid code", {
                    description: "Please refresh and try again",
                });
                return;
            }
            toast.error("An unhandled error occurred.", {
                description: "Please contact support if this error persists.",
            });
        }
    }

    async function handleDelete(mfaCode: string) {
        // sends an account deletion email to the user
        mfaButtonLoading = true;
        try {
            await serverContactor.deleteAccount(mfaCode);
            mfaButtonLoading = false;
            toast.success("Please check your email", {
                description:
                    "A link to delete your account has been sent to your email. If you cannot find it, please check the spam folder",
                duration: 9000,
            });
        } catch (err) {
            consola.warn("Failed to send account deletion email");
            mfaButtonLoading = false;
            mfaInvalid = true;
            if (showRateLimitError(err)) return;
            if (err instanceof AuthError) redirectToLogin(460);
            else if (err instanceof MFAError) toast.error("Invalid two-factor authentication code.");
            else
                toast.error("Failed to delete your account", {
                    description: "Please contact support if this error persists.",
                });
        }
    }

    async function gpdrData() {
        try {
            const data = await serverContactor.getGDPR();
            createFile("data.json", JSON.stringify(data));
        } catch {
            toast.error("Failed to download your data");
        }
    }

    async function logOut(session?: Session) {
        consola.info("Logging out a session");
        try {
            await serverContactor.logOut(session?.hash);
            consola.info("successfully logged session out");
            if (!session) {
                Cookies.remove("__Host-auth-token", {
                    secure: !dev,
                    path: "/",
                    sameSite: "Strict",
                });
                localStorage.removeItem("logged-in");
                localStorage.removeItem("auth-token");
                redirectToLogin(200);
            } else {
                session.loading = false;
                sessions = sessions?.filter(sess => {
                    return sess.hash !== session.hash;
                });
            }
        } catch (err) {
            if (showRateLimitError(err)) return;
            toast.error("Failed to log out session");
        }
    }

    $effect(() => {
        usingBackupCode; // Since svelte5 doesnt let you declare dependencies $effect
        dialogOpen; // same with this
        mfaCode = "";
        mfaInvalid = false;
    });

    $effect(() => {
        sessions = data.sessions;
    });

    $effect(() => {
        mfaCode;
        if (mfaInvalid) {
            mfaInvalid = false;
        }
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

<svelte:head>
    <title>Manage your account | eepy.page</title>
</svelte:head>

<div class="account bg-card mt-16 mr-auto ml-auto w-11/12 max-w-5xl overflow-x-auto rounded-2xl p-6">
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

                            <Button onclick={_ => (usingBackupCode = !usingBackupCode)} variant={"ghost"}
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
                    <Dialog.Content class="sm:max-w-xl">
                        {#if mfaIsVerified}
                            <Dialog.Header>
                                <Dialog.Title class="text-xl font-bold">Two-Factor Authentication Enabled</Dialog.Title>
                                <Dialog.Description>
                                    Please save these backup codes somewhere safe. If you get locked out, you cannot
                                    recover your account without these.
                                </Dialog.Description>
                            </Dialog.Header>

                            <div class="my-2 rounded-lg border bg-muted/40 p-4">
                                <div class="grid grid-cols-2 gap-2 font-mono text-sm">
                                    {#each backupCodes as code}
                                        <div class="bg-background/80 rounded border border-border px-2 py-1 text-center font-semibold select-all">
                                            {code}
                                        </div>
                                    {/each}
                                </div>
                            </div>

                            <Dialog.Footer class="flex flex-col gap-2 sm:flex-row">
                                <Button
                                    variant={"outline"}
                                    onclick={() => {
                                        copy(backupCodes.join("\n"));
                                        toast.success("Backup codes copied to clipboard!");
                                    }}>
                                    Copy codes
                                </Button>
                                <Button onclick={() => (dialogOpen = false)}>Done</Button>
                            </Dialog.Footer>
                        {:else if !mfaUrl}
                            <Dialog.Header>
                                <Dialog.Title class="text-xl font-bold">Enable two-factor authentication</Dialog.Title>
                                <Dialog.Description>Make your account safer in just 3 easy steps:</Dialog.Description>
                            </Dialog.Header>
                            <div class="flex flex-col items-center justify-center gap-3 py-12">
                                <div class="border-primary size-6 animate-spin rounded-full border-2 border-t-transparent"></div>
                                <span class="text-muted-foreground text-sm">Starting two-factor authentication setup...</span>
                            </div>
                        {:else}
                            <Dialog.Header>
                                <Dialog.Title class="text-xl font-bold">Enable two-factor authentication</Dialog.Title>
                                <Dialog.Description>Make your account safer in just 3 simple steps:</Dialog.Description>
                            </Dialog.Header>

                            <div class="flex flex-col gap-4 py-2">
                                <div class="flex items-center gap-4">
                                    <div class="size-24 shrink-0 sm:size-28 flex items-center justify-center">
                                        <MaterialSymbolsSecurity class="w-3/4 h-auto" />
                                    </div>
                                    <div class="flex-1 space-y-1">
                                        <h3 class="text-foreground text-sm font-semibold leading-tight sm:text-base">
                                            Download an authenticator app
                                        </h3>
                                        <p class="text-muted-foreground text-xs leading-snug sm:text-sm">
                                            Download and install an authenticator app of your choice, such as 
                                            <a
                                                href="https://support.google.com/accounts/answer/1066447"
                                                target="_blank"
                                                rel="noreferrer"
                                                class="text-primary font-medium hover:underline">Google Authenticator</a> (available for iOS and Android).
                                        </p>
                                    </div>
                                </div>

                                <Separator class="bg-border/60" />

                                <div class="flex items-center gap-4">
                                    <div class="size-24 shrink-0 sm:size-28 flex items-center justify-center overflow-hidden p-1 bg-white rounded-sm">
                                        <QR backgroundFill="white" data={mfaUrl} class="size-full" />
                                    </div>
                                    <div class="min-w-0 flex-1 space-y-1">
                                        <h3 class="text-foreground text-sm font-semibold leading-tight sm:text-base">
                                            Scan the QR code
                                        </h3>
                                        <p class="text-muted-foreground text-xs leading-snug sm:text-sm">
                                            Open your authenticator app and scan the QR code to the left using your phone's camera.
                                        </p>
                                        <div class="pt-1">
                                            <h4 class="text-foreground text-xs font-semibold">
                                                Or, manually enter the TOTP key:
                                            </h4>
                                            <Codeblock variant="inline" scrollbar="none" class="text-muted-foreground font-mono text-xs tracking-wider break-all select-all" text={secretKey || mfaUrl}/>
                                        </div>
                                    </div>
                                </div>

                                <Separator class="bg-border/60" />

                                <div class="flex items-center gap-4">
                                    <div class="size-24 shrink-0 sm:size-28 flex items-center justify-center">
                                        <MaterialSymbolsLogin class="w-3/4 h-auto" />
                                    </div>
                                    <div class="min-w-0 flex-1 space-y-1">
                                        <h3 class="text-foreground text-sm font-semibold leading-tight sm:text-base">
                                            Log in with your code
                                        </h3>
                                        <p class="text-muted-foreground text-xs leading-snug sm:text-sm">
                                            Enter the 6-digit verification code, generated by your authenticator app.
                                        </p>
                                        <div class="flex flex-wrap items-center gap-3 pt-2">
                                            <InputOTP.Root bind:value={mfaCode} maxlength={6} pattern={REGEXP_ONLY_DIGITS}>
                                                {#snippet children({ cells })}
                                                    <InputOTP.Group>
                                                        {#each cells as cell (cell)}
                                                            <InputOTP.Slot
                                                                class="h-8 w-6 text-base font-semibold sm:h-9 sm:w-7"
                                                                aria-invalid={mfaInvalid}
                                                                cell={cell}
                                                            />
                                                        {/each}
                                                    </InputOTP.Group>
                                                {/snippet}
                                            </InputOTP.Root>

                                            <Button
                                                loading={mfaButtonLoading}
                                                disabled={mfaCode.length !== 6}
                                                onclick={() => {
                                                    mfaButtonLoading = true;
                                                    verifyMfa(mfaCode);
                                                }}>
                                                Activate
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        {/if}
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

                            <Button onclick={_ => (usingBackupCode = !usingBackupCode)} variant={"ghost"}
                                >{#if usingBackupCode}Use authenticator app{:else}Use a backup code{/if}</Button>
                        {/if}
                    </Dialog.Header>

                    <Dialog.Footer>
                        <div class="space-y-2">
                            <p class="text-sm">
                                This is a destructive action which cannot be undone. Are you sure you want to continue?
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
            {#if data.admin?.enabled === true}
                <Button onclick={_ => goto("/account/admin")}>Admin dashboard</Button>
            {/if}
            <Button onclick={_ => gpdrData()}>Download your data</Button>
            <Button onclick={_ => goto("/api/dashboard")}>Manage your API keys</Button>
            <Button variant={"secondary"} onclick={_ => logOut()}>Log out</Button>
        </div>
    </div>

    <InlineAlert
        variant={"error"}
        title={alertTitle}
        description={alertDescription}
        trigger={alertTrigger} />
    <div class="referrals mt-4 space-y-2">
        <div>
            <h1 class="text-2xl font-semibold">Referrals</h1>
            <p class="text-sm text-muted-foreground">
                Earn an extra domain for every 2 people who sign up with your link (up to 5 bonus domains max).
            </p>
        </div>
        {#if data.referralCode}
            {@const link = `${window.origin}/login?ref=${data.referralCode}`}
            <div class="overflow-x-auto">
                <h2 class="bg-background w-fit rounded-md p-2 text-xl font-semibold">
                    {data.referralCode}
                </h2>
                <a class="ml-4 break-all" href={link}>{link}</a>
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
                onclick={async () => {
                    referralCreating = true;
                    try {
                        await serverContactor.createReferral(referralCode);
                        window.location.reload();
                    } catch (err) {
                        if (showRateLimitError(err)) return;
                        if (err instanceof UserError || err instanceof TypeError) {
                            alertTitle = "An unhandled error occurred.";
                            alertDescription = "Please contact support if this error persists.";
                        } else if (err instanceof CodeError) {
                            alertTitle = "Failed to create a referral code";
                            alertDescription = "Referral code already exists!";
                        }
                        alertTrigger++;
                    } finally {
                        referralCreating = false;
                    }
                }}
                loading={referralCreating}>Create</Button>
        {/if}
    </div>

    <div class="mt-4 space-y-4">
        {#each sessions as session}
            {@const ua = new UAParser(session.user_agent)}
            {@const expires = new Date(session.expires * 1000)}
            <div transition:fade={{ duration: 100 }} class="session bg-popover w-full max-w-96 rounded-xl p-4">
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
                    Expires: {formatLocalDateTime(expires)}
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
