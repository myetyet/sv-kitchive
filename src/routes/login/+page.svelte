<script lang="ts">
    import { goto } from '$app/navigation';
    import { resolve } from '$app/paths';
    import { onMount, untrack } from 'svelte';
    import { on as addEventListenerTo } from 'svelte/events';

    import { Dialog, Portal } from '@skeletonlabs/skeleton-svelte';
    import { DeleteIcon, SettingsIcon } from '@lucide/svelte';

    import { LSK_SB_ANON_KEY, LSK_SB_URL, LSK_SB_USER_EMAIL, supabase } from '$lib/supabase.svelte';

    let pin: number[] = $state([]);
    let isLoading: boolean = $state(false);
    let isSavingConfig: boolean = $state(false);
    let showSaveErrorHint: boolean = $state(false);
    let showLoginErrorDialog: boolean = $state(false);
    let showSettingsDialog: boolean = $state(!supabase.isClientReady);
    let inputSupabaseUrl: string = $state(localStorage.getItem(LSK_SB_URL) ?? '');
    let inputSupabaseAnonKey: string = $state(localStorage.getItem(LSK_SB_ANON_KEY) ?? '');
    let inputSupabaseUserEmail: string = $state(localStorage.getItem(LSK_SB_USER_EMAIL) ?? '');

    let canSaveConfig: boolean = $derived(inputSupabaseUrl.length > 0 && inputSupabaseAnonKey.length > 0 && inputSupabaseUserEmail.length > 0);
    let canCleanInput: boolean = $derived(inputSupabaseUrl.length > 0 || inputSupabaseAnonKey.length > 0 || inputSupabaseUserEmail.length > 0);

    function _inputDigit(digit: number) {
        if (!isLoading && pin.length < 6) {
            pin.push(digit);
        }
    }

    function inputDigit(digit: number) {
        return function() {
            _inputDigit(digit);
        }
    }

    function deleteDigit() {
        if (!isLoading && pin.length > 0) {
            pin.pop();
        }
    }

    function cleanInput() {
        inputSupabaseUrl = '';
        inputSupabaseAnonKey = '';
        inputSupabaseUserEmail = '';
        showSaveErrorHint = false;
    }

    async function saveSettings() {
        if (inputSupabaseUrl !== localStorage.getItem(LSK_SB_URL) || inputSupabaseAnonKey !== localStorage.getItem(LSK_SB_ANON_KEY) || inputSupabaseUserEmail !== localStorage.getItem(LSK_SB_USER_EMAIL)) {
            isSavingConfig = true;
            const status = await supabase.resetClient(inputSupabaseUrl, inputSupabaseAnonKey, inputSupabaseUserEmail)
            isSavingConfig = false;
            if (status) {
                showSaveErrorHint = false;
                localStorage.setItem(LSK_SB_URL, inputSupabaseUrl);
                localStorage.setItem(LSK_SB_ANON_KEY, inputSupabaseAnonKey);
                localStorage.setItem(LSK_SB_USER_EMAIL, inputSupabaseUserEmail);
                showSettingsDialog = false;
            } else {
                showSaveErrorHint = true;
            }
        } else {
            showSettingsDialog = false;
        }
    }

    $effect(() => {
        if (showSettingsDialog) {
            inputSupabaseUrl = localStorage.getItem(LSK_SB_URL) ?? '';
            inputSupabaseAnonKey = localStorage.getItem(LSK_SB_ANON_KEY) ?? '';
            inputSupabaseUserEmail = localStorage.getItem(LSK_SB_USER_EMAIL) ?? '';
            showSaveErrorHint = false;
        }
    });

    $effect(() => {
        if (pin.length === 6) {
            isLoading = true;
            supabase.login(untrack(() => pin.join('')))
                .then((status) => {
                    if (status === true) {
                        goto(resolve('/menus'));
                    } else {
                        isLoading = false;
                        pin.length = 0;
                        showLoginErrorDialog = true;
                    }
                });
        }
    });

    onMount(() => addEventListenerTo(document, 'keydown', (event) => {
        if (!showLoginErrorDialog && !showSettingsDialog) {
            if (event.key === 'Backspace') {
                deleteDigit();
            } else {
                const charCode = event.key.charCodeAt(0);
                if (charCode >= 48 && charCode <= 57) {
                    _inputDigit(charCode - 48);
                }
            }
        }
    }));
</script>


<svelte:head>
    <title>登录</title>
</svelte:head>

