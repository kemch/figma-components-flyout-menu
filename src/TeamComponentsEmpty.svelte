<script>
import {IconLibrary, OnboardingTip, Icon, } from 'figma-plugin-ds-svelte';
</script>

<OnboardingTip iconName={IconLibrary}>
    <div class="light">
        Saved Team Libraries (0) <br /> <br />
        To add team libraries, open the original team library document and add it here with this plugin.
    </div>
</OnboardingTip>
<style>
.light  {
    color: var(--black3);
    user-select: none;
}
</style>