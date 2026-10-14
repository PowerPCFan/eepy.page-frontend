<script lang="ts" module>
    import { tv, type VariantProps } from "tailwind-variants";

	export const tabsListVariants = tv({
		base: "group/tabs-list inline-flex items-center justify-center text-muted-foreground",
		variants: {
			variant: {
				default: "rounded-lg p-[3px] bg-muted group-data-horizontal/tabs:h-8 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col",
				line: "gap-1 bg-transparent group-data-horizontal/tabs:h-8 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col",
				segmented: "rounded-lg border border-border/60 bg-muted/30 p-0.5 gap-0.5 h-8 w-fit inline-flex shadow-xs",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	});

    export type TabsListVariant = VariantProps<typeof tabsListVariants>["variant"];
</script>

<script lang="ts">
    import { Tabs as TabsPrimitive } from "bits-ui";
    import { cn } from "$lib/utils.js";

    let {
        ref = $bindable(null),
        variant = "default",
        class: className,
        ...restProps
    }: TabsPrimitive.ListProps & {
        variant?: TabsListVariant;
    } = $props();
</script>

<TabsPrimitive.List
    bind:ref
    data-slot="tabs-list"
    data-variant={variant}
    class={cn(tabsListVariants({ variant }), className)}
    {...restProps}
/>
