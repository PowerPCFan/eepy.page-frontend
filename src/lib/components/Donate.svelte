<script lang="ts">
    import Button from "$lib/components/ui/button/button.svelte";
    import { IconBadge } from "$lib/components/ui/icon-badge";
    import { CONSENT_COOKIE_NAME } from "$lib/consent";
    import MaterialSymbolsHeart from "~icons/material-symbols/favorite-rounded";
    import MaterialSymbolsOpenInNew from "~icons/material-symbols/open-in-new";
    import { onMount } from "svelte";
    import { slide } from "svelte/transition";

    let showDonationBanner = $state(false);
    let localSponsorHidden = $state(false);

    function hasCookie(name: string) {
        return document.cookie.split("; ").some(row => row.startsWith(`${name}=`));
    }

    function shouldShowDonationBanner() {
        const hasVisitedBefore = localStorage.getItem("eepy-has-visited") === "true";
        const hasPreviousCookieConsent = hasCookie(CONSENT_COOKIE_NAME);

        return (
            hasVisitedBefore &&
            hasPreviousCookieConsent &&
            !localStorage.getItem("donation-dismissed") &&
            !localStorage.getItem("already-donated")
        );
    }

    onMount(() => {
        const dismissed = localStorage.getItem("donation-dismissed");
        let dismissedTime = dismissed ? Number(dismissed) : 0;
        const threeDaysSecs = 3 * 24 * 60 * 60;
        const threeDaysMillis = threeDaysSecs * 1000;
        if (dismissedTime > 0 && Date.now() - dismissedTime > threeDaysMillis) {
            localStorage.removeItem("donation-dismissed");
            dismissedTime = 0;
        }

        showDonationBanner = shouldShowDonationBanner();
        localStorage.setItem("eepy-has-visited", "true");
    });
</script>

{#if showDonationBanner && !localSponsorHidden}
    <aside
        transition:slide={{ duration: 200 }}
        aria-label="Donation appeal"
        class="border-border/60 bg-card/75 border-b backdrop-blur-md px-4 py-4 sm:px-8">
        <div class="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div class="flex items-start gap-3.5 min-w-0">
                <IconBadge variant="primary" size="sm" class="mt-0.5">
                    <MaterialSymbolsHeart class="size-5" />
                </IconBadge>
                <div class="min-w-0 text-sm">
                    <h2 class="text-foreground font-semibold">Support eepy.page</h2>
                    <p class="text-muted-foreground mt-0.5 text-xs sm:text-sm leading-relaxed">
                        eepy.page is a free community service. We rely on donations to keep servers running and domains active.
                    </p>
                    <a
                        href="https://ko-fi.com/powerpcfan"
                        target="_blank"
                        rel="noreferrer"
                        class="text-primary hover:underline inline-flex items-center gap-1 mt-1 text-xs font-medium">
                        <span>Donate on Ko-fi</span>
                        <MaterialSymbolsOpenInNew class="size-3" />
                    </a>
                </div>
            </div>

            <div class="flex flex-col *:w-40 w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto">
                <Button
                    size="sm"
                    variant="outline"
                    onclick={() => {
                        localSponsorHidden = true;
                        localStorage.setItem("already-donated", Date.now().toString());
                    }}>I already donated</Button>
                <Button
                    size="sm"
                    variant="secondary"
                    onclick={() => {
                        localSponsorHidden = true;
                        localStorage.setItem("donation-dismissed", Date.now().toString());
                    }}>Remind me later</Button>
            </div>
        </div>
    </aside>
{/if}