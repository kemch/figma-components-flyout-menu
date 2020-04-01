<script>
import Menu from "./Menu.svelte";
import {Button, IconLibrary, IconButton, IconComponent, OnboardingTip, Icon, IconMinus, IconCaretRight, IconCaretDown, IconTrash, IconBreak} from 'figma-plugin-ds-svelte';
import TeamComponentsEmpty from './TeamComponentsEmpty.svelte';
import LocalComponentsEmpty from './LocalComponentsEmpty.svelte';
export let library;
export let index;
export let count;
export let teamLibsCount;


let key = library[0].source
let expanded = false;
// if (key === 'Local Components') {
//     expanded = true;
// }

function toggle() {
    expanded = !expanded;

    // const root = document.getElementById('root');
    setTimeout(() => {
        const rect = document.getElementById('root').getClientRects();
        const size = {width: rect[0].width, height: rect[0].height}
        if (size.height < 400) {
            size.height = 400;
        }

        if (size.height > 800) {
            size.height = 800;
        }
    
        // console.log(rect)
        if (expanded) {
            parent.postMessage({pluginMessage: {
                'type':'resize',
                'size': size
            }},'*');
        }
    }, 10);
}
let confirmVisible = false;
function confirm() {
    confirmVisible = !confirmVisible;
}
 function remove() {
    parent.postMessage({pluginMessage: {
        'type':'remove', key:key
    }}, '*');
}
function cancel() {
    confirmVisible = !confirmVisible;
}
</script>
{#if index === 0 && key !== 'Local Components'}
    <LocalComponentsEmpty />
{/if}
{#if (index === 1 && count > 1 || count === 1 && key !=='Local Components')}
    <OnboardingTip iconName={IconLibrary}>
        <div class="light">
           Saved Team Libraries ({teamLibsCount})
        </div>
    </OnboardingTip>
{/if}
<div class="header">
    <div class="header__name" on:click={toggle}>
        <div class="header__icon">
            {#if expanded}
                <Icon iconName={IconCaretDown}/>
            {:else}
                <Icon iconName={IconCaretRight}/>
            {/if}
        </div>
        {key}
    </div>
    {#if key !== 'Local Components'}
    <div class="header__right">
        <IconButton title="Remove Library" on:click={confirm} iconName={IconMinus}/>
    </div>
    {/if}
</div>
{#if expanded}
<div class="menu__wrap">
    <Menu components={library} />
</div>
{/if}

{#if (count === 1 && key === 'Local Components')}
    <TeamComponentsEmpty />
{/if}

{#if confirmVisible}
    <div class="confirm">
        <div class="confirm__content">
            Are you sure you want to remove this team library from the flyout menu plugin?
            <div class="confirm__actions">
                <Button variant="secondary" on:click={cancel}>Cancel</Button>
                <Button variant="primary" on:click={remove}>Remove</Button>
            </div>
        </div>
    </div>
{/if}

<style>
.menu__wrap {
    position: relative;
}
.header {
    /* border-top: 1px solid rgba(0, 0, 0, 0.1); */
    /* margin-top: -1px; */
    font-weight: var(--font-weight-medium);
    display: flex;
    align-items: center;
    user-select: none;
    cursor: pointer;
}
.header__name {
    display: flex;
    align-items: center;
    width: 100%;
}
.header:hover {
    background-color: #f0f0f0;
}
.header__right {
    margin-left: auto;
    padding-right: 16px;
}
.header__icon {
    /* display: inline-block;    */
    vertical-align: middle;
    margin-right: -4px;
}
h3 {
    font-size: 11px;
    
}
.local__empty {
    padding: 10px 20px;
    color: var(--black3);
    user-select: none;
}
.confirm {
    height: 100%;
    position: fixed;
    top: 0;
    /* bottom: 0; */
    left: 0;
    right: 0;
    background-color: white;
    z-index: 100;
    display: flex;
    /* align-items: center; */
    padding: 16px;
}

.confirm__actions {
    margin-top: 12px;
    display: flex;
    text-align: right;
    justify-content: flex-end;
}
.light {
    color: var(--black3);
}
:global(.confirm__actions button) {
    margin-left: 8px;
}
:global(.onboarding-tip .icon-component svg) {
    fill: var(--black3);
}
</style>