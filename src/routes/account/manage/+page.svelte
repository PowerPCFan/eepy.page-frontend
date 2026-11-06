<script lang="ts">
    import { dev } from "$app/environment";
    import { AUTH_COOKIE_NAME, createFile, formatLocalDateTime, getAuthToken, redirectToLogin } from "$lib";
    import { t } from "$lib/i18n";
    import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
    import { Badge } from "$lib/components/ui/badge/index.js";
    import { Button } from "$lib/components/ui/button";
    import * as Card from "$lib/components/ui/card";
    import Checkbox from "$lib/components/ui/checkbox/checkbox.svelte";
    import { Codeblock } from "$lib/components/ui/codeblock";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import { IconBadge } from "$lib/components/ui/icon-badge";
    import InlineAlert from "$lib/components/ui/inline-alert/inline-alert.svelte";
    import { Input } from "$lib/components/ui/input";
    import * as InputOTP from "$lib/components/ui/input-otp/index.js";
    import { Label } from "$lib/components/ui/label";
    import { Separator } from "$lib/components/ui/separator";
    import * as Tabs from "$lib/components/ui/tabs/index.js";
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

    function getSecretKey(url?: string): string {
        if (!url) return "";
        try {
            if (url.startsWith("otpauth://")) {
                const parsed = new URL(url);
                return parsed.searchParams.get("secret") || "";
            }
        } catch {}

        const match = url.match(/[?&]secret=([^&]+)/i);
        if (match) {
            return match[1] ?? "";
        }

        return url;
    }

    function formatSecretKey(secret: string): string {
        if (!secret) return "";
        const clean = secret.replace(/\s+/g, "").toLowerCase();
        return clean.match(/.{1,4}/g)?.join(" ") || clean;
    }

    let secretKey = $derived(formatSecretKey(getSecretKey(mfaUrl) ?? ""));
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
                toast.error(t("dashboard.account.security.alreadyEnabled"));
                return;
            }
            toast.error(t("dashboard.account.security.failedSetup"));
        }
    }

    async function verifyMfa(code: string) {
        mfaInvalid = false;
        mfaButtonLoading = true;
        try {
            await serverContactor.verifyMfaCode(code);
            mfaButtonLoading = false;
            toast.success(t("dashboard.account.security.enabledSuccess"), { duration: 9000 });
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
                toast.error(t("dashboard.account.security.invalidCode"), {
                    description: t("dashboard.account.security.invalidCodeDesc"),
                });
                return;
            }
            if (error instanceof ConflictError) {
                consola.error("MFA code already exists. This shouldn't be able to happen");
                toast.error(t("dashboard.account.security.alreadyEnabled"));
                return;
            }
            toast.error(t("dashboard.account.security.failedVerify"));
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
            toast.success(t("dashboard.account.security.disabledSuccess"));
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
                toast.error(t("dashboard.account.security.invalidCode"), {
                    description: t("dashboard.account.security.refreshAndRetry"),
                });
                return;
            }
            toast.error(t("errors.general.unhandledTitle"), {
                description: t("errors.general.contactSupport"),
            });
        }
    }

    async function handleDelete(mfaCode: string) {
        mfaButtonLoading = true;
        try {
            await serverContactor.deleteAccount(mfaCode);
            mfaButtonLoading = false;
            toast.success(t("dashboard.account.deleteAccount.emailSentTitle"), {
                description: t("dashboard.account.deleteAccount.emailSentDesc"),
                duration: 9000,
            });
        } catch (err) {
            consola.warn("Failed to send account deletion email");
            mfaButtonLoading = false;
            mfaInvalid = true;
            if (showRateLimitError(err)) return;
            if (err instanceof AuthError) redirectToLogin(460);
            else if (err instanceof MFAError) toast.error(t("auth.mfa.codeError"));
            else
                toast.error(t("dashboard.account.deleteAccount.failedDelete"), {
                    description: t("errors.general.contactSupport"),
                });
        }
    }

    async function gdprData() {
        try {
            const res = await serverContactor.getGDPR();
            createFile("data.json", JSON.stringify(res));
            toast.success(t("dashboard.account.export.success"));
        } catch {
            toast.error(t("dashboard.account.export.failed"));
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
                toast.success(t("dashboard.account.sessions.loggedOut"));
            }
        } catch (err) {
            if (showRateLimitError(err)) return;
            toast.error(t("dashboard.account.sessions.failedLogout"));
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
    <title>{t("dashboard.account.title")} | eepy.page</title>
    <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="mx-auto w-11/12 max-w-6xl py-8 sm:py-12">
    <div class="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
            <h1 class="text-3xl font-bold text-foreground">{t("dashboard.account.title")}</h1>
            <p class="text-sm text-muted-foreground">{t("dashboard.account.subtitle")}</p>
        </div>
    </div>

    <InlineAlert
        variant={"error"}
        title={alertTitle}
        description={alertDescription}
        trigger={alertTrigger} />

    <div class="mt-6 grid grid-cols-1 gap-8 md:grid-cols-12">
        <aside class="hidden md:block md:col-span-4 lg:col-span-3">
            <nav class="flex flex-col gap-1">
                <button
                    onclick={() => setTab("profile")}
                    class="flex items-center justify-between gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all {activeTab === 'profile' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-foreground/80 hover:bg-muted hover:text-foreground'}">
                    <div class="flex items-center gap-2.5">
                        <MaterialSymbolsPersonOutline class="size-5 shrink-0" />
                        <span>{t("dashboard.account.tabs.profile")}</span>
                    </div>
                </button>

                <button
                    onclick={() => setTab("security")}
                    class="flex items-center justify-between gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all {activeTab === 'security' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-foreground/80 hover:bg-muted hover:text-foreground'}">
                    <div class="flex items-center gap-2.5">
                        <MaterialSymbolsSecurity class="size-5 shrink-0" />
                        <span>{t("dashboard.account.tabs.security")}</span>
                    </div>
                </button>

                <button
                    onclick={() => setTab("sessions")}
                    class="flex items-center justify-between gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all {activeTab === 'sessions' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-foreground/80 hover:bg-muted hover:text-foreground'}">
                    <div class="flex items-center gap-2.5">
                        <MaterialSymbolsMonitor class="size-5 shrink-0" />
                        <span>{t("dashboard.account.tabs.sessions")}</span>
                    </div>
                    <!-- {#if ((sessions ?? []).length ?? 0) > 0} -->
                        <Badge variant="outline">{(sessions ?? []).length ?? 0}</Badge>
                    <!-- {/if} -->
                </button>

                <button
                    onclick={() => setTab("referrals")}
                    class="flex items-center justify-between gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all {activeTab === 'referrals' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-foreground/80 hover:bg-muted hover:text-foreground'}">
                    <div class="flex items-center gap-2.5">
                        <MaterialSymbolsLink class="size-5 shrink-0" />
                        <span>{t("dashboard.account.tabs.referrals")}</span>
                    </div>
                    <!-- {#if (data.referredPeople ?? 0) > 0} -->
                        <Badge variant="outline">{data.referredPeople}</Badge>
                    <!-- {/if} -->
                </button>

                <div class="my-3">
                    <Separator class="bg-border" />
                </div>

                <div class="flex flex-col gap-1">
                    <a
                        href="/api/dashboard"
                        class="flex items-center justify-between gap-2.5 rounded-lg px-3.5 py-2 text-sm text-muted-foreground transition-all hover:bg-muted hover:text-foreground">
                        <div class="flex items-center gap-2">
                            <MaterialSymbolsKey class="size-4 shrink-0" />
                            <span>{t("dashboard.account.tabs.apiKeys")}</span>
                        </div>
                    </a>

                    <a
                        href="/wrapped"
                        class="flex items-center justify-between gap-2.5 rounded-lg px-3.5 py-2 text-sm text-muted-foreground transition-all hover:bg-muted hover:text-foreground">
                        <div class="flex items-center gap-2">
                            <MaterialSymbolsGift class="size-4 shrink-0" />
                            <span>Wrapped</span>
                        </div>
                    </a>

                    {#if data.admin?.enabled === true}
                        <a
                            href="https://panel.eepy.page/"
                            target="_blank"
                            rel="noreferrer"
                            class="flex items-center justify-between gap-2.5 rounded-lg px-3.5 py-2 text-sm text-muted-foreground transition-all hover:bg-muted hover:text-foreground">
                            <div class="flex items-center gap-2">
                                <MaterialSymbolsAdminPanelSettings class="size-4 shrink-0" />
                                <span>Admin Panel</span>
                            </div>
                            <MaterialSymbolsOpenInNew class="size-3.5 opacity-60" />
                        </a>
                    {/if}

                    <div class="flex items-center justify-between gap-2.5 rounded-lg px-3.5 py-2 text-left text-sm text-destructive transition-all hover:bg-destructive/15">
                        <button
                            onclick={() => logOut()}
                            class="flex w-full items-center gap-2.5">
                            <MaterialSymbolsLogout class="size-4 shrink-0" />
                            <span>{t("dashboard.account.tabs.logOut")}</span>
                        </button>
                    </div>
                </div>
            </nav>
        </aside>

        <div class="block md:hidden rounded-2xl border border-border bg-card/75 p-3 backdrop-blur-sm shadow-xs">
            <Tabs.Root
                value={activeTab}
                onValueChange={(val) => setTab(val as Tab)}
                class="w-full pb-2">
                <Tabs.List variant="segmented" class="grid grid-cols-2 sm:grid-cols-4 w-full h-auto p-1 gap-1">
                    <Tabs.Trigger value="profile" class="text-xs py-2 gap-1.5 font-medium">
                        <MaterialSymbolsPersonOutline class="size-4 shrink-0" />
                        <span>{t("dashboard.account.tabs.profile")}</span>
                    </Tabs.Trigger>

                    <Tabs.Trigger value="security" class="text-xs py-2 gap-1.5 font-medium">
                        <MaterialSymbolsSecurity class="size-4 shrink-0" />
                        <span>{t("dashboard.account.tabs.security")}</span>
                    </Tabs.Trigger>

                    <Tabs.Trigger value="sessions" class="text-xs py-2 gap-1.5 font-medium">
                        <MaterialSymbolsMonitor class="size-4 shrink-0" />
                        <span>{t("dashboard.account.tabs.sessions")}</span>
                    </Tabs.Trigger>

                    <Tabs.Trigger value="referrals" class="text-xs py-2 gap-1.5 font-medium">
                        <MaterialSymbolsLink class="size-4 shrink-0" />
                        <span>{t("dashboard.account.tabs.referrals")}</span>
                        {#if (data.referredPeople ?? 0) > 0}
                            <Badge variant="secondary" class="ml-1 px-1.5 py-0.2 text-[10px] font-semibold">
                                {data.referredPeople}
                            </Badge>
                        {/if}
                    </Tabs.Trigger>
                </Tabs.List>
            </Tabs.Root>

            <div class="flex flex-wrap items-center gap-1.5 border-t border-border pt-2">
                <a
                    href="/api/dashboard"
                    class="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground active:scale-[0.97]">
                    <MaterialSymbolsKey class="size-3.5 shrink-0" />
                    <span>{t("dashboard.account.tabs.apiKeys")}</span>
                    <MaterialSymbolsOpenInNew class="size-3 opacity-60" />
                </a>

                <a
                    href="/wrapped"
                    class="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground active:scale-[0.97]">
                    <MaterialSymbolsGift class="size-3.5 shrink-0" />
                    <span>Wrapped</span>
                </a>

                {#if data.admin?.enabled === true}
                    <a
                        href="https://panel.eepy.page/"
                        target="_blank"
                        rel="noreferrer"
                        class="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground active:scale-[0.97]">
                        <MaterialSymbolsAdminPanelSettings class="size-3.5 shrink-0" />
                        <span>Admin Panel</span>
                        <MaterialSymbolsOpenInNew class="size-3 opacity-60" />
                    </a>
                {/if}

                <button
                    onclick={() => logOut()}
                    class="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-destructive transition-all hover:bg-destructive/15 active:scale-[0.97]">
                    <MaterialSymbolsLogout class="size-3.5 shrink-0" />
                    <span>{t("dashboard.account.tabs.logOut")}</span>
                </button>
            </div>
        </div>

        <div class="space-y-6 md:col-span-8 lg:col-span-9">
            {#if activeTab === "profile"}
                <div transition:fade={{ duration: 150 }} class="space-y-6">
                    <Card.Root>
                        <Card.Header>
                            <Card.Title>{t("dashboard.account.profile.title")}</Card.Title>
                        </Card.Header>
                        <Card.Content class="space-y-4">
                            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div class="space-y-1.5">
                                    <Label class="text-xs text-muted-foreground">{t("dashboard.account.profile.username")}</Label>
                                    <div class="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-3.5 py-2 text-sm font-medium">
                                        <span>{data.username}</span>
                                    </div>
                                </div>
                                <div class="space-y-1.5">
                                    <Label class="text-xs text-muted-foreground">{t("dashboard.account.profile.email")}</Label>
                                    <div class="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-3.5 py-2 text-sm font-medium">
                                        <span class="truncate">{data.email}</span>
                                    </div>
                                </div>
                            </div>
                        </Card.Content>
                    </Card.Root>

                    <Card.Root>
                        <Card.Header>
                            <Card.Title>{t("dashboard.account.quotas.title")}</Card.Title>
                        </Card.Header>
                        <Card.Content>
                            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div class="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-xs">
                                    <div class="space-y-1">
                                        <p class="text-xs font-medium text-muted-foreground">{t("dashboard.account.quotas.maxDomains")}</p>
                                        <p class="text-2xl font-bold text-foreground">{data.maxDomains}</p>
                                        <p class="text-xs text-muted-foreground">{t("dashboard.account.quotas.maxDomainsDesc")}</p>
                                    </div>
                                </div>

                                <div class="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-xs">
                                    <div class="space-y-1">
                                        <p class="text-xs font-medium text-muted-foreground">{t("dashboard.account.quotas.maxSubdomains")}</p>
                                        <p class="text-2xl font-bold text-foreground">{data.maxSubdomains}</p>
                                        <p class="text-xs text-muted-foreground">{t("dashboard.account.quotas.maxSubdomainsDesc")}</p>
                                    </div>
                                </div>
                            </div>
                        </Card.Content>
                    </Card.Root>

                    <Card.Root class="border-destructive/30 bg-destructive/5 gap-4">
                        <Card.Header>
                            <Card.Title class="text-destructive/90">{t("dashboard.account.deleteAccount.cardTitle")}</Card.Title>
                            <Card.Description class="text-muted-foreground leading-relaxed">
                                {t("dashboard.account.deleteAccount.cardDesc")}
                            </Card.Description>
                        </Card.Header>
                        <Card.Footer>
                            <AlertDialog.Root onOpenChange={open => (deleteOpen = open)} open={deleteOpen}>
                                <AlertDialog.Trigger>
                                    <Button variant="destructive">{t("dashboard.account.deleteAccount.reviewButton")}</Button>
                                </AlertDialog.Trigger>
                                <AlertDialog.Content class="sm:max-w-md">
                                    <AlertDialog.Header>
                                        <AlertDialog.Title class="text-destructive">{t("dashboard.account.deleteAccount.dialogTitle")}</AlertDialog.Title>
                                        <AlertDialog.Description class="leading-normal">
                                            {t("dashboard.account.deleteAccount.dialogDesc")}
                                        </AlertDialog.Description>
                                    </AlertDialog.Header>

                                    <div class="space-y-3 text-sm text-muted-foreground">
                                        <div class="space-y-2">
                                            <p class="font-semibold text-foreground">{t("dashboard.account.deleteAccount.whatHappens")}</p>
                                            <ul class="space-y-1.5 list-disc pl-6 text-foreground/80 leading-relaxed">
                                                <li>
                                                    <strong class="text-foreground">{t("dashboard.account.deleteAccount.domainsDnsLabel")}</strong>
                                                    {t("dashboard.account.deleteAccount.domainsDnsDesc")}
                                                </li>
                                                <li>
                                                    <strong class="text-foreground">{t("dashboard.account.deleteAccount.tunnelsApiLabel")}</strong>
                                                    {t("dashboard.account.deleteAccount.tunnelsApiDesc")}
                                                </li>
                                                <li>
                                                    <strong class="text-foreground">{t("dashboard.account.deleteAccount.accountDataLabel")}</strong>
                                                    {t("dashboard.account.deleteAccount.accountDataDesc")}
                                                </li>
                                            </ul>
                                        </div>
                                        <p class="text-muted-foreground leading-relaxed">
                                            {t("dashboard.account.deleteAccount.emailSentNotice", { email: data.email })}
                                        </p>
                                    </div>

                                    {#if data.mfaEnabled}
                                        <div class="space-y-2 pt-2 border-t border-border">
                                            <Label class="text-xs">{t("dashboard.account.deleteAccount.mfaRequired")}</Label>
                                            <p class="text-xs text-muted-foreground leading-normal">
                                                {t("dashboard.account.deleteAccount.mfaDesc")}
                                            </p>

                                            {#if usingBackupCode}
                                                <div class="space-y-2 pt-1">
                                                    <Label for="del-backup-code" class="text-xs">{t("dashboard.account.deleteAccount.backupCode")}</Label>
                                                    <Input bind:value={mfaCode} id="del-backup-code" placeholder={t("dashboard.account.deleteAccount.backupCodePlaceholder")} />
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
                                                {usingBackupCode ? t("dashboard.account.deleteAccount.useTotp") : t("dashboard.account.deleteAccount.useBackupCode")}
                                            </Button>
                                        </div>
                                    {/if}

                                    <AlertDialog.Footer class="sm:flex-col gap-3 pt-2">
                                        <div class="flex items-center space-x-2">
                                            <Checkbox bind:checked={deleteAccountChecked} id="understand" />
                                            <Label for="understand" class="text-xs cursor-pointer font-medium text-destructive leading-snug">
                                                {t("dashboard.account.deleteAccount.confirmCheckbox")}
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
                                            {t("dashboard.account.deleteAccount.sendEmailButton")}
                                        </Button>
                                        <AlertDialog.Cancel class="w-full mt-1">{t("common.actions.cancel")}</AlertDialog.Cancel>
                                    </AlertDialog.Footer>
                                </AlertDialog.Content>
                            </AlertDialog.Root>
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
                                    <Card.Title>{t("dashboard.account.security.twoFactorTitle")}</Card.Title>
                                </div>
                                {#if data.mfaEnabled}
                                    <Badge variant="outline" class="gap-1.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-semibold text-xs">
                                        <MaterialSymbolsCheckCircle class="size-3.5" />
                                        {t("dashboard.account.security.enabled")}
                                    </Badge>
                                {:else}
                                    <Badge variant="outline" class="border-amber-500/30 bg-amber-500/10 text-amber-400 font-semibold text-xs">
                                        {t("dashboard.account.security.notEnabled")}
                                    </Badge>
                                {/if}
                            </div>
                        </Card.Header>
                        <Card.Content class="space-y-4">
                            {#if data.mfaEnabled}
                                <p class="text-sm text-muted-foreground leading-relaxed">
                                    {t("dashboard.account.security.mfaEnabledNotice")}
                                </p>
                            {:else}
                                <p class="text-sm text-muted-foreground leading-relaxed">
                                    {t("dashboard.account.security.mfaDisabledNotice")}
                                </p>
                            {/if}
                        </Card.Content>
                        <Card.Footer class="mt-4">
                            {#if data.mfaEnabled}
                                <Dialog.Root onOpenChange={open => (dialogOpen = open)} open={dialogOpen}>
                                    <Dialog.Trigger>
                                        <Button variant={"destructive"}>{t("dashboard.account.security.disableMfaButton")}</Button>
                                    </Dialog.Trigger>
                                    <Dialog.Content>
                                        <Dialog.Header>
                                            <Dialog.Title>{t("dashboard.account.security.disableMfaButton")}</Dialog.Title>
                                            <Dialog.Description>
                                                {t("dashboard.account.security.disableMfaDesc")}
                                            </Dialog.Description>

                                            {#if usingBackupCode}
                                                <div class="space-y-2 pt-2">
                                                    <Label for="backup-code">{t("dashboard.account.security.useBackupCodeLabel")}</Label>
                                                    <Input bind:value={mfaCode} id="backup-code" placeholder={t("dashboard.account.security.backupCodePlaceholder")} />
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
                                                {usingBackupCode ? t("dashboard.account.security.useTotpLabel") : t("dashboard.account.security.useBackupCodeLabel")}
                                            </Button>
                                        </Dialog.Header>

                                        <Dialog.Footer>
                                            <Button
                                                loading={mfaButtonLoading}
                                                onclick={() => removeMfa(mfaCode)}
                                                disabled={(!usingBackupCode && mfaCode.length != 6) ||
                                                    (usingBackupCode && mfaCode.length < 16)}
                                                variant={"destructive"}>{t("dashboard.account.security.disableConfirm")}</Button>
                                        </Dialog.Footer>
                                    </Dialog.Content>
                                </Dialog.Root>
                            {:else}
                                <Dialog.Root onOpenChange={open => (dialogOpen = open)} open={dialogOpen}>
                                    <Dialog.Trigger>
                                        <Button onclick={() => mfaSetup()}>{t("dashboard.account.security.enableMfaButton")}</Button>
                                    </Dialog.Trigger>
                                    <Dialog.Content class="sm:max-w-xl">
                                        {#if mfaIsVerified}
                                            <Dialog.Header>
                                                <Dialog.Title class="text-xl font-bold">{t("dashboard.account.security.mfaSuccessTitle")}</Dialog.Title>
                                                <Dialog.Description class="leading-relaxed">
                                                    {t("dashboard.account.security.mfaSuccessDesc")}
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
                                                        toast.success(t("dashboard.account.security.copiedCodes"));
                                                    }}>
                                                    {t("dashboard.account.security.copyCodes")}
                                                </Button>
                                                <Button onclick={() => (dialogOpen = false)}>{t("common.actions.close")}</Button>
                                            </Dialog.Footer>
                                        {:else if !mfaUrl}
                                            <Dialog.Header>
                                                <Dialog.Title class="text-xl font-bold">{t("dashboard.account.security.enableMfaButton")}</Dialog.Title>
                                                <Dialog.Description class="leading-normal">{t("dashboard.account.security.mfaStepLead")}</Dialog.Description>
                                            </Dialog.Header>
                                            <div class="flex flex-col items-center justify-center gap-3 py-12">
                                                <div class="border-primary size-6 animate-spin rounded-full border-2 border-t-transparent"></div>
                                                <span class="text-muted-foreground text-sm">{t("dashboard.account.security.mfaStarting")}</span>
                                            </div>
                                        {:else}
                                            <Dialog.Header>
                                                <Dialog.Title class="text-xl font-bold">{t("dashboard.account.security.enableMfaButton")}</Dialog.Title>
                                                <Dialog.Description class="leading-normal">{t("dashboard.account.security.mfaStepLead")}</Dialog.Description>
                                            </Dialog.Header>

                                            <div class="flex flex-col gap-4 py-2">
                                                <div class="flex items-center gap-4">
                                                    <div class="size-24 shrink-0 sm:size-28 flex items-center justify-center">
                                                        <MaterialSymbolsSecurity class="size-16 text-primary" />
                                                    </div>
                                                    <div class="flex-1 space-y-1">
                                                        <h3 class="text-foreground text-sm font-semibold sm:text-base">
                                                            {t("dashboard.account.security.step1Title")}
                                                        </h3>
                                                        <p class="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                                                            {t("dashboard.account.security.step1Desc")}
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
                                                            {t("dashboard.account.security.step2Title")}
                                                        </h3>
                                                        <p class="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                                                            {t("dashboard.account.security.step2Desc")}
                                                        </p>
                                                        <div class="pt-1">
                                                            <h4 class="text-foreground text-xs font-medium">
                                                                {t("dashboard.account.security.step2Manual")}
                                                            </h4>
                                                            <Codeblock
                                                                variant="inline"
                                                                scrollbar="none"
                                                                class="text-muted-foreground font-mono text-xs break-all select-all"
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
                                                            {t("dashboard.account.security.step3Title")}
                                                        </h3>
                                                        <p class="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                                                            {t("dashboard.account.security.step3Desc")}
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
                                                                {t("dashboard.account.security.activate")}
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
                            <Card.Title>{t("dashboard.account.export.title")}</Card.Title>
                            <Card.Description>{t("dashboard.account.export.description")}</Card.Description>
                        </Card.Header>
                        <Card.Footer>
                            <Button variant="outline" onclick={() => gdprData()} class="gap-2">
                                <MaterialSymbolsDownload class="size-4" />
                                {t("dashboard.account.export.downloadButton")}
                            </Button>
                        </Card.Footer>
                    </Card.Root>
                </div>
            {/if}

            {#if activeTab === "sessions"}
                <div transition:fade={{ duration: 150 }} class="space-y-6">
                    <Card.Root>
                        <Card.Header>
                            <Card.Title>{t("dashboard.account.sessions.title")}</Card.Title>
                            <Card.Description>{t("dashboard.account.sessions.description")}</Card.Description>
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
                                                    <p><span class="font-medium text-foreground/70">{t("dashboard.account.sessions.ip")}</span> {session.ip}</p>
                                                    <p><span class="font-medium text-foreground/70">{t("dashboard.account.sessions.expires")}</span> {formatLocalDateTime(expires)}</p>
                                                    <p class="font-mono!"><span class="font-medium text-foreground/70">{t("dashboard.account.sessions.hash")}</span> {session.hash}</p>
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
                                                    {t("dashboard.account.sessions.revoke")}
                                                </Button>
                                            </div>
                                        </div>
                                    {/each}
                                </div>
                            {:else}
                                <div class="flex flex-col items-center justify-center py-12 text-center">
                                    <MaterialSymbolsMonitor class="size-12 text-muted-foreground/50 mb-2" />
                                    <p class="text-sm font-medium text-foreground">{t("dashboard.account.sessions.empty")}</p>
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
                            <Card.Title>{t("dashboard.account.referrals.title")}</Card.Title>
                            <Card.Description>{t("dashboard.account.referrals.description")}</Card.Description>
                        </Card.Header>
                        <Card.Content class="space-y-6">
                            <div class="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5">
                                <div class="flex items-start gap-3.5">
                                    <IconBadge variant="primary" size="md">
                                        <MaterialSymbolsGift class="size-6" />
                                    </IconBadge>
                                    <div class="space-y-1">
                                        <h4 class="text-base font-semibold text-foreground">{t("dashboard.account.referrals.perkTitle")}</h4>
                                        <p class="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                            {t("dashboard.account.referrals.perkDesc")}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div class="rounded-xl border border-border bg-card p-4 shadow-xs">
                                    <p class="text-sm text-muted-foreground">{t("dashboard.account.referrals.referredUsers")}</p>
                                    <p class="mt-1 text-3xl font-medium text-foreground">{data.referredPeople || 0}</p>
                                </div>
                                <div class="rounded-xl border border-border bg-card p-4 shadow-xs">
                                    <p class="text-sm text-muted-foreground">{t("dashboard.account.referrals.bonusEarned")}</p>
                                    <p class="mt-1 text-3xl font-medium text-foreground">{bonusDomainsEarned} / 5</p>
                                </div>
                            </div>

                            {#if data.referralCode}
                                {@const link = `${window.origin}/login?ref=${data.referralCode}`}
                                <div class="space-y-3">
                                    <Label class="text-sm font-semibold">{t("dashboard.account.referrals.yourLink")}</Label>
                                    <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
                                        <div class="flex-1 rounded-lg border border-border bg-muted/40 px-3.5 py-2.5 font-mono text-xs sm:text-sm break-all select-all">
                                            {link}
                                        </div>
                                        <Button
                                            onclick={() => {
                                                copy(link);
                                                toast.success(t("dashboard.account.referrals.copiedLink"));
                                            }}
                                            class="gap-1.5 shrink-0">
                                            <MaterialSymbolsContentCopy class="size-4" />
                                            {t("dashboard.account.referrals.copyLink")}
                                        </Button>
                                    </div>
                                </div>
                            {:else}
                                <div class="space-y-4">
                                    <div class="space-y-2">
                                        <Label for="referral" class="text-sm font-semibold">{t("dashboard.account.referrals.customCodeTitle")}</Label>
                                        <p class="text-xs text-muted-foreground leading-normal">{t("dashboard.account.referrals.customCodeHint")}</p>
                                        <Input
                                            disabled={referralCreating}
                                            bind:value={referralCode}
                                            maxlength={50}
                                            aria-invalid={referralInvalid}
                                            class="max-w-md font-mono"
                                            id="referral"
                                            placeholder={t("dashboard.account.referrals.placeholder")} />
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
                                                    alertTitle = t("errors.general.unhandledTitle");
                                                    alertDescription = t("errors.general.contactSupport");
                                                } else if (err instanceof CodeError) {
                                                    alertTitle = t("dashboard.account.referrals.createFailed");
                                                    alertDescription = t("dashboard.account.referrals.codeExists");
                                                }
                                                alertTrigger++;
                                            } finally {
                                                referralCreating = false;
                                            }
                                        }}
                                        loading={referralCreating}
                                        disabled={referralInvalid || !referralCode}>
                                        {t("dashboard.account.referrals.createButton")}
                                    </Button>
                                </div>
                            {/if}
                        </Card.Content>
                    </Card.Root>
                </div>
            {/if}
        </div>
    </div>
</div>
