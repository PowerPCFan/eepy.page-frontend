<script lang="ts">
    import CheckIcon from "@lucide/svelte/icons/check";
    import CopyIcon from "@lucide/svelte/icons/copy";
    import { Button } from "../button";
    import { cn } from "$lib/utils";

    type Variant = "inline" | "block";
    type Scrollbar = "none" | "horizontal" | "vertical" | "both";
    const defaultScrollbar: Scrollbar = "horizontal";

    type Props = {
        text: string;
        variant?: Variant;
        scrollbar?: Scrollbar;
        class?: string;
    };

    let { text, variant = "block", scrollbar = defaultScrollbar, class: className }: Props = $props();
    let copied = $state(false);
    let copyTimeout: ReturnType<typeof setTimeout>;

    async function copyText() {
        try {
            await navigator.clipboard.writeText(text);
            copied = true;
            clearTimeout(copyTimeout);
            copyTimeout = setTimeout(() => (copied = false), 1600);
        } catch {
            copied = false;
        }
    }
</script>

{#if variant === "inline"}
    <code class={cn("bg-card/70 text-foreground rounded px-1 py-0.5 font-mono text-[0.9em] break-words", className)}
        >{text}</code>
{:else}
    <div class={cn(
        "bg-card/70 border-border relative min-w-0 rounded-md border px-4 py-3 pr-14 text-sm",
        className
    )}>
        <code class={cn(
            "m-0 block min-w-0",
            scrollbar === "none" && "break-words whitespace-pre-wrap",
            scrollbar !== "none" && "codeblock-scrollbar",
            scrollbar === "horizontal" && "overflow-x-auto whitespace-pre",
            scrollbar === "vertical" && "max-h-96 overflow-y-auto break-words whitespace-pre-wrap",
            scrollbar === "both" && "max-h-96 overflow-auto whitespace-pre"
        )}>{text}</code>

        <!-- unsure if the p-0 / m-0 does anything but keeping it to be safe -->
        <Button
            type="button"
            variant="ghost"
            size="icon"
            class="absolute top-1 right-1 *:m-0 *:p-0"
            aria-label={copied ? "Copied" : "Copy code"}
            title={copied ? "Copied" : "Copy code"}
            onclick={copyText}>
            {#if copied}
                <CheckIcon />
            {:else}
                <CopyIcon />
            {/if}
        </Button>
    </div>
{/if}

<style>
    .codeblock-scrollbar {
        scrollbar-color: color-mix(in srgb, var(--muted-foreground) 20%, transparent) transparent;
        scrollbar-width: thin;
    }
    .codeblock-scrollbar::-webkit-scrollbar {
        width: 4px;
        height: 4px;
    }
    .codeblock-scrollbar::-webkit-scrollbar-track {
        background: transparent;
    }
    .codeblock-scrollbar::-webkit-scrollbar-thumb {
        background: color-mix(in srgb, var(--muted-foreground) 20%, transparent);
        border-radius: 999px;
    }
    .codeblock-scrollbar::-webkit-scrollbar-thumb:hover {
        background: color-mix(in srgb, var(--muted-foreground) 40%, transparent);
    }
</style>
