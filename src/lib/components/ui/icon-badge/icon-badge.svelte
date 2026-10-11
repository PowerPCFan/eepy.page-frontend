<script lang="ts" module>
    import { cn, type WithElementRef } from "$lib/utils";
    import type { HTMLAttributes } from "svelte/elements";
    import { tv, type VariantProps } from "tailwind-variants";

    export const iconBadgeVariants = tv({
        base: "inline-flex shrink-0 items-center justify-center transition-colors select-none",
        variants: {
            variant: {
                primary: "bg-primary/10 text-primary border-primary/20",
                destructive: "bg-destructive/10 text-destructive/90 border-destructive/20",
                secondary: "bg-secondary text-secondary-foreground border-border",
                muted: "bg-muted text-muted-foreground border-border"
            },
            size: {
                sm: "size-8 rounded-lg [&_svg]:size-4",
                md: "size-10 rounded-xl [&_svg]:size-5",
                lg: "size-12 rounded-xl [&_svg]:size-6",
                xl: "size-14 rounded-2xl [&_svg]:size-7",
                "2xl": "size-16 rounded-2xl [&_svg]:size-8"
            },
            shape: {
                rounded: "",
                circle: "rounded-full",
                square: "rounded-lg"
            },
            border: {
                true: "border",
                false: ""
            }
        },
        defaultVariants: {
            variant: "primary",
            size: "md",
            shape: "rounded",
            border: false
        }
    });

    export type IconBadgeVariant = VariantProps<typeof iconBadgeVariants>["variant"];
    export type IconBadgeSize = VariantProps<typeof iconBadgeVariants>["size"];
    export type IconBadgeShape = VariantProps<typeof iconBadgeVariants>["shape"];

    export type IconBadgeProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
        variant?: IconBadgeVariant;
        size?: IconBadgeSize;
        shape?: IconBadgeShape;
        border?: boolean;
    };
</script>

<script lang="ts">
    let {
        class: className,
        variant = "primary",
        size = "md",
        shape = "rounded",
        border = false,
        ref = $bindable(null),
        children,
        ...restProps
    }: IconBadgeProps = $props();
</script>

<div
    bind:this={ref}
    data-slot="icon-badge"
    class={cn(iconBadgeVariants({ variant, size, shape, border }), className)}
    {...restProps}>
    {@render children?.()}
</div>
