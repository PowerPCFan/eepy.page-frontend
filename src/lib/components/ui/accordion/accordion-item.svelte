<script lang="ts">
    import { Accordion as AccordionPrimitive } from "bits-ui";
    import { cn } from "$lib/utils";
    import { getContext, setContext } from "svelte";

    let {
        ref = $bindable(null),
        class: className,
        size,
        hiddenUntilFound,
        ...restProps
    }: AccordionPrimitive.ItemProps & {
        size?: "default" | "sm";
        hiddenUntilFound?: boolean;
    } = $props();

    const rootCtx = getContext<{ size?: "default" | "sm"; hiddenUntilFound?: boolean } | undefined>("accordion-root");
    const itemSize = $derived(size ?? rootCtx?.size ?? "default");
    const itemHiddenUntilFound = $derived(hiddenUntilFound ?? rootCtx?.hiddenUntilFound ?? false);

    const childResetFns = new Set<() => void>();

    function registerChildRoot(resetFn: () => void) {
        childResetFns.add(resetFn);
        return () => {
            childResetFns.delete(resetFn);
        };
    }

    setContext("accordion-item", {
        get size() {
            return itemSize;
        },
        get hiddenUntilFound() {
            return itemHiddenUntilFound;
        },
        registerChildRoot
    });

    $effect(() => {
        if (!ref) return;

        let wasOpen = ref.getAttribute("data-state") === "open";

        const observer = new MutationObserver(() => {
            const isOpen = ref?.getAttribute("data-state") === "open";
            if (wasOpen && !isOpen) {
                for (const reset of childResetFns) {
                    reset();
                }
            }
            wasOpen = isOpen;
        });

        observer.observe(ref, {
            attributes: true,
            attributeFilter: ["data-state"]
        });

        return () => {
            observer.disconnect();
        };
    });
</script>

<AccordionPrimitive.Item
    bind:ref
    data-slot="accordion-item"
    data-size={itemSize}
    class={cn("border-b last:border-b-0", className)}
    {...restProps}
/>
