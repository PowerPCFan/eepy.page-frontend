<script lang="ts">
    import { Accordion as AccordionPrimitive } from "bits-ui";
    import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
    import { cn, type WithoutChild } from "$lib/utils";
    import { getContext } from "svelte";

    let {
        ref = $bindable(null),
        class: className,
        level = 3,
        size,
        children,
        ...restProps
    }: WithoutChild<AccordionPrimitive.TriggerProps> & {
        level?: AccordionPrimitive.HeaderProps["level"];
        size?: "default" | "sm";
    } = $props();

    const itemCtx = getContext<{ size?: "default" | "sm" } | undefined>("accordion-item");
    const rootCtx = getContext<{ size?: "default" | "sm" } | undefined>("accordion-root");
    const currentSize = $derived(size ?? itemCtx?.size ?? rootCtx?.size ?? "default");
</script>

<AccordionPrimitive.Header {level} class="flex">
    <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        data-size={currentSize}
        bind:ref
        class={cn(
            "focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between rounded-md text-left outline-none transition-all hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180",
            currentSize === "sm" ? "py-2 gap-2 text-sm font-medium" : "py-4 gap-4 text-sm font-medium",
            className
        )}
        {...restProps}
    >
        {@render children?.()}
        <ChevronDownIcon
            class={cn(
                "text-muted-foreground pointer-events-none shrink-0 translate-y-0.5 transition-transform duration-200",
                currentSize === "sm" ? "size-3.5" : "size-4"
            )}
        />
    </AccordionPrimitive.Trigger>
</AccordionPrimitive.Header>
