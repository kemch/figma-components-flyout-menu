<script>
import {Icon, IconSpinner} from 'figma-plugin-ds-svelte';

// export let text;
// export let icon;
export let visible;





</script>
{#if (visible === 'show')}
<div class="notification">
    <div class="icon">
        <Icon color="white" iconName={IconSpinner} spin />
    </div>
    <div class="text">
        Fetching component...
    </div>
</div>
{/if}


<style>
.notification {

    position: fixed;
    display: flex;
    align-items: center;
    font-size: var(--font-size-small);
    bottom: 36px;
    right: 4px;
    border-radius: 4px;
    background-color: black;
    color: white;
}
.icon {
    color: white;
}
</style>