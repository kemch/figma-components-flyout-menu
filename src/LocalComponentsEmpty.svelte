<script>
import {IconComponent, OnboardingTip, Icon, } from 'figma-plugin-ds-svelte';
</script>

<OnboardingTip iconName={IconComponent}>
    <div class="light">
        No local components. Refresh plugin as new components are added.
    </div>
</OnboardingTip>
<style>
.light  {
    color: var(--black3);
}
</style>