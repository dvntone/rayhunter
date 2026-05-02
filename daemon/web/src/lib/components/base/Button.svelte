<script lang="ts">
	/**
	 * Base Button Component
	 *
	 * A reusable button component with multiple variants, sizes, and states.
	 * Supports loading states, disabled states, and accessible patterns.
	 */

	type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
	type ButtonSize = 'sm' | 'md' | 'lg';
	type ButtonType = 'button' | 'submit' | 'reset';

	let {
		variant = 'primary',
		size = 'md',
		type = 'button',
		disabled = false,
		loading = false,
		fullWidth = false,
		children,
		onclick,
		class: className = '',
		...restProps
	}: {
		variant?: ButtonVariant;
		size?: ButtonSize;
		type?: ButtonType;
		disabled?: boolean;
		loading?: boolean;
		fullWidth?: boolean;
		children?: import('svelte').Snippet;
		onclick?: (event: MouseEvent) => void;
		class?: string;
		[key: string]: any;
	} = $props();

	// Base classes
	const baseClasses =
		'inline-flex items-center justify-center gap-2 font-semibold rounded-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

	// Variant classes
	const variantClasses: Record<ButtonVariant, string> = {
		primary:
			'bg-primary text-white hover:bg-primary-dark focus:ring-primary active:transform active:scale-95',
		secondary:
			'bg-gray-100 text-gray-900 border-2 border-gray-300 hover:bg-gray-200 focus:ring-gray-400',
		danger:
			'bg-danger text-white hover:bg-danger-dark focus:ring-danger active:transform active:scale-95',
		outline:
			'bg-transparent border-2 border-gray-300 text-gray-700 hover:border-primary hover:text-primary focus:ring-primary',
		ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-400'
	};

	// Size classes
	const sizeClasses: Record<ButtonSize, string> = {
		sm: 'px-3 py-1.5 text-sm',
		md: 'px-4 py-2 text-base',
		lg: 'px-6 py-3 text-lg'
	};

	// Loading spinner classes
	const spinnerSizeClasses: Record<ButtonSize, string> = {
		sm: 'w-4 h-4',
		md: 'w-5 h-5',
		lg: 'w-6 h-6'
	};

	// Derived reactive values
	const widthClass = $derived(fullWidth ? 'w-full' : '');
	const buttonClasses = $derived(`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`);
	const isDisabled = $derived(disabled || loading);
</script>

<button
	{type}
	class={buttonClasses}
	disabled={isDisabled}
	{onclick}
	aria-busy={loading}
	{...restProps}
>
	{#if loading}
		<div
			class="border-2 border-current border-t-transparent rounded-full animate-spin {spinnerSizeClasses[
				size
			]}"
			role="status"
			aria-label="Loading"
		></div>
	{/if}
	{#if children}
		{@render children()}
	{/if}
</button>
