<script lang="ts">
    import { Accordion as AccordionPrimitive } from "bits-ui";
    import { cn, type WithoutChild } from "$lib/utils";
    import { getContext } from "svelte";

    let {
        ref = $bindable(null),
        class: className,
        size,
        hiddenUntilFound,
        children,
        ...restProps
    }: WithoutChild<AccordionPrimitive.ContentProps> & {
        size?: "default" | "sm";
        hiddenUntilFound?: boolean;
    } = $props();

    const itemCtx = getContext<{ size?: "default" | "sm"; hiddenUntilFound?: boolean } | undefined>("accordion-item");
    const rootCtx = getContext<{ size?: "default" | "sm"; hiddenUntilFound?: boolean } | undefined>("accordion-root");
    const currentSize = $derived(size ?? itemCtx?.size ?? rootCtx?.size ?? "default");
    const currentHiddenUntilFound = $derived(
        hiddenUntilFound ?? itemCtx?.hiddenUntilFound ?? rootCtx?.hiddenUntilFound ?? false
    );
</script>

<AccordionPrimitive.Content
    bind:ref
    data-slot="accordion-content"
    data-size={currentSize}
    hiddenUntilFound={currentHiddenUntilFound}
    class={cn(
        "data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden",
        currentSize === "sm" ? "text-xs sm:text-sm" : "text-sm"
    )}
    {...restProps}
>
    <div class={cn(currentSize === "sm" ? "pb-2.5 pt-0" : "pb-4 pt-0", className)}>
        {@render children?.()}
    </div>
</AccordionPrimitive.Content>
