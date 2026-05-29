import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'

/**
 * 會員 / 特約商登入狀態
 * 移植自原站 js/header.js（setMenuForRole / setAuthorityShowItem / Logout）
 * 與 js/menuRole.js（setMenuRole / clearMenuRole）、js/index.js（checkRole）。
 *
 * 注意：本次重構不接後端登入驗證 API，只還原「依 localStorage.member 切換版面顯示」的行為。
 */
export const useMemberStore = defineStore('member', () => {
  const member = ref(null)

  // 導覽列顯示控制（對應原站 setMenu）
  const setMenu = reactive({
    member_1: false, // 顯示「會員中心」
    dealer_1: false, // 顯示「特約商帳務」
    showProfile: false, // 顯示會員頭像下拉
    loginHide: true, // 未登入時顯示「登入 / 特約商專區」
  })

  // 特約商功能權限（對應原站 authority）
  const authority = reactive({ query: false, cashApply: false, admin: false, mall: false })

  const user = reactive({ member_no: '' })

  // 浮動按鈕：登入後顯示 LINE icon，否則顯示「立即申辦」（對應 index.js memberIsShow）
  const memberIsShow = ref(false)

  function setMenuRole(role) {
    if (role === 'member') {
      setMenu.showProfile = true
      setMenu.member_1 = true
      setMenu.dealer_1 = false
    } else {
      setMenu.dealer_1 = true
      setMenu.member_1 = false
    }
    setMenu.loginHide = false // 會員或特約商登入後隱藏 menu
  }

  function clearMenuRole() {
    setMenu.member_1 = false
    setMenu.dealer_1 = false
    setMenu.showProfile = false
    setMenu.loginHide = true
  }

  function setAuthorityShowItem(authoritysArray) {
    const list = authoritysArray || []
    authority.query = list.find((a) => a.authority === '訂單查詢')?.isCheck || false
    authority.cashApply = list.find((a) => a.authority === '申請撥款')?.isCheck || false
    authority.admin = list.find((a) => a.authority === '角色權限')?.isCheck || false
    authority.mall = list.find((a) => a.authority === '商品管理')?.isCheck || false
  }

  /** 由 localStorage 初始化登入狀態 */
  function init() {
    member.value = JSON.parse(localStorage.getItem('member'))
    const m = member.value
    if (m != null && m.login_ok_msg === '*') {
      setMenuRole(m.role)
      memberIsShow.value = true
      if (m.role === 'dealer') setAuthorityShowItem(m.authoritys)
      else user.member_no = m.kc_member_no || ''
    }
  }

  /** 登出（對應 header.js Logout，本次不導向後端頁面，改回首頁） */
  function logout() {
    localStorage.clear()
    sessionStorage.clear()
    member.value = null
    clearMenuRole()
    memberIsShow.value = false
    user.member_no = ''
    alert('您已經登出')
  }

  return { member, setMenu, authority, user, memberIsShow, init, logout, setMenuRole, clearMenuRole }
})
