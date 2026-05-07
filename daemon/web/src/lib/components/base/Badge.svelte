<script lang="ts">
    /**
     * Badge Component
     *
     * Small status indicators with proper color contrast for accessibility.
     */

    import type { HTMLAttributes } from 'svelte/elements';

    type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';
    type BadgeSize = 'sm' | 'md' | 'lg';

    interface Props extends HTMLAttributes<HTMLSpanElement> {
        variant?: BadgeVariant;
        size?: BadgeSize;
        children?: import('svelte').Snippet;
        class?: string;
    }

    let {
        variant = 'neutral',
        size = 'md',
        children,
        class: className = '',
        ...restProps
    }: Props = $props();

    // Variant classes with WCAG AA compliant color contrast
    const variantClasses: Record<BadgeVariant, string> = {
        success: 'bg-green-100 text-green-800 border-green-300',
        warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        danger: 'bg-red-100 text-red-800 border-red-300',
        info: 'bg-blue-100 text-blue-800 border-blue-300',
        neutral: 'bg-gray-100 text-gray-800 border-gray-300',
    };

    // Size classes
    const sizeClasses: Record<BadgeSize, string> = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
        lg: 'px-3 py-1.5 text-base',
    };

    const badgeClasses = $derived(
        `inline-flex items-center gap-1 font-medium rounded-full border ${variantClasses[variant]} ${sizeClasses[size]} ${className}`
    );
</script>

<span class={badgeClasses} {...restProps}>
    {#if children}
        {@render children()}
    {/if}
</span>
