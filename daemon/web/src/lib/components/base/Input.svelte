<script lang="ts">
	/**
	 * Input Component
	 *
	 * Styled text input with label, help text, and error states.
	 */

	type InputType = 'text' | 'number' | 'email' | 'url' | 'password' | 'tel';

	let {
		type = 'text',
		id,
		name,
		value = $bindable(''),
		label,
		helpText,
		errorMessage,
		required = false,
		disabled = false,
		placeholder,
		class: className = '',
		...restProps
	}: {
		type?: InputType;
		id?: string;
		name?: string;
		value?: string | number;
		label?: string;
		helpText?: string;
		errorMessage?: string;
		required?: boolean;
		disabled?: boolean;
		placeholder?: string;
		class?: string;
		[key: string]: any;
	} = $props();

	const hasError = !!errorMessage;
	const inputId = id || name || `input-${Math.random().toString(36).substr(2, 9)}`;

	// Input classes
	const baseInputClasses =
		'w-full px-4 py-2 border-2 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:bg-gray-100 disabled:cursor-not-allowed';

	const stateClasses = hasError
		? 'border-danger focus:border-danger focus:ring-danger'
		: 'border-gray-300 focus:border-primary focus:ring-primary';

	const inputClasses = `${baseInputClasses} ${stateClasses} ${className}`;
</script>

<div class="form-group">
	{#if label}
		<label for={inputId} class="block text-sm font-medium text-gray-700 mb-1">
			{label}
			{#if required}
				<span class="text-danger" aria-label="required">*</span>
			{/if}
		</label>
	{/if}

	<input
		{type}
		id={inputId}
		{name}
		bind:value
		{placeholder}
		{required}
		{disabled}
		class={inputClasses}
		aria-invalid={hasError}
		aria-describedby={helpText || errorMessage
			? `${inputId}-description`
			: undefined}
		{...restProps}
	/>

	{#if helpText && !hasError}
		<p id="{inputId}-description" class="mt-1 text-xs text-gray-500">
			{helpText}
		</p>
	{/if}

	{#if errorMessage}
		<p id="{inputId}-description" class="mt-1 text-xs text-danger" role="alert">
			{errorMessage}
		</p>
	{/if}
</div>
