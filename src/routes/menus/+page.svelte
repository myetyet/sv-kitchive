<script lang="ts">
    import { today } from '@internationalized/date';
    import type { DateValue } from '@internationalized/date';

    import Calendar from './Calendar.svelte';
    import DishList from './DishList.svelte';

    let date: DateValue = $state(today('Asia/Shanghai'));
    let isEditing: boolean = $state(false);
</script>


<svelte:head>
    <title>菜单</title>
</svelte:head>

<Calendar bind:date disabled={isEditing} />
<DishList {date} bind:isEditing />