<script module>
    let _counter = 0;
    function next_id(prefix: string): string {
        return `${prefix}-${++_counter}`;
    }
</script>

<script lang="ts">
    /**
     * Select Component
     *
     * Styled dropdown select with label and help text.
     */

    import type { HTMLSelectAttributes } from 'svelte/elements';

    // Per-instance fallback ID, computed once at instantiation (SSR-safe: no Math.random())
    const _fallback_id = next_id('select');

    interface Props extends HTMLSelectAttributes {
        id?: string;
        name?: string;
        value?: string | number;
        label?: string;
        helpText?: string;
        errorMessage?: string;
        required?: boolean;
        disabled?: boolean;
        options?: Array<{ value: string | number; label: string }>;
        children?: import('svelte').Snippet;
        class?: string;
    }

    let {
        id,
        name,
        value = $bindable(''),
        label,
        helpText,
        errorMessage,
        required = false,
        disabled = false,
        options = [],
        children,
        class: className = '',
        ...restProps
    }: Props = $props();

    const selectId = $derived(id || name || _fallback_id);

    const hasError = $derived(!!errorMessage);

    // Select classes
    const baseSelectClasses =
        'w-full px-4 py-2 pr-10 border-2 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:bg-gray-100 disabled:cursor-not-allowed appearance-none bg-white cursor-pointer';

    const stateClasses = $derived(
        hasError
            ? 'border-danger focus:border-danger focus:ring-danger'
            : 'border-gray-300 focus:border-primary focus:ring-primary'
    );

    const selectClasses = $derived(`${baseSelectClasses} ${stateClasses} ${className}`);
</script>

<div class="form-group">
    {#if label}
        <label for={selectId} class="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {#if required}
                <span class="text-danger" aria-label="required">*</span>
            {/if}
        </label>
    {/if}

    <div class="relative">
        <select
            id={selectId}
            {name}
            bind:value
            {required}
            {disabled}
            class={selectClasses}
            aria-invalid={hasError}
            aria-describedby={helpText || errorMessage ? `${selectId}-description` : undefined}
            {...restProps}
        >
            {#if children}
                {@render children()}
            {:else}
                {#each options as option}
                    <option value={option.value}>{option.label}</option>
                {/each}
            {/if}
        </select>

        <!-- Custom dropdown arrow -->
        <div
            class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700"
        >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                />
            </svg>
        </div>
    </div>

    {#if helpText && !hasError}
        <p id="{selectId}-description" class="mt-1 text-xs text-gray-500">
            {helpText}
        </p>
    {/if}

    {#if errorMessage}
        <p id="{selectId}-description" class="mt-1 text-xs text-danger" role="alert">
            {errorMessage}
        </p>
    {/if}
</div>
