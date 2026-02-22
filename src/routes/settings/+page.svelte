<script lang="ts">
    import { LogOutIcon, MoonIcon, SunIcon } from '@lucide/svelte';

    import { supabase } from '$lib/supabase.svelte'

    let isDarkMode: boolean = $state(matchMedia('(prefers-color-scheme: dark)').matches || document.documentElement.classList.contains('dark'));

    $effect(() => {
        document.documentElement.classList.toggle('dark', isDarkMode);
    });
</script>


<svelte:head>
    <title>设置</title>
</svelte:head>

<div class="min-h-full flex items-center justify-center p-6">
    <div class="grid grid-cols-2 gap-8">
        <button
            onclick={() => (isDarkMode = !isDarkMode)}
            class="btn gap-8 flex flex-col items-center justify-center p-8 preset-outlined-surface-500 shadow-xl border-2! rounded-2xl transition-transform active:scale-97" title="切换显示模式">
            {#if isDarkMode}
                <MoonIcon class="size-12 stroke-slate-300" />
            {:else}
                <SunIcon class="size-12 stroke-orange-400" />
            {/if}
            <span class="text-xl font-semibold text-center">{isDarkMode ? '暗' : '亮'}色模式</span>
        </button>
        <button
            onclick={() => { supabase.forceLogout(true); }}
            class="btn gap-8 flex flex-col items-center justify-center p-8 preset-outlined-surface-500 shadow-xl border-2! rounded-2xl transition-transform active:scale-97" title="退出登录">
            <LogOutIcon class="size-12 stroke-blue-500 dark:stroke-blue-300" />
            <span class="text-xl font-semibold text-center">退出登录</span>
        </button>
    </div>
</div>