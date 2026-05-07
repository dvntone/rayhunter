<script module>
    let _counter = 0;
    function next_id(prefix: string): string {
        return `${prefix}-${++_counter}`;
    }
</script>

<script lang="ts">
    /**
     * Checkbox Component
     *
     * Styled checkbox with label and optional description.
     */

    import type { HTMLInputAttributes } from 'svelte/elements';

    // Per-instance fallback ID, computed once at instantiation (SSR-safe: no Math.random())
    const _fallback_id = next_id('checkbox');

    interface Props extends Omit<HTMLInputAttributes, 'type'> {
        id?: string;
        name?: string;
        checked?: boolean;
        label?: string;
        description?: string;
        disabled?: boolean;
        required?: boolean;
        class?: string;
    }

    let {
        id,
        name,
        checked = $bindable(false),
        label,
        description,
        disabled = false,
        required = false,
        class: className = '',
        ...restProps
    }: Props = $props();

    const checkboxId = $derived(id || name || _fallback_id);
</script>

<div class="checkbox-item flex items-start gap-3 {className}">
    <input
        type="checkbox"
        id={checkboxId}
        {name}
        bind:checked
        {disabled}
        {required}
        class="w-5 h-5 mt-0.5 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        {...restProps}
    />

    {#if label || description}
        <label for={checkboxId} class="flex-1 cursor-pointer select-none">
            {#if label}
                <span class="block text-sm font-medium text-gray-700">
                    {label}
                    {#if required}
                        <span class="text-danger" aria-label="required">*</span>
                    {/if}
                </span>
            {/if}
            {#if description}
                <span class="block text-xs text-gray-500 mt-0.5">
                    {description}
                </span>
            {/if}
        </label>
    {/if}
</div>
