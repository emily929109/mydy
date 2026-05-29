<script setup>
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useMemberStore } from '@/stores/member'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const memberStore = useMemberStore()
const cartStore = useCartStore()
const { setMenu, authority, user } = storeToRefs(memberStore)
const { showCartDropdown, cartCount, headerCartItems } = storeToRefs(cartStore)

function logout() {
  memberStore.logout()
  router.push('/')
}

function headerCartClick() {
  cartStore.closeCartDropdown()
  router.push('/Home/Purchase?view=cart')
}
</script>

<template>
  <nav
    id="headerapp"
    class="navbar navbar-light navbar-glass navbar-top navbar-expand-lg flex-column py-3"
  >
    <button
      class="btn navbar-toggler-humburger-icon navbar-toggler me-3 flex-column"
      type="button"
      data-bs-toggle="collapse"
      data-bs-target="#navbarVerticalCollapse"
      aria-controls="navbarVerticalCollapse"
      aria-expanded="false"
      aria-label="Toggle Navigation"
    >
      <span class="navbar-toggle-icon"><span class="toggle-line"></span></span>
    </button>

    <router-link class="navbar-brand me-1 me-sm-3" to="/">
      <div class="d-flex align-items-center">
        <img class="me-2" src="/img/logo-dudu.png" alt="DUDUPAY" width="250" />
      </div>
    </router-link>

    <div class="collapse navbar-collapse scrollbar" id="navbarStandard">
      <ul class="align-items-center navbar-nav" data-top-nav-dropdowns="data-top-nav-dropdowns">
        <!-- 特約商帳務 -->
        <li v-if="setMenu.dealer_1" class="nav-item dropdown">
          <a
            class="nav-link dropdown-toggle"
            href="#"
            role="button"
            data-bs-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
            >特約商帳務</a
          >
          <div class="dropdown-menu dropdown-menu-card border-0 mt-0">
            <div class="card shadow-none dark__bg-1000">
              <div class="max-h-dropdown">
                <div class="row">
                  <div>
                    <div class="nav flex-column">
                      <router-link class="dropdown-item link-600 fw-medium" style="font-size: 18px" to="/Home/DealerQRCode_2">
                        <span class="fas fa-th-list fs-0 me-1"></span>自訂專區
                      </router-link>
                      <router-link class="dropdown-item link-600 fw-medium" style="font-size: 18px; border-bottom: 1px dashed #d7d7d7" to="/Home/DealerQRCode_3">
                        <span class="fas fa-qrcode fs-0 me-1"></span>店家 QR
                      </router-link>
                    </div>
                    <div class="nav flex-column">
                      <router-link :class="[authority.admin ? '' : 'ean_disabled', 'dropdown-item link-600 fw-medium']" style="font-size: 18px" to="/Home/DealerRole">
                        <span class="fas fa-cogs fs-0 me-1"></span>角色權限管理
                      </router-link>
                      <router-link class="dropdown-item link-600 fw-medium" style="font-size: 18px; border-bottom: 1px dashed #d7d7d7" to="/Home/DealerSetPassword">
                        <span class="fas fa-user-cog fs-0 me-1"></span>更改密碼
                      </router-link>
                    </div>
                  </div>
                  <div>
                    <div class="nav flex-column">
                      <router-link :class="[authority.query ? '' : 'ean_disabled', 'dropdown-item link-600 fw-medium']" style="font-size: 18px" to="/Home/QueryOrder">
                        <span class="fab fa-sistrix fs-0 me-1"></span>訂單查詢
                      </router-link>
                      <router-link :class="[authority.cashApply ? '' : 'ean_disabled', 'dropdown-item link-600 fw-medium']" style="font-size: 18px; border-bottom: 1px dashed #d7d7d7" to="/Home/QueryPayApply">
                        <span class="fas fa-search-dollar fs-0 me-1"></span>申請撥款
                      </router-link>
                    </div>
                    <div class="nav flex-column">
                      <router-link :class="[authority.mall ? '' : 'ean_disabled', 'dropdown-item link-600 fw-medium']" style="font-size: 18px; border-bottom: 1px dashed #d7d7d7" to="/Home/DealerProduct">
                        <span class="fab fa-product-hunt fs-0 me-1"></span>商品管理
                      </router-link>
                    </div>
                    <div class="nav flex-column">
                      <a class="dropdown-item link-600 fw-medium" style="font-size: 18px" href="#" @click.prevent="logout">
                        <span class="fas fa-sign-out-alt fs-0 me-1"></span>登出
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </li>
        <li v-if="setMenu.dealer_1" class="nav-item seperate"></li>

        <!-- 會員中心 -->
        <li v-if="setMenu.member_1" class="nav-item dropdown">
          <router-link class="nav-link" to="/Home/MemberCenter">會員中心</router-link>
        </li>
        <li v-if="setMenu.member_1" class="nav-item seperate"></li>

        <!-- 公開導覽 -->
        <li class="nav-item dropdown">
          <router-link class="nav-link" to="/Home/About">DUDUPAY介紹</router-link>
        </li>
        <li class="nav-item seperate"></li>
        <li class="nav-item dropdown">
          <router-link class="nav-link" to="/Home/News">最新消息</router-link>
        </li>
        <li class="nav-item seperate"></li>
        <li class="nav-item dropdown">
          <router-link class="nav-link" to="/Home/Travel">旅遊好康</router-link>
        </li>
        <li class="nav-item seperate"></li>
        <li class="nav-item dropdown">
          <router-link class="nav-link" to="/Home/StoreList">購物專區</router-link>
        </li>
        <li class="nav-item seperate"></li>

        <!-- 特約商專區（未登入時） -->
        <li v-if="setMenu.loginHide" class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" id="navbarDropdownDealer" href="#" role="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">特約商專區</a>
          <div class="dropdown-menu" aria-labelledby="navbarDropdownDealer">
            <a class="dropdown-item" href="#authentication-modal-2" data-bs-toggle="modal">登入</a>
            <router-link class="dropdown-item" to="/Home/DealerApply">合作申請</router-link>
          </div>
        </li>
      </ul>
    </div>

    <ul class="login-icon navbar-nav navbar-nav-icons ms-auto flex-row align-items-center" id="cart-header">
      <li class="nav-item" v-if="!setMenu.loginHide && !setMenu.dealer_1">
        <div class="theme-control-toggle fa-icon-wait px-2" style="white-space: nowrap">
          會員編號:<span style="display: inline">{{ user.member_no }}</span>
        </div>
      </li>

      <!-- 會員頭像 -->
      <li class="nav-item dropdown" v-if="setMenu.showProfile">
        <a class="nav-link pe-0" id="navbarDropdownUser" href="#" role="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
          <div class="member-icon">
            <img class="rounded-circle" src="/img/memberIcon.jpg" alt="member" style="width: 35px" />
          </div>
        </a>
        <div class="dropdown-menu dropdown-menu-end py-0" aria-labelledby="navbarDropdownUser">
          <div class="bg-white dark__bg-1000 rounded-2">
            <div>
              <router-link class="dropdown-item item-link link-600 fw-medium" to="/Home/Profile">基本資料 &amp; 會員資訊</router-link>
              <router-link class="dropdown-item item-link link-600 fw-medium" to="/Home/ReSetPassword" style="border-bottom: 1px dashed #d7d7d7">更改登入密碼</router-link>
            </div>
            <a class="dropdown-item item-link link-600 fw-medium" href="#" @click.prevent="logout">登 出</a>
          </div>
        </div>
      </li>

      <!-- 登入按鈕（未登入時） -->
      <li v-if="setMenu.loginHide" class="nav-item dropdown">
        <a class="nav-link pe-0" href="#authentication-modal" role="button" data-bs-toggle="modal" aria-haspopup="false">
          <div class="login text-center">登入</div>
        </a>
      </li>

      <!-- 購物車 -->
      <li class="me-1">
        <div class="header-cart-wrap">
          <button class="cart-trigger" @click="cartStore.toggleCartDropdown()">
            <i class="fa-solid fa-cart-shopping"></i>
            <span class="cart-badge" v-show="cartCount > 0">{{ cartCount }}</span>
          </button>
          <div class="cart-dropdown" v-show="showCartDropdown">
            <div class="cart-drop-empty" v-if="cartCount === 0">
              <i class="fa-solid fa-cart-shopping d-block mb-2" style="font-size: 1.5rem"></i>
              購物車是空的
            </div>
            <div class="cart-drop-item" v-for="prd in headerCartItems" :key="prd.product_id">
              <img :src="prd.ProducBase64" :alt="prd.product_id" />
              <div class="cart-drop-info">
                <div class="cart-drop-name">{{ prd.item }}</div>
                <div class="cart-drop-spec">{{ prd.item_spec.name }} × {{ prd.buy_qty }}</div>
              </div>
              <div class="cart-drop-price">NT$ {{ prd.item_spec.cash * prd.buy_qty }}</div>
            </div>
            <div class="cart-drop-footer">
              <a href="#" class="btn-view-cart" @click.prevent="headerCartClick()">查看全部購物車</a>
            </div>
          </div>
        </div>
      </li>
    </ul>
  </nav>
</template>
