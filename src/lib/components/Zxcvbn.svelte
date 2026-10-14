<script lang="ts">
    import { ZxcvbnFactory } from "@zxcvbn-ts/core";
    import * as zxcvbnEnPackage from "@zxcvbn-ts/language-en";

    const zxcvbnInstance = new ZxcvbnFactory({
        translations: zxcvbnEnPackage.translations,
        dictionary: zxcvbnEnPackage.dictionary,
    });

    let {
        password = "",
        score = $bindable(-1),
        tooWeak = $bindable(false),
        class: className = "",
    }: {
        password: string;
        score?: number;
        tooWeak?: boolean;
        class?: string;
    } = $props();

    function computePwScore(): number {
        if (!password) return -1;

        try {
            return zxcvbnInstance.check(password).score;
        } catch {
            return 0;
        }
    }

    function getSentence(score: number): string {
        switch (score) {
            case 0: return "Your password is too weak.";
            case 1: return "Your password is too weak.";
            case 2: return "Good start, can be stronger.";
            case 3: return "Strong password.";
            case 4: return "Very secure password!";
            default: return "Uh-oh, something went wrong.";
        }
    }

    function getDescriptor(score: number): string {
        switch (score) {
            case 0: return "Very weak";
            case 1: return "Weak";
            case 2: return "Fair";
            case 3: return "Strong";
            case 4: return "Very strong";
            default: return "Unknown";
        }
    }

    function getSentenceTw(score: number): string {
        let color = (score === 0 || score === 1) ? "text-destructive" : "text-muted-foreground";
        return color + " font-normal";
    }

    function getDescriptorTw(score: number): string {
        let color = "";
        switch (score) {
            case 0: color = "text-destructive"; break;
            case 1: color = "text-destructive"; break;
            case 2: color = "text-amber-500"; break;
            case 3: color = "text-emerald-500"; break;
            case 4: color = "text-emerald-600 dark:text-emerald-400"; break;
            default: color = "text-muted-foreground"; break;
        }
        return color + " font-semibold";
    }

    function getBarTw(score: number, step: number): string {
        if (score < step) return 'bg-muted';

        switch (score) {
            case 1: return 'bg-red-500';
            case 2: return 'bg-orange-500';
            case 3: return 'bg-amber-500';
            default: return 'bg-emerald-500';
        }
    }

    let computedScore = $derived.by(computePwScore);
    let computedTooWeak = $derived(password.length > 0 && computedScore <= 1);

    $effect(() => {
        score = computedScore;
        tooWeak = computedTooWeak;
    });
</script>

{#if password.length > 0}
    <div class="space-y-1.5 pt-1.5 text-xs {className}">
        <div class="grid grid-cols-4 gap-1.5">
            {#each [1, 2, 3, 4] as step}
                <div class="h-1 rounded-full transition-all duration-300 {getBarTw(computedScore, step)}"></div>
            {/each}
        </div>
        <div class="flex items-center justify-between text-xs font-medium">
            <span class={getSentenceTw(computedScore)}>{getSentence(computedScore)}</span>
            <span class={getDescriptorTw(computedScore)}>{getDescriptor(computedScore)}</span>
        </div>
    </div>
{/if}