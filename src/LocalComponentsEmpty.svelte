<script>
import {IconComponent, OnboardingTip, Icon, } from 'figma-plugin-ds-svelte';
</script>

<OnboardingTip iconName={IconComponent}>
    <div class="light">
        No local components
    </div>
</OnboardingTip>
<style>
.light  {
    color: var(--black3);
    user-select: none;
}
:global(.onboarding-tip .icon.icon) {
    margin-right: 0;
}
:global(.onboarding-tip) {
    padding-left: 18px !important;
}
</style>