<div class="h-screen w-full flex flex-col items-center justify-center gap-10">
    <div class="text-center text-xl">输入密码</div>
    <div class="flex gap-4 mb-4">
        {#each Array(6) as _, i (i)}
            {@const dotClass = i < pin.length ? 'preset-filled' : 'preset-outlined !border-2'}
            <div class="w-4 h-4 rounded-full transition-all duration-100 {dotClass}"></div>
        {/each}
    </div>
    <div class="grid grid-cols-3 gap-4">
        {#each Array(9) as _, i (i)}
            <button
                onclick={inputDigit(i + 1)}
                class="btn px-8 py-4 text-xl shadow-md transition-transform active:scale-95" disabled={isLoading} title={`${i + 1}`}>
                {i + 1}
            </button>
        {/each}
        <button
            onclick={() => showSettingsDialog = true}
            class="btn px-8 py-4 shadow-md transition-transform active:scale-95 flex items-center justify-center" disabled={isLoading} title="更换布局">
            <SettingsIcon class="size-5" />
        </button>
        <button
            onclick={inputDigit(0)}
            class="btn px-8 py-4 text-xl shadow-md transition-transform active:scale-95" disabled={isLoading} title="0">
            0
        </button>
        <button
            onclick={deleteDigit}
            class="btn px-8 py-4 shadow-md transition-transform active:scale-95 flex items-center justify-center" disabled={isLoading} title="删除">
            <DeleteIcon class="size-5" />
        </button>
    </div>
    {#if isLoading}
        <div class="absolute bottom-10 flex items-center gap-2 text-primary-500 animate-pulse">
            <span>正在登录……</span>
        </div>
    {/if}
    <Dialog open={showLoginErrorDialog} closeOnInteractOutside={false}>
        <Portal>
            <Dialog.Backdrop class="fixed inset-0 z-50 bg-surface-50-950/50" />
            <Dialog.Positioner class="fixed inset-0 z-50 flex justify-center items-center p-4">
                <Dialog.Content class="card bg-surface-100-900 w-full max-w-xl p-4 space-y-4 shadow-xl transition transition-discrete opacity-0 translate-y-[100px] starting:data-[state=open]:opacity-0 starting:data-[state=open]:translate-y-[100px] data-[state=open]:opacity-100 data-[state=open]:translate-y-0">
                    <div class="flex justify-center items-center">
                        <Dialog.Title class="text-xl">登录失败，请重试</Dialog.Title>
                    </div>
                    <div class="flex justify-end gap-2">
                        <button class="btn preset-tonal text-sm" onclick={() => showLoginErrorDialog = false}>关闭</button>
                    </div>
                </Dialog.Content>
            </Dialog.Positioner>
        </Portal>
    </Dialog>
    <Dialog open={showSettingsDialog} closeOnInteractOutside={false}>
        <Portal>
            <Dialog.Backdrop class="fixed inset-0 z-50 bg-surface-50-950/50" />
            <Dialog.Positioner class="fixed inset-0 z-50 flex justify-center items-center p-4">
                <Dialog.Content class="card bg-surface-100-900 w-full max-w-xl p-4 space-y-4 shadow-xl transition transition-discrete opacity-0 translate-y-[100px] starting:data-[state=open]:opacity-0 starting:data-[state=open]:translate-y-[100px] data-[state=open]:opacity-100 data-[state=open]:translate-y-0">
                    <div class="flex justify-between items-center">
                        <Dialog.Title class="text-lg font-bold">Supabase 连接选项</Dialog.Title>
                        {#if isSavingConfig}
                            <span class="text-primary-500 animate-pulse">保存中……</span>
                        {:else if showSaveErrorHint}
                            <span class="text-red-500">保存失败，请检查配置</span>
                        {/if}
                    </div>
                    <Dialog.Description>
                        <fieldset class="space-y-4">
                            <label class="label">
                                <span class="label-text">URL<span class="text-red-500">&nbsp;&nbsp;*</span></span>
                                <input class="input" type="text" bind:value={inputSupabaseUrl} disabled={isSavingConfig} placeholder="连接地址" />
                            </label>
                            <label class="label">
                                <span class="label-text">Anon Key<span class="text-red-500">&nbsp;&nbsp;*</span></span>
                                <input class="input" type="text" bind:value={inputSupabaseAnonKey} disabled={isSavingConfig} placeholder="匿名访问密钥" />
                            </label>
                            <label class="label">
                                <span class="label-text">E-mail<span class="text-red-500">&nbsp;&nbsp;*</span></span>
                                <input class="input" type="text" bind:value={inputSupabaseUserEmail} disabled={isSavingConfig} placeholder="用户登录邮箱" />
                            </label>
                        </fieldset>
                    </Dialog.Description>
                    <div class="flex flex-nowrap justify-between">
                        <button class="btn preset-tonal text-lg" disabled={!canCleanInput || isSavingConfig} onclick={cleanInput}>清空</button>
                        <div class="flex gap-3">
                            {#if supabase.isClientReady}
                                <button class="btn preset-tonal text-lg" disabled={isSavingConfig} onclick={() => showSettingsDialog = false}>取消</button>
                            {/if}
                            <button class="btn preset-filled text-lg" disabled={!canSaveConfig || isSavingConfig} onclick={saveSettings}>保存</button>
                        </div>
                    </div>
                </Dialog.Content>
            </Dialog.Positioner>
        </Portal>
    </Dialog>
</div>
