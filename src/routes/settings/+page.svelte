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
            onclick={() => isDarkMode = !isDarkMode}
            class="btn gap-8 flex flex-col items-center justify-center p-8 preset-outlined-surface-500 shadow-xl border-2! rounded-2xl transition-transform active:scale-97" title="切换显示模式">
            {#if isDarkMode}
                <MoonIcon class="size-12" color="oklch(86.9% 0.022 252.894)" /><!-- slate-300 -->
            {:else}
                <SunIcon class="size-12" color="oklch(75% 0.183 55.934)" /><!-- orange-400 -->
            {/if}
            <span class="text-xl font-semibold text-center">{isDarkMode ? '暗' : '亮'}色模式</span>
        </button>
        <button
            onclick={() => { supabase.forceLogout(true); }}
            class="btn gap-8 flex flex-col items-center justify-center p-8 preset-outlined-surface-500 shadow-xl border-2! rounded-2xl transition-transform active:scale-97" title="退出登录">
            <LogOutIcon class="size-12" color={isDarkMode ? 'oklch(80.9% 0.105 251.813)' : 'oklch(62.3% 0.214 259.815)'} /><!-- blue-300 & blue-500 -->
            <span class="text-xl font-semibold text-center">退出登录</span>
        </button>
    </div>
</div>