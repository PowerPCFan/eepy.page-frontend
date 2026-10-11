<script lang="ts">
    import { fade } from "svelte/transition";
    import MaterialSymbolsCloseSmallRounded from "~icons/material-symbols/close-small-rounded";
    import MaterialSymbolsInfoOutline from "~icons/material-symbols/info-outline";
    import MaterialSymbolsWarningOutline from "~icons/material-symbols/warning-outline";
    import MaterialSymbolsErrorOutline from "~icons/material-symbols/error-outline";
    interface Props {
        variant: "error" | "note" | "warning";
        title: string;
        description: string;
        trigger?: number;
        className?: string;
        renderDescriptionAsHTML?: boolean;
        permanent?: boolean;
    }
    let {
        variant,
        title,
        description,
        trigger,
        className,
        renderDescriptionAsHTML,
        permanent = false
    }: Props = $props();
    let closed: boolean = $state(true);

    $effect(() => {
        trigger;
        if (title && description) {
            closed = false;
        } else {
            closed = true;
        }
    });
</script>

{#if !closed}
    <div
        class={`alert mt-4 min-h-24 rounded-lg border-2 p-4 sentry-unmask ${variant === "error" ? "bg-alert" : variant === "warning" ? "bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200" : "bg-note"} ${className}`}
        transition:fade={{ duration: 100 }}>
        <div class="flex justify-between">
            <div class="text flex items-center">
                {#if variant === "error"}
                    <MaterialSymbolsErrorOutline class="mr-2 shrink-0" />
                {:else if variant === "warning"}
                    <MaterialSymbolsWarningOutline class="mr-2 shrink-0" />
                {:else}
                    <MaterialSymbolsInfoOutline class="mr-2 shrink-0" />
                {/if}
                <h2 class="text-xl font-semibold">{title}</h2>
            </div>
            {#if !permanent}
                <div>
                    <a onclick={_ => (closed = true)} href="##">
                        <MaterialSymbolsCloseSmallRounded class={variant === "error" ? "text-red-600" : variant === "warning" ? "text-amber-600 dark:text-amber-400" : ""} />
                    </a>
                </div>
            {/if}
        </div>

        <p>{#if renderDescriptionAsHTML}{@html description}{:else}{description}{/if}</p>
    </div>
{/if}
