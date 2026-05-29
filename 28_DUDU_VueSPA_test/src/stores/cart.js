import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

/**
 * 購物車狀態（header 下拉用）
 * 移植自原站 js/header.js 的 cartItems / cartCount / headerCartItems 與 cartUpdated 事件。
 *
 * 注意：本次重構未接後端購物車 API，資料來源沿用 localStorage.member.cart 或
 * 其他頁面 dispatch 的 'cartUpdated' 事件；結構保留以利後續接 API。
 */
export const useCartStore = defineStore('cart', () => {
  // 每個元素為一個 dealer 群組，內含 cars 陣列
  const cartItems = ref([])
  const showCartDropdown = ref(false)

  const cartCount = computed(() =>
    cartItems.value.reduce(
      (total, dealer) => total + (dealer.cars || []).reduce((sum, car) => sum + (car.buy_qty || 0), 0),
      0,
    ),
  )

  const headerCartItems = computed(() => cartItems.value.flatMap((dealer) => dealer.cars || []))

  function setCart(groups) {
    cartItems.value = groups || []
  }

  function toggleCartDropdown() {
    showCartDropdown.value = !showCartDropdown.value
  }

  function closeCartDropdown() {
    showCartDropdown.value = false
  }

  /** 監聽其他頁面（如 purchase.js）派發的 cartUpdated 事件，並讀取登入會員既有購物車 */
  function init() {
    window.addEventListener('cartUpdated', (event) => setCart(event.detail))
    const member = JSON.parse(localStorage.getItem('member'))
    if (member && member.role === 'member' && member.cart && member.cart.success) {
      setCart(member.cart.groups)
    }
  }

  return { cartItems, showCartDropdown, cartCount, headerCartItems, setCart, toggleCartDropdown, closeCartDropdown, init }
})
