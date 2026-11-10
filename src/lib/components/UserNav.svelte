<script lang="ts">
    import { goto } from "$app/navigation";
    import { t } from "$lib/i18n";
    import { DropdownMenu } from "bits-ui";
    import MSAccountCircle from "~icons/material-symbols/account-circle";
    import MSArrowSplit from "~icons/material-symbols/arrow-split";
    import MaterialSymbolsLogin from "~icons/material-symbols/login";
    import MaterialSymbolsLogout from "~icons/material-symbols/logout";
    import MSTeamDashboard from "~icons/material-symbols/dashboard-2";
    import MSKey from "~icons/material-symbols/key";
    import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
    import Button from "./ui/button/button.svelte";
    import { getAuthToken, redirectToLogin } from "../../helperFuncs";
    import { ServerContactor } from "../../serverContactor";
    import { browser } from "$app/environment";
    import Cookies from "js-cookie";

    let { mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void } = $props();

    const NAVBAR_KEY = "navbarAuthState";

    function getCachedUsername(): string | null {
        if (!browser) return null;
        try {
            const raw = localStorage.getItem(NAVBAR_KEY);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            return parsed?.username ?? null;
        } catch {
            return null;
        }
    }

    let token = $derived(browser ? getAuthToken() : null);
    let loggedInCookie = $derived(browser ? Cookies.get("logged-in") : null);
    let isLoggedIn = $derived(!!token || loggedInCookie === "yes");

    let cachedUsername = $state(getCachedUsername());
    let username = $derived(isLoggedIn ? (cachedUsername || "Account") : null);

    async function handleLogOut() {
        try {
            const contactor = new ServerContactor(getAuthToken() ?? null);
            await contactor.logOut();
        } catch {}
        if (browser) {
            try { localStorage.removeItem(NAVBAR_KEY); } catch {}
        }
        cachedUsername = null;
        onNavigate?.();
        redirectToLogin(200);
    }

    let usernameTruncated = $derived(
        ((username?.length ?? 0) > 12) ? (username?.slice(0, 12) + "...") : (username || "Account")
    );
</script>

{#if !isLoggedIn}
    {#if mobile}
        <Button href="/login" onclick={onNavigate} class="w-full justify-center">
            <MaterialSymbolsLogin class="size-4" />
            <span>{t("auth.tabs.signIn") || "Sign In"}</span>
        </Button>
    {:else}
        <Button href="/login" variant="secondary" class="text-muted-foreground dark:border-input border text-xs">
            <MaterialSymbolsLogin class="size-4" />
            <span>{t("auth.tabs.signIn") || "Sign In"}</span>
        </Button>
    {/if}
{:else}
    {#if mobile}
        <div class="flex items-center justify-between gap-3 p-3 rounded-xl bg-muted/40 border border-border/50">
            <div class="flex items-center gap-2 min-w-0">
                <MSAccountCircle class="size-5 text-muted-foreground shrink-0" />
                <span class="text-sm font-semibold truncate text-foreground">{username}</span>
            </div>
            <button
                class="flex items-center gap-1.5 text-xs text-destructive hover:bg-destructive/10 px-2 py-1 rounded-md font-medium transition-colors cursor-pointer"
                onclick={handleLogOut}
            >
                <MaterialSymbolsLogout class="size-3.5" />
                <span>{t("dashboard.account.tabs.logOut") || "Log Out"}</span>
            </button>
        </div>
    {:else}
        <DropdownMenu.Root>
            <DropdownMenu.Trigger
                class="relative inline-flex gap-2 px-3 h-9 w-auto shrink-0 items-center justify-center rounded-lg bg-primary/15 border border-primary/25 text-xs text-muted-foreground shadow-xs hover:border-primary/45 hover:bg-primary/25 active:scale-95 transition-all select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="User account menu"
            >
                <MSAccountCircle class="text-muted-foreground!" /><span>{usernameTruncated}</span>
                <ChevronDownIcon class="size-4 text-foreground! opacity-50" />
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
                <DropdownMenu.Content
                    sideOffset={8}
                    align="end"
                    class="z-50 min-w-56 overflow-hidden rounded-lg border border-border/70 bg-popover/95 p-1.5 text-popover-foreground shadow-2xl backdrop-blur-xl origin-top-right focus:outline-none"
                >
                    <div class="px-2.5 py-2 select-none border-b border-border/50 mb-1">
                        <div class="flex items-center gap-2 min-w-0">
                            <MSAccountCircle class="size-5 text-muted-foreground shrink-0" />
                            <span class="text-sm font-semibold text-foreground truncate">{username}</span>
                        </div>
                    </div>

                    <DropdownMenu.Item
                        class="relative flex cursor-pointer select-none items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium outline-none hover:bg-accent hover:text-accent-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground transition-colors"
                        onSelect={() => goto("/account/manage")}
                    >
                        <MSAccountCircle class="size-4 text-muted-foreground shrink-0" />
                        <span>{t("common.nav.account")}</span>
                    </DropdownMenu.Item>

                    <DropdownMenu.Item
                        class="relative flex cursor-pointer select-none items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium outline-none hover:bg-accent hover:text-accent-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground transition-colors"
                        onSelect={() => goto("/dashboard")}
                    >
                        <MSTeamDashboard class="size-4 text-muted-foreground shrink-0" />
                        <span>{t("common.nav.dashboard")}</span>
                    </DropdownMenu.Item>

                    <DropdownMenu.Item
                        class="relative flex cursor-pointer select-none items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium outline-none hover:bg-accent hover:text-accent-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground transition-colors"
                        onSelect={() => goto("/dashboard/tunneling")}
                    >
                        <MSArrowSplit class="size-4 text-muted-foreground shrink-0" />
                        <span>{t("common.nav.tunneling")}</span>
                    </DropdownMenu.Item>

                    <DropdownMenu.Item
                        class="relative flex cursor-pointer select-none items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium outline-none hover:bg-accent hover:text-accent-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground transition-colors"
                        onSelect={() => goto("/api/dashboard")}
                    >
                        <MSKey class="size-4 text-muted-foreground shrink-0" />
                        <span>{t("dashboard.account.tabs.apiKeys")}</span>
                    </DropdownMenu.Item>

                    <DropdownMenu.Separator class="-mx-1 my-1 h-px bg-border/50" />

                    <DropdownMenu.Item
                        class="relative flex cursor-pointer select-none items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-destructive outline-none hover:bg-destructive/10 hover:text-destructive data-[highlighted]:bg-destructive/10 data-[highlighted]:text-destructive transition-colors"
                        onSelect={handleLogOut}
                    >
                        <MaterialSymbolsLogout class="size-4 shrink-0" />
                        <span>{t("dashboard.account.tabs.logOut") || "Log Out"}</span>
                    </DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    {/if}
{/if}
