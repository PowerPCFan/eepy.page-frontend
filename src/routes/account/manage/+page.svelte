<script lang="ts">
    import { dev } from "$app/environment";
    import { AUTH_COOKIE_NAME, createFile, formatLocalDateTime, getAuthToken, redirectToLogin } from "$lib";
    import { Button } from "$lib/components/ui/button";
    import * as Card from "$lib/components/ui/card";
    import Checkbox from "$lib/components/ui/checkbox/checkbox.svelte";
    import { Codeblock } from "$lib/components/ui/codeblock";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import InlineAlert from "$lib/components/ui/inline-alert/inline-alert.svelte";
    import { Input } from "$lib/components/ui/input";
    import * as InputOTP from "$lib/components/ui/input-otp/index.js";
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
    import MaterialSymbolsAdminPanelSettings from "~icons/material-symbols/admin-panel-settings";
    import MaterialSymbolsLink from "~icons/material-symbols/link";
    import MaterialSymbolsGift from "~icons/material-symbols/featured-seasonal-and-gifts";
    import MaterialSymbolsCheckCircle from "~icons/material-symbols/check-circle";
    import MaterialSymbolsContentCopy from "~icons/material-symbols/content-copy";
    import MaterialSymbolsMonitor from "~icons/material-symbols/monitor-outline";
    import MaterialSymbolsDownload from "~icons/material-symbols/download";
    import MaterialSymbolsKey from "~icons/material-symbols/key";
    import MaterialSymbolsLogin from "~icons/material-symbols/login";
    import MaterialSymbolsLogout from "~icons/material-symbols/logout";
    import MaterialSymbolsOpenInNew from "~icons/material-symbols/open-in-new";
    import MaterialSymbolsPersonOutline from "~icons/material-symbols/person-outline";
    import MaterialSymbolsSecurity from "~icons/material-symbols/security";
    import MaterialSymbolsSmartphone from "~icons/material-symbols/smartphone";
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

    type Tab = "profile" | "security" | "sessions" | "referrals";

    let serverContactor: ServerContactor;

    let { data } = $props();
    let sessions: Session[] | undefined = $state(undefined);
    let activeTab: Tab = $state("profile");

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

        const hash = window.location.hash.replace("#", "") as Tab;
        if (["profile", "security", "sessions", "referrals"].includes(hash)) {
            activeTab = hash;
        }

        const handleHashChange = () => {
            const h = window.location.hash.replace("#", "") as Tab;
            if (["profile", "security", "sessions", "referrals"].includes(h)) {
                activeTab = h;
            }
        };

        window.addEventListener("hashchange", handleHashChange);
        return () => window.removeEventListener("hashchange", handleHashChange);
    });

    function setTab(tab: Tab) {
        activeTab = tab;
        window.location.hash = tab;
    }

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
    let bonusDomainsEarned = $derived(Math.min(5, Math.floor((data.referredPeople || 0) / 2)));

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

    async function gdprData() {
        try {
            const res = await serverContactor.getGDPR();
            createFile("data.json", JSON.stringify(res));
            toast.success("Data export downloaded successfully");
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
                Cookies.remove(AUTH_COOKIE_NAME, {
                    secure: !dev,
                    path: "/",
                    sameSite: "Strict",
                });
                if (dev) {
                    Cookies.remove("auth-token", { path: "/" });
                }
                localStorage.removeItem("logged-in");
                localStorage.removeItem("auth-token");
                redirectToLogin(200);
            } else {
                session.loading = false;
                sessions = sessions?.filter(sess => sess.hash !== session.hash);
                toast.success("Session logged out");
            }
        } catch (err) {
            if (showRateLimitError(err)) return;
            toast.error("Failed to log out session");
        }
    }

    $effect(() => {
        usingBackupCode;
        if (!dialogOpen) {
            mfaCode = "";
            mfaInvalid = false;
        }
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
    <title>Account Settings | eepy.page</title>
</svelte:head>

<div class="mx-auto w-11/12 max-w-6xl py-8 sm:py-12">
    <div class="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
            <h1 class="text-3xl font-bold tracking-tight text-foreground">Account Settings</h1>
            <p class="text-sm text-muted-foreground">Manage your profile, security preferences, and more</p>
        </div>
    </div>

    <InlineAlert
        variant={"error"}
        title={alertTitle}
        description={alertDescription}
        trigger={alertTrigger} />

    <div class="mt-6 grid grid-cols-1 gap-8 md:grid-cols-12">
        <aside class="md:col-span-4 lg:col-span-3">
            <nav class="flex flex-row gap-1 overflow-x-auto pb-2 md:flex-col md:overflow-visible md:pb-0">
                <button
                    onclick={() => setTab("profile")}
                    class="flex items-center justify-between gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all {activeTab === 'profile' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-foreground/80 hover:bg-muted hover:text-foreground'}">
                    <div class="flex items-center gap-2.5">
                        <MaterialSymbolsPersonOutline class="size-5 shrink-0" />
                        <span>Account</span>
                    </div>
                </button>

                <button
                    onclick={() => setTab("security")}
                    class="flex items-center justify-between gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all {activeTab === 'security' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-foreground/80 hover:bg-muted hover:text-foreground'}">
                    <div class="flex items-center gap-2.5">
                        <MaterialSymbolsSecurity class="size-5 shrink-0" />
                        <span>Privacy & Security</span>
                    </div>
                </button>

                <button
                    onclick={() => setTab("sessions")}
                    class="flex items-center justify-between gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all {activeTab === 'sessions' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-foreground/80 hover:bg-muted hover:text-foreground'}">
                    <div class="flex items-center gap-2.5">
                        <MaterialSymbolsMonitor class="size-5 shrink-0" />
                        <span>Sessions</span>
                    </div>
                </button>

                <button
                    onclick={() => setTab("referrals")}
                    class="flex items-center justify-between gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all {activeTab === 'referrals' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-foreground/80 hover:bg-muted hover:text-foreground'}">
                    <div class="flex items-center gap-2.5">
                        <MaterialSymbolsLink class="size-5 shrink-0" />
                        <span>Referrals</span>
                    </div>
                    {#if (data.referredPeople ?? 0) > 0}
                        <span class="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold text-primary">{data.referredPeople}</span>
                    {/if}
                </button>

                <div class="my-3 hidden md:block">
                    <Separator class="bg-border" />
                </div>

                <div class="hidden flex-col gap-1 md:flex">
                    <p class="px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Resources</p>
                    <a
                        href="/api/dashboard"
                        target="_blank"
                        class="flex items-center justify-between gap-2.5 rounded-lg px-3.5 py-2 text-sm text-muted-foreground transition-all hover:bg-muted hover:text-foreground">
                        <div class="flex items-center gap-2">
                            <MaterialSymbolsKey class="size-4 shrink-0" />
                            <span>API Keys</span>
                        </div>
                        <MaterialSymbolsOpenInNew class="size-3.5 opacity-60" />
                    </a>

                    {#if data.admin?.enabled === true}
                        <a
                            href="/account/admin"
                            class="flex items-center justify-between gap-2.5 rounded-lg px-3.5 py-2 text-sm text-muted-foreground transition-all hover:bg-muted hover:text-foreground">
                            <div class="flex items-center gap-2">
                                <MaterialSymbolsAdminPanelSettings class="size-4 shrink-0" />
                                <span>Admin Panel</span>
                            </div>
                            <MaterialSymbolsOpenInNew class="size-3.5 opacity-60" />
                        </a>
                    {/if}

                    <button
                        onclick={() => logOut()}
                        class="mt-2 flex w-full items-center gap-2.5 rounded-lg px-3.5 py-2 text-left text-sm text-destructive transition-all hover:bg-destructive/10">
                        <MaterialSymbolsLogout class="size-4 shrink-0" />
                        <span>Log out</span>
                    </button>
                </div>
            </nav>
        </aside>

        <main class="space-y-6 md:col-span-8 lg:col-span-9">
            {#if activeTab === "profile"}
                <div transition:fade={{ duration: 150 }} class="space-y-6">
                    <Card.Root>
                        <Card.Header>
                            <Card.Title>Account Information</Card.Title>
                        </Card.Header>
                        <Card.Content class="space-y-4">
                            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div class="space-y-1.5">
                                    <Label class="text-xs text-muted-foreground">Username</Label>
                                    <div class="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-3.5 py-2 text-sm font-medium">
                                        <span>{data.username}</span>
                                    </div>
                                </div>
                                <div class="space-y-1.5">
                                    <Label class="text-xs text-muted-foreground">Email Address</Label>
                                    <div class="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-3.5 py-2 text-sm font-medium">
                                        <span class="truncate">{data.email}</span>
                                    </div>
                                </div>
                            </div>
                        </Card.Content>
                    </Card.Root>

                    <Card.Root>
                        <Card.Header>
                            <Card.Title>Resource Limits & Quotas</Card.Title>
                        </Card.Header>
                        <Card.Content>
                            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div class="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-xs">
                                    <div class="space-y-1">
                                        <p class="text-xs font-medium text-muted-foreground">Maximum Domains</p>
                                        <p class="text-2xl font-bold text-foreground">{data.maxDomains}</p>
                                        <p class="text-xs text-muted-foreground">Amount of domains you can register</p>
                                    </div>
                                </div>

                                <div class="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-xs">
                                    <div class="space-y-1">
                                        <p class="text-xs font-medium text-muted-foreground">Max Subdomains</p>
                                        <p class="text-2xl font-bold text-foreground">{data.maxSubdomains}</p>
                                        <p class="text-xs text-muted-foreground">Amount of subdomains you can create across all domains </p>
                                    </div>
                                </div>
                            </div>
                        </Card.Content>
                    </Card.Root>

                    <Card.Root class="border-destructive/30 bg-destructive/5 gap-4">
                        <Card.Header>
                            <Card.Title class="text-destructive/90">Delete Account</Card.Title>
                            <Card.Description class="text-muted-foreground">
                                Permanently deletes your account. Clicking below will open a review dialog to verify your request before any action is taken.
                            </Card.Description>
                        </Card.Header>
                        <Card.Footer>
                            <Dialog.Root onOpenChange={open => (deleteOpen = open)} open={deleteOpen}>
                                <Dialog.Trigger>
                                    <Button variant="destructive">Review consequences</Button>
                                </Dialog.Trigger>
                                <Dialog.Content class="sm:max-w-md">
                                    <Dialog.Header>
                                        <Dialog.Title class="text-destructive">Permanently Delete Account</Dialog.Title>
                                        <Dialog.Description>
                                            Please review the consequences below before confirming your deletion request.
                                        </Dialog.Description>
                                    </Dialog.Header>

                                    <div class="space-y-3 text-sm text-muted-foreground">
                                        <div class="space-y-2">
                                            <p class="font-semibold text-foreground">What will happen when you delete your account:</p>
                                            <ul class="space-y-1.5 list-disc pl-6 text-foreground/80">
                                                <li>
                                                    <strong class="text-foreground">Domains & DNS:</strong>
                                                    All registered subdomains and DNS records will be permanently deleted from our nameservers and released for anyone else to claim.
                                                </li>
                                                <li>
                                                    <strong class="text-foreground">Tunnels & API:</strong>
                                                    All active tunnels will disconnect, and all API keys will be revoked.
                                                </li>
                                                <li>
                                                    <strong class="text-foreground">Account Data:</strong>
                                                    Your credentials, 2FA settings, session tokens, and referral links will be permanently wiped from our servers.
                                                </li>
                                            </ul>
                                        </div>
                                        <p class="text-muted-foreground">
                                            A confirmation link will be sent to <strong>{data.email}</strong> to finalize the deletion.
                                        </p>
                                    </div>

                                    {#if data.mfaEnabled}
                                        <div class="space-y-2 pt-2 border-t border-border">
                                            <Label class="text-xs">Two-Factor Authentication Required</Label>
                                            <p class="text-xs text-muted-foreground">
                                                Enter your 6-digit authenticator code to authorize sending the deletion email.
                                            </p>

                                            {#if usingBackupCode}
                                                <div class="space-y-2 pt-1">
                                                    <Label for="del-backup-code" class="text-xs">Backup Code</Label>
                                                    <Input bind:value={mfaCode} id="del-backup-code" placeholder="Enter backup code" />
                                                </div>
                                            {:else}
                                                <div class="py-2">
                                                    <InputOTP.Root
                                                        bind:value={mfaCode}
                                                        class="m-auto w-fit"
                                                        maxlength={6}
                                                        pattern={REGEXP_ONLY_DIGITS}>
                                                        {#snippet children({ cells })}
                                                            <InputOTP.Group>
                                                                {#each cells as cell (cell)}
                                                                    <InputOTP.Slot
                                                                        class="h-12 w-10 text-xl"
                                                                        aria-invalid={mfaInvalid}
                                                                        cell={cell} />
                                                                {/each}
                                                            </InputOTP.Group>
                                                        {/snippet}
                                                    </InputOTP.Root>
                                                </div>
                                            {/if}

                                            <Button onclick={() => (usingBackupCode = !usingBackupCode)} variant={"ghost"} class="text-xs h-7 px-2">
                                                {usingBackupCode ? "Use authenticator app code" : "Use a backup code"}
                                            </Button>
                                        </div>
                                    {/if}

                                    <Dialog.Footer class="sm:flex-col gap-3 pt-2">
                                        <div class="flex items-center space-x-2">
                                            <Checkbox bind:checked={deleteAccountChecked} id="understand" />
                                            <Label for="understand" class="text-xs cursor-pointer font-medium text-destructive">
                                                I understand that this action is irreversible and will permanently delete all my domains and account data.
                                            </Label>
                                        </div>
                                        <Button
                                            loading={mfaButtonLoading}
                                            onclick={() => handleDelete(mfaCode)}
                                            disabled={!deleteAccountChecked ||
                                                (data.mfaEnabled &&
                                                    ((!usingBackupCode && mfaCode.length != 6) ||
                                                        (usingBackupCode && mfaCode.length < 16)))}
                                            variant={"destructive"}
                                            class="w-full">
                                            Send Account Deletion Email
                                        </Button>
                                    </Dialog.Footer>
                                </Dialog.Content>
                            </Dialog.Root>
                        </Card.Footer>
                    </Card.Root>
                </div>
            {/if}

            {#if activeTab === "security"}
                <div transition:fade={{ duration: 150 }} class="space-y-6">
                    <Card.Root class="gap-2">
                        <Card.Header class="mb-0">
                            <div class="flex items-center justify-between">
                                <div>
                                    <Card.Title>Two-Factor Authentication (2FA)</Card.Title>
                                </div>
                                {#if data.mfaEnabled}
                                    <span class="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400">
                                        <MaterialSymbolsCheckCircle class="size-3.5" />
                                        Enabled
                                    </span>
                                {:else}
                                    <span class="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-400">
                                        Not Enabled
                                    </span>
                                {/if}
                            </div>
                        </Card.Header>
                        <Card.Content class="space-y-4">
                            {#if data.mfaEnabled}
                                <p class="text-sm text-muted-foreground">
                                    Your account is protected by two-factor authentication! You will be prompted for a 6-digit verification code whenever you log in.
                                </p>
                            {:else}
                                <p class="text-sm text-muted-foreground">
                                    Protect your account from unauthorized access by requiring an authenticator app code alongside your password.
                                </p>
                            {/if}
                        </Card.Content>
                        <Card.Footer class="mt-4">
                            {#if data.mfaEnabled}
                                <Dialog.Root onOpenChange={open => (dialogOpen = open)} open={dialogOpen}>
                                    <Dialog.Trigger>
                                        <Button variant={"destructive"}>Disable two-factor authentication</Button>
                                    </Dialog.Trigger>
                                    <Dialog.Content>
                                        <Dialog.Header>
                                            <Dialog.Title>Disable two-factor authentication</Dialog.Title>
                                            <Dialog.Description>
                                                Enter your one-time code or a backup code to confirm.
                                            </Dialog.Description>

                                            {#if usingBackupCode}
                                                <div class="space-y-2 pt-2">
                                                    <Label for="backup-code">Use a backup code</Label>
                                                    <Input bind:value={mfaCode} id="backup-code" placeholder="xxxx-xxxx-xxxx-xxxx" />
                                                </div>
                                            {:else}
                                                <div class="py-4">
                                                    <InputOTP.Root
                                                        bind:value={mfaCode}
                                                        class="m-auto w-fit"
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
                                                </div>
                                            {/if}

                                            <Button onclick={() => (usingBackupCode = !usingBackupCode)} variant={"ghost"} class="text-xs">
                                                {usingBackupCode ? "Use authenticator app code instead" : "Use a backup code"}
                                            </Button>
                                        </Dialog.Header>

                                        <Dialog.Footer>
                                            <Button
                                                loading={mfaButtonLoading}
                                                onclick={() => removeMfa(mfaCode)}
                                                disabled={(!usingBackupCode && mfaCode.length != 6) ||
                                                    (usingBackupCode && mfaCode.length < 16)}
                                                variant={"destructive"}>Disable 2FA</Button>
                                        </Dialog.Footer>
                                    </Dialog.Content>
                                </Dialog.Root>
                            {:else}
                                <Dialog.Root onOpenChange={open => (dialogOpen = open)} open={dialogOpen}>
                                    <Dialog.Trigger>
                                        <Button onclick={() => mfaSetup()}>Enable two-factor authentication</Button>
                                    </Dialog.Trigger>
                                    <Dialog.Content class="sm:max-w-xl">
                                        {#if mfaIsVerified}
                                            <Dialog.Header>
                                                <Dialog.Title class="text-xl font-bold">Two-Factor Authentication Enabled</Dialog.Title>
                                                <Dialog.Description>
                                                    Please save these backup codes somewhere safe. If you lose your authenticator app, these are the only way to recover your account.
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
                                                <Dialog.Description>Make your account safer in just 3 simple steps!</Dialog.Description>
                                            </Dialog.Header>

                                            <div class="flex flex-col gap-4 py-2">
                                                <div class="flex items-center gap-4">
                                                    <div class="size-24 shrink-0 sm:size-28 flex items-center justify-center">
                                                        <MaterialSymbolsSecurity class="size-16 text-primary" />
                                                    </div>
                                                    <div class="flex-1 space-y-1">
                                                        <h3 class="text-foreground text-sm font-semibold sm:text-base">
                                                            Download an authenticator app
                                                        </h3>
                                                        <p class="text-muted-foreground text-xs sm:text-sm">
                                                            Download and install an authenticator app of your choice, such as 
                                                            <a
                                                                href="https://support.google.com/accounts/answer/1066447"
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                class="text-primary font-medium hover:underline">Google Authenticator</a> (available on iOS and Android).
                                                        </p>
                                                    </div>
                                                </div>

                                                <Separator class="bg-border/60" />

                                                <div class="flex items-center gap-4">
                                                    <div class="size-24 shrink-0 sm:size-28 flex items-center justify-center overflow-hidden p-1 bg-white rounded-lg">
                                                        <QR backgroundFill="white" data={mfaUrl} class="size-full" />
                                                    </div>
                                                    <div class="min-w-0 flex-1 space-y-1">
                                                        <h3 class="text-foreground text-sm font-semibold sm:text-base">
                                                            Scan the QR code
                                                        </h3>
                                                        <p class="text-muted-foreground text-xs sm:text-sm">
                                                            Open your authenticator app and scan the QR code to the left using your phone's camera.
                                                        </p>
                                                        <div class="pt-1">
                                                            <h4 class="text-foreground text-xs font-medium">
                                                                Or manually enter the TOTP key:
                                                            </h4>
                                                            <Codeblock
                                                                variant="inline"
                                                                scrollbar="none"
                                                                class="text-muted-foreground font-mono text-xs tracking-wider break-all select-all"
                                                                text={secretKey || mfaUrl}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <Separator class="bg-border/60" />

                                                <div class="flex items-center gap-4">
                                                    <div class="size-24 shrink-0 sm:size-28 flex items-center justify-center">
                                                        <MaterialSymbolsLogin class="size-16 text-primary" />
                                                    </div>
                                                    <div class="min-w-0 flex-1 space-y-1">
                                                        <h3 class="text-foreground text-sm font-semibold sm:text-base">
                                                            Log in with your code
                                                        </h3>
                                                        <p class="text-muted-foreground text-xs sm:text-sm">
                                                            Enter the 6-digit verification code, generated by your authenticator app.
                                                        </p>
                                                        <div class="flex flex-wrap items-center gap-3 pt-2">
                                                            <InputOTP.Root
                                                                bind:value={mfaCode}
                                                                maxlength={6}
                                                                pattern={REGEXP_ONLY_DIGITS}
                                                                onComplete={() => {
                                                                    if (mfaCode.length === 6 && !mfaButtonLoading) {
                                                                        verifyMfa(mfaCode);
                                                                    }
                                                                }}>
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
                                                                onclick={() => verifyMfa(mfaCode)}>
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
                        </Card.Footer>
                    </Card.Root>
                    <Card.Root>
                        <Card.Header>
                            <Card.Title>Data Export</Card.Title>
                            <Card.Description>Download an archive of your account data</Card.Description>
                        </Card.Header>
                        <Card.Footer>
                            <Button variant="outline" onclick={() => gdprData()} class="gap-2">
                                <MaterialSymbolsDownload class="size-4" />
                                Download Data
                            </Button>
                        </Card.Footer>
                    </Card.Root>
                </div>
            {/if}

            {#if activeTab === "sessions"}
                <div transition:fade={{ duration: 150 }} class="space-y-6">
                    <Card.Root>
                        <Card.Header>
                            <Card.Title>Active Sessions</Card.Title>
                            <Card.Description>These are the devices and browsers currently authenticated to your account.</Card.Description>
                        </Card.Header>
                        <Card.Content>
                            {#if sessions && sessions.length > 0}
                                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    {#each sessions as session (session.hash)}
                                        {@const ua = new UAParser(session.user_agent)}
                                        {@const expires = new Date(session.expires * 1000)}
                                        <div transition:fade={{ duration: 100 }} class="flex flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-xs">
                                            <div class="space-y-3">
                                                <div class="flex items-start gap-3">
                                                    <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground/80">
                                                        {#if ua.getDevice().type === "mobile"}
                                                            <MaterialSymbolsSmartphone class="size-6" />
                                                        {:else}
                                                            <MaterialSymbolsMonitor class="size-6" />
                                                        {/if}
                                                    </div>
                                                    <div class="min-w-0 flex-1">
                                                        <p class="truncate text-base font-semibold text-foreground">
                                                            {ua.getOS().name || "Unknown OS"}
                                                        </p>
                                                        <p class="truncate text-xs text-muted-foreground">
                                                            {ua.getBrowser().name || "Unknown Browser"} {ua.getBrowser().version || ""}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div class="space-y-1 text-xs text-muted-foreground">
                                                    <p><span class="font-medium text-foreground/70">IP:</span> {session.ip}</p>
                                                    <p><span class="font-medium text-foreground/70">Expires:</span> {formatLocalDateTime(expires)}</p>
                                                    <p class="font-mono!"><span class="font-medium text-foreground/70">Hash:</span> {session.hash}</p>
                                                </div>
                                            </div>

                                            <div class="pt-4 flex items-center justify-between">
                                                <div></div>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    loading={session.loading}
                                                    onclick={() => {
                                                        session.loading = true;
                                                        logOut(session);
                                                    }}>
                                                    Revoke
                                                </Button>
                                            </div>
                                        </div>
                                    {/each}
                                </div>
                            {:else}
                                <div class="flex flex-col items-center justify-center py-12 text-center">
                                    <MaterialSymbolsMonitor class="size-12 text-muted-foreground/50 mb-2" />
                                    <p class="text-sm font-medium text-foreground">No active sessions found</p>
                                </div>
                            {/if}
                        </Card.Content>
                    </Card.Root>
                </div>
            {/if}

            {#if activeTab === "referrals"}
                <div transition:fade={{ duration: 150 }} class="space-y-6">
                    <Card.Root>
                        <Card.Header>
                            <Card.Title>Referral Program</Card.Title>
                            <Card.Description>Invite new users to eepy.page and earn rewards!</Card.Description>
                        </Card.Header>
                        <Card.Content class="space-y-6">
                            <div class="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5">
                                <div class="flex items-start gap-3.5">
                                    <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                                        <MaterialSymbolsGift class="size-6" />
                                    </div>
                                    <div class="space-y-1">
                                        <h4 class="text-base font-semibold text-foreground">Earn 1 Domain per 2 Verified Referrals</h4>
                                        <p class="text-xs sm:text-sm text-muted-foreground">
                                            For every 2 people who sign up with your referral link and verify their account, you'll automatically receive an extra domain (up to a maximum of 5 bonus domains).
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div class="rounded-xl border border-border bg-card p-4 shadow-xs">
                                    <p class="text-sm text-muted-foreground">Referred Users</p>
                                    <p class="mt-1 text-3xl font-medium text-foreground">{data.referredPeople || 0}</p>
                                </div>
                                <div class="rounded-xl border border-border bg-card p-4 shadow-xs">
                                    <p class="text-sm text-muted-foreground">Bonus Domains Earned</p>
                                    <p class="mt-1 text-3xl font-medium text-foreground">{bonusDomainsEarned} / 5</p>
                                </div>
                            </div>

                            {#if data.referralCode}
                                {@const link = `${window.origin}/login?ref=${data.referralCode}`}
                                <div class="space-y-3">
                                    <Label class="text-sm font-semibold">Your Referral Link</Label>
                                    <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
                                        <div class="flex-1 rounded-lg border border-border bg-muted/40 px-3.5 py-2.5 font-mono text-xs sm:text-sm break-all select-all">
                                            {link}
                                        </div>
                                        <Button
                                            onclick={() => {
                                                copy(link);
                                                toast.success("Referral link copied to clipboard!");
                                            }}
                                            class="gap-1.5 shrink-0">
                                            <MaterialSymbolsContentCopy class="size-4" />
                                            Copy Link
                                        </Button>
                                    </div>
                                </div>
                            {:else}
                                <div class="space-y-4">
                                    <div class="space-y-2">
                                        <Label for="referral" class="text-sm font-semibold">Choose Your Custom Referral Code</Label>
                                        <p class="text-xs text-muted-foreground">Only letters, numbers, and dashes (3 to 50 characters).</p>
                                        <Input
                                            disabled={referralCreating}
                                            bind:value={referralCode}
                                            maxlength={50}
                                            aria-invalid={referralInvalid}
                                            class="max-w-md font-mono"
                                            id="referral"
                                            placeholder="my-cool-link" />
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
                                        loading={referralCreating}
                                        disabled={referralInvalid || !referralCode}>
                                        Create Referral Link
                                    </Button>
                                </div>
                            {/if}
                        </Card.Content>
                    </Card.Root>
                </div>
            {/if}
        </main>
    </div>
</div>
