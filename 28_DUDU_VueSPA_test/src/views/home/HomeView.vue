<script setup>
import { onMounted, ref } from 'vue'
import BannerSwiper from './components/BannerSwiper.vue'
import LatestNews from './components/LatestNews.vue'
import FeatureCards from './components/FeatureCards.vue'
import RegisterCta from './components/RegisterCta.vue'
import BrandStory from './components/BrandStory.vue'
import FeaturedBrands from './components/FeaturedBrands.vue'
import ShoppingMall from './components/ShoppingMall.vue'
import AnnouncementTabs from './components/AnnouncementTabs.vue'
import CustomerFeedback from './components/CustomerFeedback.vue'
import FloatingButtons from './components/FloatingButtons.vue'
import PromotionModal from './components/PromotionModal.vue'
import DealerModal from './components/DealerModal.vue'
import { useScrollAnimation } from '@/composables/useScrollAnimation'
import { getUrlParameter } from '@/utils'

const promotionModalVisible = ref(false)
const dealerModalVisible = ref(false)

// 進場淡入 / 縮放動畫（.fadeUp / .zoomIn）
useScrollAnimation()

// 對應原站 index.js onMounted：依 URL 參數 dealerAgree 決定顯示哪個 modal
onMounted(() => {
  const dealerAgree = getUrlParameter('dealerAgree')
  if (dealerAgree !== 'null') {
    if (dealerAgree === '1') dealerModalVisible.value = true
    else alert('url error')
  } else {
    promotionModalVisible.value = true
  }
})
</script>

<template>
  <div id="app-home" class="mt-0 mt-lg-3" style="min-height: 600px">
    <BannerSwiper />
    <LatestNews />
    <FeatureCards />
    <RegisterCta />
    <BrandStory />
    <FeaturedBrands />
    <ShoppingMall />
    <AnnouncementTabs />
    <CustomerFeedback />
    <FloatingButtons />

    <DealerModal v-model="dealerModalVisible" />
    <PromotionModal v-model="promotionModalVisible" />
  </div>
</template>
