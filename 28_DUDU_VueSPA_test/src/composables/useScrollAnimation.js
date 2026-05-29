import { onMounted, onBeforeUnmount } from 'vue'

/**
 * 進場動畫（移植自原站 index.js）：
 *  - .fadeUp  → 進入視窗時加上 .show 觸發淡入上移
 *  - .zoomIn  → 指定選擇器的元素進入視窗時加上 .zoomIn class
 *
 * 在元件 onMounted 後掃描整個文件中的目標元素並 observe。
 */
export function useScrollAnimation(zoomInSelector = '.news-card-wrapper .news-item-img') {
  let fadeObserver = null
  let zoomObserver = null

  onMounted(() => {
    const isMobile = window.innerWidth < 768
    const options = { root: null, threshold: isMobile ? 0.1 : 0.3 }

    fadeObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show')
          fadeObserver.unobserve(entry.target)
        }
      })
    }, options)
    document.querySelectorAll('.fadeUp').forEach((el) => fadeObserver.observe(el))

    zoomObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('zoomIn')
          zoomObserver.unobserve(entry.target)
        }
      })
    }, options)
    document.querySelectorAll(zoomInSelector).forEach((el) => zoomObserver.observe(el))
  })

  onBeforeUnmount(() => {
    fadeObserver?.disconnect()
    zoomObserver?.disconnect()
  })
}
