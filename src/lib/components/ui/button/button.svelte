<script lang="ts" module>
    import { cn, type WithElementRef } from "$lib/utils";
    import type { HTMLAnchorAttributes, HTMLButtonAttributes } from "svelte/elements";
    import { tv, type VariantProps } from "tailwind-variants";
    import Loader from "../loader/loader.svelte";

    export const buttonVariants = tv({
        base: "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium outline-none transition-[transform,background-color,border-color,color,opacity,box-shadow] duration-200 ease-out active:scale-[0.97] select-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        variants: {
            variant: {
                default: "bg-primary text-primary-foreground shadow-xs hover:brightness-105 active:brightness-95",
                destructive: "bg-destructive text-white shadow-xs hover:brightness-110 active:brightness-90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
                outline: "bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 border",
                secondary: "bg-secondary text-secondary-foreground shadow-xs hover:brightness-95 active:brightness-90",
                ghost: "border border-border/40 bg-muted/25 text-foreground/85 hover:bg-muted/45 hover:border-border/60 hover:text-foreground active:bg-muted/65 shadow-2xs",
                link: "text-primary underline-offset-4 hover:underline active:opacity-80"
            },
            size: {
                default: "h-9 px-4 py-2 has-[>svg]:px-3",
                sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5 text-xs",
                lg: "h-10 rounded-md px-6 has-[>svg]:px-4 text-base",
                icon: "size-9"
            }
        },
        defaultVariants: {
            variant: "default",
            size: "default"
        }
    });

    export type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];
    export type ButtonSize = VariantProps<typeof buttonVariants>["size"];

    export type ButtonProps = WithElementRef<HTMLButtonAttributes> &
        WithElementRef<HTMLAnchorAttributes> & {
            variant?: ButtonVariant;
            size?: ButtonSize;
            loading?: boolean;
        };
</script>

<script lang="ts">
    let {
        class: className,
        variant = "default",
        size = "default",
        loading = false,
        ref = $bindable(null),
        href = undefined,
        type = "button",
        target = undefined,
        rel = undefined,
        disabled,
        children,
        ...restProps
    }: ButtonProps = $props();

    let isExternal = $derived(
        typeof href === "string" && (href.startsWith("http://") || href.startsWith("https://"))
    );
    let computedTarget = $derived(target ?? (isExternal ? "_blank" : undefined));
    let computedRel = $derived(rel ?? (isExternal ? "noreferrer noopener" : undefined));
</script>

{#if href}
    <a
        bind:this={ref}
        data-slot="button"
        class={cn(buttonVariants({ variant, size }), className)}
        href={disabled ? undefined : href}
        target={computedTarget}
        rel={computedRel}
        aria-disabled={disabled}
        role={disabled ? "link" : undefined}
        tabindex={disabled ? -1 : undefined}
        {...restProps}>
        {@render children?.()}
    </a>
{:else}
    <button
        bind:this={ref}
        data-slot="button"
        class={cn(buttonVariants({ variant, size }), className)}
        type={type}
        disabled={disabled || loading}
        {...restProps}>
        {#if loading}
            <Loader />
        {:else}
            {@render children?.()}
        {/if}
    </button>
{/if}

<style>
    :global(a[data-slot="button"]) {
        color: inherit;
        text-decoration: none;
    }
</style>
