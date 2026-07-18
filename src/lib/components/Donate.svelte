<script lang="ts">
    import Button from "$lib/components/ui/button/button.svelte";
    import { CONSENT_COOKIE_NAME } from "$lib/consent";
    import { onMount } from "svelte";

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
    <div class="donation-banner flex w-full items-center justify-between gap-6 px-8 py-4">
        <div class="min-w-0 text-sm">
            <h1 class="text-xl font-semibold">Have you considered donating?</h1>
            <p>
                eepy.page is an entirely free service. We rely on your donations to cover domain prices and server costs.
                <br>Even small donations would help us out immensely.
            </p>
            <a class="text-base" href="https://ko-fi.com/powerpcfan">Donate on Ko-fi</a>
        </div>

        <div class="donation-actions">
            <Button
                variant="destructive"
                onclick={() => {
                    localSponsorHidden = true;
                    localStorage.setItem("donation-dismissed", Date.now().toString());
                }}>Remind me later</Button>
            <Button
                variant={"secondary"}
                onclick={() => {
                    localSponsorHidden = true;
                    localStorage.setItem("already-donated", Date.now().toString());
                }}>I already donated</Button>
        </div>
    </div>
{/if}

<style>
    .donation-actions {
        display: flex;
        flex: none;
        flex-direction: column;
        gap: 0.65rem;
        min-width: 12rem;
    }

    .donation-actions :global(button) {
        width: 100%;
        justify-content: center;
        white-space: nowrap;
    }

    @media (max-width: 700px) {
        .donation-banner {
            align-items: stretch;
            flex-direction: column;
        }

        .donation-actions {
            min-width: 0;
            width: 100%;
        }

        .donation-banner :global(button) {
            width: 100%;
        }
    }
</style>