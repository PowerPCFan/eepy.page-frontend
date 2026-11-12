<script lang="ts">
    import { t } from "$lib/i18n";
    import { fade } from "svelte/transition";

    export interface EmailSuggestion {
        address: string;
        domain: string;
        full: string;
    }

    const DEFAULT_DOMAINS: string[] = [
        "gmail.com",
        "googlemail.com",
        "outlook.com",
        "hotmail.com",
        "live.com",
        "msn.com",
        "hotmail.co.uk",
        "yahoo.com",
        "yahoo.co.uk",
        "yahoo.co.jp",
        "icloud.com",
        "me.com",
        "mac.com",
        "proton.me",
        "protonmail.com",
        "tuta.com",
        "tutamail.com",
        "tutanota.com",
        "duck.com",
        "fastmail.com",
        "hey.com",
        "gmx.com",
        "gmx.de",
        "gmx.net",
        "web.de",
        "mail.com",
        "aol.com",
        "zoho.com",
        "yandex.com",
        "yandex.ru",
        "mail.ru",
        "orange.fr",
        "free.fr",
        "laposte.net",
        "sfr.fr",
        "libero.it",
        "comcast.net",
        "verizon.net",
        "sbcglobal.net",
        "att.net",
        "cox.net",
        "charter.net",
    ];

    const DEFAULT_TOP_LEVEL_DOMAINS: string[] = [
        "com",
        "net",
        "org",
        "info",
        "edu",
        "gov",
        "mil",
        "ca",
        "io",
        "me",
        "dev",
        "app",
        "co",
        "ai",
        "de",
        "fr",
        "uk",
        "co.uk",
        "jp",
        "co.jp",
        "eu",
        "ru",
        "ch",
        "nl",
        "se",
        "no",
        "fi",
        "it",
        "es",
        "pl",
    ];

    function osaDistance(source: string, target: string): number {
        const a = Array.from(source);
        const b = Array.from(target);

        const m = a.length;
        const n = b.length;

        const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

        for (let i = 0; i <= m; i++) {
            dp[i]![0] = i;
        }

        for (let j = 0; j <= n; j++) {
            dp[0]![j] = j;
        }

        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                const cost = a[i - 1] === b[j - 1] ? 0 : 1;

                dp[i]![j] = Math.min(
                    dp[i - 1]![j]! + 1,
                    dp[i]![j - 1]! + 1,
                    dp[i - 1]![j - 1]! + cost
                );

                if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
                    dp[i]![j] = Math.min(dp[i]![j]!, dp[i - 2]![j - 2]! + 1);
                }
            }
        }

        return dp[m]![n]!;
    }

    function splitEmail(email: string): { address: string; domain: string; topLevelDomain: string } | null {
        const trimmed = email.trim();
        const parts = trimmed.split("@");
        if (parts.length < 2) return null;

        for (const part of parts) {
            if (!part) return null;
        }

        const domain = parts.pop()!;
        const domainParts = domain.split(".");

        if (domainParts.length === 0 || domainParts.some((p) => !p)) {
            return null;
        }

        let tld = "";
        if (domainParts.length === 1) {
            tld = domainParts[0]!;
        } else {
            const secondToLast = domainParts[domainParts.length - 2]!;
            if (
                domainParts.length >= 3 &&
                ["co", "com", "org", "net", "edu", "gov"].includes(secondToLast.toLowerCase())
            ) {
                tld = domainParts.slice(-2).join(".");
            } else {
                tld = domainParts.slice(1).join(".");
            }
        }

        return {
            topLevelDomain: tld,
            domain,
            address: parts.join("@"),
        };
    }

    function findClosestDomain(
        domain: string,
        domains: string[],
        threshold: number
    ): string | null {
        if (!domain || !domains.length) return null;

        let minDist = 999;
        let closestDomain: string | null = null;

        for (const d of domains) {
            if (domain === d) {
                return domain;
            }
            const dist = osaDistance(domain, d);
            if (dist < minDist) {
                minDist = dist;
                closestDomain = d;
            }
        }

        const maxAllowed = closestDomain
            ? Math.min(threshold, Math.max(1, Math.floor(closestDomain.length * 0.45)))
            : threshold;

        if (closestDomain && minDist <= maxAllowed) {
            return closestDomain;
        }

        return null;
    }

    function suggestEmail(email: string): EmailSuggestion | null {
        if (!email || !email.includes("@")) return null;

        const normalized = email.trim().toLowerCase();
        const parts = splitEmail(normalized);
        if (!parts) return null;

        const closestDomain = findClosestDomain(parts.domain, DEFAULT_DOMAINS, 4);

        if (closestDomain) {
            if (closestDomain !== parts.domain) {
                return {
                    address: parts.address,
                    domain: closestDomain,
                    full: `${parts.address}@${closestDomain}`,
                };
            }
            return null;
        }

        const closestTld = findClosestDomain(parts.topLevelDomain, DEFAULT_TOP_LEVEL_DOMAINS, 2);
        if (parts.domain && closestTld && closestTld !== parts.topLevelDomain) {
            const lastIndex = parts.domain.lastIndexOf(parts.topLevelDomain);
            if (lastIndex !== -1) {
                const newDomain = parts.domain.substring(0, lastIndex) + closestTld;
                return {
                    address: parts.address,
                    domain: newDomain,
                    full: `${parts.address}@${newDomain}`,
                };
            }
        }

        return null;
    }

    let { email = $bindable(""), onaccept }: { email: string; onaccept?: (suggestion: string) => void; } = $props();

    let dismissedFor = $state<string | null>(null);

    let suggestion: EmailSuggestion | null = $derived.by(() => {
        if (!email) return null;
        const res = suggestEmail(email);
        if (!res) return null;
        if (dismissedFor === res.full) return null;
        return res;
    });

    function accept() {
        if (!suggestion) return;
        const target = suggestion.full;
        email = target;
        onaccept?.(target);
    }

    function dismiss() {
        if (suggestion) {
            dismissedFor = suggestion.full;
        }
    }
</script>

{#if suggestion}
    <div transition:fade={{ duration: 150 }} class="flex items-center justify-between gap-1 text-xs text-muted-foreground pt-0.5">
        <span>
            {const [question, punctuation] = t("auth.fields.didYouMean", { suggestion: "\u0000" }).split("\u0000")}

            {question} <button
                type="button"
                onclick={accept}
                class="font-medium text-primary underline decoration-primary/50 underline-offset-2 hover:decoration-primary cursor-pointer transition-colors focus:outline-none"
            >{suggestion.full}</button>{punctuation}

        </span>

        <button
            type="button"
            onclick={dismiss}
            class="text-muted-foreground/70 hover:text-foreground/80 cursor-pointer focus:outline-none ml-2"
            aria-label={t("auth.fields.dismiss")}
            title={t("auth.fields.dismiss")}
        >{t("auth.fields.dismiss")}</button>
    </div>
{/if}
