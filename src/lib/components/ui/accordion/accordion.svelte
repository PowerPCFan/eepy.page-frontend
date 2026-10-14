<script lang="ts">
    import { Accordion as AccordionPrimitive } from "bits-ui";
    import { getContext, setContext } from "svelte";

    let {
        ref = $bindable(null),
        value = $bindable(),
        type = "single",
        size = "default",
        hiddenUntilFound = true,
        ...restProps
    }: AccordionPrimitive.RootProps & {
        size?: "default" | "sm";
        hiddenUntilFound?: boolean;
    } = $props();

    const parentItemCtx = getContext<{ registerChildRoot?: (resetFn: () => void) => () => void } | undefined>("accordion-item");

    function collapseSelf() {
        if (Array.isArray(value)) {
            value = [];
        } else {
            value = "";
        }
    }

    $effect(() => {
        if (parentItemCtx?.registerChildRoot) {
            return parentItemCtx.registerChildRoot(collapseSelf);
        }
    });

    setContext("accordion-root", {
        get size() {
            return size;
        },
        get hiddenUntilFound() {
            return hiddenUntilFound;
        }
    });
</script>

<AccordionPrimitive.Root
    bind:ref
    bind:value={value as never}
    type={type as never}
    data-slot="accordion"
    data-size={size}
    {...restProps}
/>
