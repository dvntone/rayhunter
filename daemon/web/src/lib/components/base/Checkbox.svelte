<script lang="ts">
	/**
	 * Checkbox Component
	 *
	 * Styled checkbox with label and optional description.
	 */

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
	}: {
		id?: string;
		name?: string;
		checked?: boolean;
		label?: string;
		description?: string;
		disabled?: boolean;
		required?: boolean;
		class?: string;
		[key: string]: any;
	} = $props();

	const checkboxId = id || name || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
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
