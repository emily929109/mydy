<script setup>
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useMemberStore } from '@/stores/member'

const router = useRouter()
const memberStore = useMemberStore()
const { setMenu, authority } = storeToRefs(memberStore)

function logout() {
  memberStore.logout()
  router.push('/')
}
</script>

<template>
  <div id="menuLeftApp">
    <nav class="navbar navbar-light navbar-vertical navbar-expand-xl">
      <div class="d-flex align-items-center">
        <div class="toggle-icon-wrapper">
          <button
            class="btn navbar-toggler-humburger-icon navbar-vertical-toggle"
            data-bs-toggle="collapse"
            data-bs-target="#navbarVerticalCollapse"
            title="謹慎消費"
          >
            <span class="navbar-toggle-icon"><span class="toggle-line"></span></span>
          </button>
        </div>
        <div class="navbar-brand">
          <div class="d-flex align-items-center py-3">
            <img class="me-2" src="/img/logo-dudu.png" alt="" width="250" />
          </div>
        </div>
      </div>

      <div class="collapse navbar-collapse" id="navbarVerticalCollapse">
        <div class="navbar-vertical-content scrollbar">
          <ul class="navbar-nav flex-column mb-3">
            <!-- 申辦 登入（未登入） -->
            <li v-if="setMenu.loginHide" class="nav-item">
              <div class="row navbar-vertical-label-wrapper mt-3 mb-2">
                <div class="col-auto navbar-vertical-label">申辦 登入</div>
                <div class="col ps-0"><hr class="mb-0 navbar-vertical-divider" /></div>
              </div>
              <router-link class="ean-link" to="/Home/Register">
                <div class="d-flex align-items-center">
                  <span class="nav-link-icon fs-0"><span class="far fa-user"></span></span>
                  <span class="nav-link-text ps-1">立即申辦</span>
                </div>
              </router-link>
              <a class="ean-link" href="#authentication-modal" data-bs-toggle="modal" role="button">
                <div class="d-flex align-items-center">
                  <span class="nav-link-icon"><span class="fas fa-user-alt"></span></span>
                  <span class="nav-link-text ps-1">會員登入</span>
                </div>
              </a>
            </li>

            <!-- 會員專屬 -->
            <li class="nav-item" v-if="setMenu.member_1">
              <div class="row navbar-vertical-label-wrapper mt-3 mb-2">
                <div class="col-auto navbar-vertical-label">會員專屬</div>
                <div class="col ps-0"><hr class="mb-0 navbar-vertical-divider" /></div>
              </div>
              <router-link class="ean-link" to="/Home/MemberCenter">
                <div class="d-flex align-items-center">
                  <span class="nav-link-icon"><span class="fas fa-layer-group"></span></span>
                  <span class="nav-link-text ps-1">會員中心</span>
                </div>
              </router-link>
            </li>

            <!-- 特約商專屬 -->
            <li class="nav-item" v-if="setMenu.dealer_1">
              <div class="row navbar-vertical-label-wrapper mt-3 mb-2">
                <div class="col-auto navbar-vertical-label">特約商專屬</div>
                <div class="col ps-0"><hr class="mb-0 navbar-vertical-divider" /></div>
              </div>
              <a class="ean-link dropdown-indicator" href="#e-commerce" role="button" data-bs-toggle="collapse" aria-expanded="false">
                <div class="d-flex align-items-center">
                  <span class="nav-link-icon"><span class="fas fa-shopping-cart"></span></span>
                  <span class="nav-link-text ps-1">我是特約商</span>
                </div>
              </a>
              <ul class="nav collapse ms-2" id="e-commerce">
                <li class="nav-item">
                  <router-link class="ean-link" to="/Home/DealerQRCode_2"><div class="d-flex align-items-center"><span class="nav-link-text ps-4">自訂專區</span></div></router-link>
                </li>
                <li class="nav-item">
                  <router-link class="ean-link" to="/Home/DealerQRCode_3"><div class="d-flex align-items-center"><span class="nav-link-text ps-4">店家 QR</span></div></router-link>
                </li>
                <li class="nav-item">
                  <router-link :class="[authority.query ? '' : 'ean_disabled', 'ean-link']" to="/Home/QueryOrder"><div class="d-flex align-items-center"><span class="nav-link-text ps-4">訂單查詢</span></div></router-link>
                </li>
                <li class="nav-item">
                  <router-link :class="[authority.cashApply ? '' : 'ean_disabled', 'ean-link']" to="/Home/QueryPayApply"><div class="d-flex align-items-center"><span class="nav-link-text ps-4">申請撥款</span></div></router-link>
                </li>
                <li class="nav-item">
                  <router-link :class="[authority.mall ? '' : 'ean_disabled', 'ean-link']" to="/Home/DealerProduct"><div class="d-flex align-items-center"><span class="nav-link-text ps-4">商品管理</span></div></router-link>
                </li>
                <li class="nav-item">
                  <router-link :class="[authority.admin ? '' : 'ean_disabled', 'ean-link']" to="/Home/DealerRole"><div class="d-flex align-items-center"><span class="nav-link-text ps-4">角色權限管理</span></div></router-link>
                </li>
                <li class="nav-item">
                  <router-link class="ean-link" to="/Home/DealerSetPassword"><div class="d-flex align-items-center"><span class="nav-link-text ps-4">更改密碼</span></div></router-link>
                </li>
                <li>
                  <span class="ean-link" role="button" @click="logout"><div class="d-flex align-items-center"><span class="nav-link-text ps-4">登出</span></div></span>
                </li>
              </ul>
            </li>

            <!-- DUDUPAY 介紹（公開） -->
            <li class="nav-item">
              <div class="row navbar-vertical-label-wrapper mt-3 mb-2">
                <div class="col-auto navbar-vertical-label">DUDUPAY 介紹</div>
                <div class="col ps-0"><hr class="mb-0 navbar-vertical-divider" /></div>
              </div>
              <router-link class="ean-link" to="/Home/About"><div class="d-flex align-items-center"><span class="nav-link-icon"><span class="fas fa-info-circle"></span></span><span class="nav-link-text ps-1">DUDUPAY介紹</span></div></router-link>
              <router-link class="ean-link" to="/Home/News"><div class="d-flex align-items-center"><span class="nav-link-icon"><span class="fas fa-bullhorn"></span></span><span class="nav-link-text ps-1">最新消息</span></div></router-link>
              <router-link class="ean-link" to="/Home/Travel"><div class="d-flex align-items-center"><span class="nav-link-icon"><span class="fas fa-plane"></span></span><span class="nav-link-text ps-1">旅遊好康</span></div></router-link>
              <router-link class="ean-link" to="/Home/StoreList"><div class="d-flex align-items-center"><span class="nav-link-icon"><span class="fas fa-shopping-bag"></span></span><span class="nav-link-text ps-1">購物專區</span></div></router-link>
              <a class="ean-link dropdown-indicator" href="#dealer" role="button" data-bs-toggle="collapse" aria-expanded="false">
                <div class="d-flex align-items-center"><span class="nav-link-icon"><span class="fas fa-handshake"></span></span><span class="nav-link-text ps-1">特約商專區</span></div>
              </a>
              <ul class="nav collapse" id="dealer">
                <li class="nav-item">
                  <a class="ean-link" href="#authentication-modal-2" data-bs-toggle="modal" role="button"><div class="d-flex align-items-center"><span class="nav-link-text ps-4">登入</span></div></a>
                </li>
                <li class="nav-item">
                  <router-link class="ean-link" to="/Home/DealerApply"><div class="d-flex align-items-center"><span class="nav-link-text ps-4">合作申請</span></div></router-link>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </div>
</template>
