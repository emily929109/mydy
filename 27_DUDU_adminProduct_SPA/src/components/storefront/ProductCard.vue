<script setup>
import { computed } from 'vue'

const props = defineProps({
  product: { type: Object, required: true },
  index: { type: Number, default: 0 },
})

// 沿用參考檔做法：用 picsum 種子圖呈現（product.imageUrl 為佔位圖）
const imgSrc = computed(() => `https://picsum.photos/seed/p${props.index + 1}/400/400`)
</script>

<template>
  <div class="prd-item">
    <div class="prd-item__inner">
      <div class="prd-item__img-wrap">
        <img class="prd-item__img" :src="imgSrc" :alt="product.name" />
      </div>
      <div class="prd-item__body">
        <span class="prd-item__name">{{ product.name }}</span>
        <p class="prd-item__price">${{ product.price }}</p>
      </div>
    </div>
    <div class="prd-item__store">
      {{ product.store || 'DUDU官方旗艦店' }}
    </div>
  </div>
</template>

<style scoped>
.prd-item {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  height: 100%;
}
.prd-item__inner {
  padding: 12px;
  flex: 1;
}
.prd-item__img-wrap {
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 12px;
}
.prd-item__img {
  aspect-ratio: 1 / 1;
  object-fit: cover;
  width: 100%;
  display: block;
  transition: transform 0.5s;
}
.prd-item:hover .prd-item__img {
  transform: scale(1.1);
}
.prd-item__name {
  color: #000;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 14px;
  line-height: 1.4;
}
.prd-item__price {
  color: #e8456b;
  font-weight: 600;
  margin: 6px 0 0;
}
.prd-item__store {
  background: #26b8a6;
  color: #fff;
  text-align: center;
  padding: 8px;
  font-size: 13px;
}
</style>
