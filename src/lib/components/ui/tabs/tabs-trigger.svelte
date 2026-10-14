<script lang="ts">
    import { Tabs as TabsPrimitive } from "bits-ui";
    import { cn } from "$lib/utils.js";

    let {
        ref = $bindable(null),
        class: className,
        ...restProps
    }: TabsPrimitive.TriggerProps = $props();
</script>

<TabsPrimitive.Trigger
    bind:ref
    data-slot="tabs-trigger"
    class={cn(
        "gap-1.5 rounded-md px-3.5 h-8 text-xs sm:text-sm font-medium relative inline-flex items-center justify-center whitespace-nowrap transition-all",
        "text-muted-foreground hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs data-[state=active]:font-semibold",
        "after:absolute after:bottom-0.5 after:h-[2px] after:w-3/5 after:rounded-full after:bg-primary after:opacity-0 after:transition-all data-[state=active]:after:opacity-100",
        className
    )}
    {...restProps}
/>
