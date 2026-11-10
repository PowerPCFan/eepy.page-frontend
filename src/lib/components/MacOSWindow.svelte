<script lang="ts">
    import type { Snippet } from "svelte";
    import { cn } from "$lib/utils";

    let {
        title = "eepy.page",
        class: className = "",
        bodyClass = "",
        children
    }: {
        title?: string;
        class?: string;
        bodyClass?: string;
        children?: Snippet;
    } = $props();
</script>

<div class={cn(
    "group relative flex flex-col overflow-hidden rounded-2xl border border-border/70 " +
    "bg-card/90 dark:bg-zinc-950/85 backdrop-blur-xl",
    className
)}>
    <div class="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/20 to-transparent"></div>
    <div class="flex h-10 w-full shrink-0 select-none items-center justify-between border-b border-border/50 px-3.5 bg-muted/40 dark:bg-zinc-900/50">
        <div class="flex items-center gap-2 *:border *:border-black/6 *:size-3 *:rounded-full">
            <span class="bg-[#FF5F56]"></span>
            <span class="bg-[#FFBD2E]"></span>
            <span class="bg-[#27C93F]"></span>
        </div>

        <div class="mx-auto text-xs font-medium text-muted-foreground truncate px-2">
            {title}
        </div>

        <div class="w-12 shrink-0"></div>
    </div>

    <div class="relative flex-1 overflow-hidden {bodyClass}">
        {#if children}
            {@render children()}
        {/if}
    </div>
</div>
