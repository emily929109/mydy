<script setup>
defineProps({
  item: { type: Object, required: true },
  index: { type: Number, required: true },
  selected: { type: Boolean, default: false },
  effectiveEnabled: { type: Boolean, default: true },
  count: { type: Number, default: 0 },
})

const emit = defineEmits([
  'select',
  'toggle',
  'up',
  'down',
  'edit',
  'transfer',
])
</script>

<template>
  <div
    class="category-row"
    :class="{
      'category-row--selected': selected,
      'category-row--disabled': !effectiveEnabled,
    }"
    @click="emit('select', item.id)"
  >
    <span class="category-row__num">{{ index + 1 }}</span>
    <span class="category-row__name">{{ item.name }}</span>
    <span class="category-row__switch-wrap" @click.stop>
      <el-switch
        :model-value="item.enabled"
        @update:model-value="emit('toggle', $event)"
      />
    </span>
    <div class="category-row__action bg-white" @click.stop>
      <button class="action_up" @click="emit('up', item)">
        <i class="fa-solid fa-arrow-up"></i>
      </button>
      <button class="action_down" @click="emit('down', item)">
        <i class="fa-solid fa-arrow-down"></i>
      </button>
      <button class="action_edit" @click="emit('edit', item)">
        <i class="fa-solid fa-pen"></i>
      </button>
      <button class="action_transfer" @click="emit('transfer', item)">
        <i class="fa-solid fa-truck-moving"></i>
      </button>
    </div>
    <span class="category-row__badge">{{ count }}</span>
  </div>
</template>

<style scoped>
.category-row {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 6px;
  padding: 10px 12px;
  gap: 10px;
  cursor: pointer;
  transition:
    background 0.12s,
    box-shadow 0.12s;
  border: 1px solid transparent;
}
.category-row:hover {
  background: #fafbff;
}
.category-row--selected {
  background: #e7e9ff;
  border-color: #c5c9ff;
}
.category-row--selected .category-row__name {
  color: #4a3ed4;
  font-weight: 600;
}

.category-row__num {
  font-size: 13px;
  color: #8a8fa3;
  width: 18px;
  text-align: center;
}
.category-row__name {
  flex: 1;
  font-size: 14px;
  color: #2c2f48;
}
.category-row__switch-wrap {
  display: inline-flex;
  align-items: center;
}
.category-row__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 22px;
  padding: 0 8px;
  border-radius: 11px;
  background: #6e5cf7;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
}

/* Disabled row visual */
.category-row--disabled .category-row__name,
.category-row--disabled .category-row__num {
  text-decoration: line-through;
  color: #b0b3c6;
}
.category-row--disabled .category-row__badge {
  background: #c5c8d6;
}

/* 操作列 */
.category-row__action {
  padding: 4px;
  border-radius: 4px;
  opacity: 0;
  transition: all 0.3s ease;
}

.category-row__action.bg-white button {
  background: none;
  outline: none;
  border: none;
  font-size: 14px;
  color: rgb(156 163 175);
  cursor: pointer;
}

.category-row:hover .category-row__action {
  opacity: 1;
}

@media (hover: hover) and (pointer: fine) {
  .category-row__action .action_up:hover,
  .category-row__action .action_down:hover {
    color: #409eff;
  }
  .category-row__action .action_edit:hover {
    color: rgb(22 163 74);
  }
  .category-row__action .action_transfer:hover {
    color: rgb(245 158 11);
  }
}
</style>