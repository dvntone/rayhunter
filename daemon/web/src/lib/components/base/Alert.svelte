<script lang="ts">
	/**
	 * Alert Component
	 *
	 * Displays contextual feedback messages with different severity levels.
	 * Supports dismissible alerts with proper accessibility.
	 */

	type AlertType = 'success' | 'info' | 'warning' | 'danger';

	let {
		type = 'info',
		title,
		dismissible = false,
		children,
		onDismiss,
		class: className = '',
		...restProps
	}: {
		type?: AlertType;
		title?: string;
		dismissible?: boolean;
		children?: import('svelte').Snippet;
		onDismiss?: () => void;
		class?: string;
		[key: string]: any;
	} = $props();

	let visible = $state(true);

	function handleDismiss() {
		visible = false;
		onDismiss?.();
	}

	// Icon mapping
	const icons: Record<AlertType, string> = {
		success: '✓',
		info: 'ℹ',
		warning: '⚠',
		danger: '✕'
	};

	// Color classes
	const typeClasses: Record<AlertType, string> = {
		success: 'bg-green-50 border-l-success text-green-800',
		info: 'bg-blue-50 border-l-info text-blue-800',
		warning: 'bg-yellow-50 border-l-warning text-yellow-800',
		danger: 'bg-red-50 border-l-danger text-red-800'
	};

	// Icon color classes
	const iconClasses: Record<AlertType, string> = {
		success: 'text-green-600',
		info: 'text-blue-600',
		warning: 'text-yellow-600',
		danger: 'text-red-600'
	};

	const alertClasses = `flex items-start gap-3 p-4 rounded-lg border-l-4 ${typeClasses[type]} ${className}`;
</script>

{#if visible}
	<div class={alertClasses} role="alert" {...restProps}>
		<!-- Icon -->
		<div
			class="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full font-bold {iconClasses[
				type
			]}"
			aria-hidden="true"
		>
			{icons[type]}
		</div>

		<!-- Content -->
		<div class="flex-1 min-w-0">
			{#if title}
				<h3 class="font-semibold mb-1">{title}</h3>
			{/if}
			{#if children}
				<div class="text-sm">
					{@render children()}
				</div>
			{/if}
		</div>

		<!-- Dismiss button -->
		{#if dismissible}
			<button
				type="button"
				onclick={handleDismiss}
				class="flex-shrink-0 p-1 rounded hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-current"
				aria-label="Dismiss alert"
			>
				<svg
					class="w-5 h-5"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</button>
		{/if}
	</div>
{/if}
