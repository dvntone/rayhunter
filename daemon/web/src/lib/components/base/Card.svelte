<script lang="ts">
	/**
	 * Base Card Component
	 *
	 * A flexible card container with slots for header, body, and footer.
	 * Supports multiple variants and status indicators.
	 */

	type CardVariant = 'default' | 'elevated' | 'flat' | 'outlined';
	type StatusType = 'success' | 'warning' | 'danger' | 'info' | null;

	let {
		variant = 'default',
		status = null,
		header,
		children,
		footer,
		class: className = '',
		...restProps
	}: {
		variant?: CardVariant;
		status?: StatusType;
		header?: import('svelte').Snippet;
		children?: import('svelte').Snippet;
		footer?: import('svelte').Snippet;
		class?: string;
		[key: string]: any;
	} = $props();

	// Base classes
	const baseClasses = 'rounded-lg overflow-hidden transition-all duration-300';

	// Variant classes
	const variantClasses: Record<CardVariant, string> = {
		default: 'bg-white shadow-md',
		elevated: 'bg-white shadow-lg hover:shadow-xl',
		flat: 'bg-white border-2 border-gray-200',
		outlined: 'bg-transparent border-2 border-gray-300'
	};

	// Status border classes (only for non-null status)
	const statusBorderClasses: Record<Exclude<StatusType, null>, string> = {
		success: 'border-l-4 border-l-success',
		warning: 'border-l-4 border-l-warning',
		danger: 'border-l-4 border-l-danger',
		info: 'border-l-4 border-l-info'
	};

	// Status background classes (only for non-null status)
	const statusBgClasses: Record<Exclude<StatusType, null>, string> = {
		success: 'bg-green-50',
		warning: 'bg-yellow-50',
		danger: 'bg-red-50',
		info: 'bg-blue-50'
	};

	// Derived reactive values
	const cardClasses = $derived(`${baseClasses} ${variantClasses[variant]} ${status ? statusBorderClasses[status] : ''} ${className}`);
	const bodyBgClass = $derived(status ? statusBgClasses[status] : '');
</script>

<div class={cardClasses} {...restProps}>
	{#if header}
		<div class="px-6 py-4 border-b border-gray-200">
			{@render header()}
		</div>
	{/if}

	{#if children}
		<div class="px-6 py-4 {bodyBgClass}">
			{@render children()}
		</div>
	{/if}

	{#if footer}
		<div class="px-6 py-4 border-t border-gray-200 bg-gray-50">
			{@render footer()}
		</div>
	{/if}
</div>
