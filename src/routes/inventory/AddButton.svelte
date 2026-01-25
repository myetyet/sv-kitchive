<script lang="ts">
    import { PlusIcon } from '@lucide/svelte';

    import type { StoragePlace } from '$lib/schema';
    import EditDialog from './EditDialog.svelte';

    let { scrollY, place }: { scrollY: number; place: StoragePlace; } = $props();
    let lastY: number = 0;
    let visible: boolean = $state(true);
    let ticking: boolean = false;
    let showEditDialog: boolean = $state(false);

    $effect(() => {
        function update() {
            if (scrollY > lastY && scrollY > 30) {
                visible = false;
            } else if (scrollY < lastY) {
                visible = true;
            }
            lastY = scrollY;
            ticking = false;
        }

        scrollY; // inform $effect to re-run when scrollY changes
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(update);
        }
    });
</script>


<button class="fixed bottom-18 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full shadow-lg bg-gray-900 text-white flex items-center justify-center transition-transform duration-300 ease-out {visible ? 'translate-y-0' : 'translate-y-24'}"
    onclick={() => showEditDialog = true}>
    <PlusIcon class="size-8" />
</button>
<EditDialog bind:open={showEditDialog} {place} />