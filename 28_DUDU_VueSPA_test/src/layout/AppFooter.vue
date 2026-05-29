<script setup></script>

<template>
  <footer
    class="footer"
    style="position: relative; background-color: #00ab98; margin-right: -1rem !important; margin-left: -1rem; width: unset"
  >
    <div class="row g-0">
      <div class="container-fluid container_ean p-4 py-md-6 text-white" style="max-width: 1400px">
        <!-- 網頁版 -->
        <div class="d-md-flex d-none row fs-2">
          <div class="col-12 col-md-3 text-center mb-3">
            <router-link to="/"><img class="w-100" src="/img/footerlogo.png" /></router-link>
          </div>
          <div class="col-12 col-md-3 mb-3">
            <div class="fw-bold text-sm-left mb-2">關於我們</div>
            <ul class="text-start">
              <li><router-link to="/Home/StoreList">近期優惠</router-link></li>
              <li><router-link to="/Home/News">最新公告</router-link></li>
              <li><router-link to="/Home/About">關於DUDUPAY</router-link></li>
              <li><a href="https://www.mydy.com.tw/" target="_blank">關於東元</a></li>
            </ul>
          </div>
          <div class="col-12 col-md-3 mb-3">
            <div class="fw-bold text-sm-left mb-2">商家專區</div>
            <ul class="text-start">
              <li><router-link to="/Home/Dealer">已合作商家</router-link></li>
              <li><a href="https://www.mydy.com.tw/Home/Contact_us" target="_blank">成為合作商家</a></li>
              <li><router-link to="/Home/Faq">常見問與答</router-link></li>
            </ul>
          </div>
          <div class="col-12 col-md-3 mb-3">
            <div class="fw-bold text-sm-left mb-2">聯絡我們</div>
            <ul class="mb-4 text-start">
              <li><a href="mailto:pschang@mydy.com.tw">業務合作洽談</a></li>
              <li><a href="https://maps.app.goo.gl/ongLuAEDVbN7xZNA8" target="_blank">新北市中和區建八路202號2樓</a></li>
            </ul>
            <div class="social-icon-wrapper d-flex gap-3">
              <div class="social-icon-container fb">
                <a href="https://www.facebook.com/profile.php?id=61575723575479" target="_blank"><img class="default" src="/img/footer/fb1.png" alt="fb-icon" /></a>
                <a href="https://www.facebook.com/profile.php?id=61575723575479" target="_blank"><img class="hover" src="/img/footer/fb2.png" alt="fb-icon-hover" /></a>
              </div>
              <div class="social-icon-container ig">
                <a href="https://www.instagram.com/dudupay520/" target="_blank"><img class="default" src="/img/footer/ig1.png" alt="ig-icon" /></a>
                <a href="https://www.instagram.com/dudupay520/" target="_blank"><img class="hover" src="/img/footer/ig2.png" alt="ig-icon-hover" /></a>
              </div>
              <div class="social-icon-container line">
                <a href="https://lin.ee/74qJkfR" target="_blank"><img class="default" src="/img/footer/line1.png" alt="line-icon" /></a>
                <a href="https://lin.ee/74qJkfR" target="_blank"><img class="hover" src="/img/footer/line2.png" alt="line-icon-hover" /></a>
              </div>
            </div>
          </div>
        </div>

        <!-- 手機版收合 -->
        <div class="flex-column flex-md-row row d-block d-md-none fs-1">
          <div class="col-12 col-md-3 px-md-1 mb-4">
            <p class="fw-bold text-sm-left" data-bs-toggle="collapse" data-bs-target="#footer-1" role="button" aria-expanded="false">
              關於我們 <span class="footer-dropdown-icon"></span>
            </p>
            <ul class="text-start collapse" id="footer-1">
              <li><router-link to="/Home/StoreList">近期優惠</router-link></li>
              <li><router-link to="/Home/News">最新公告</router-link></li>
              <li><router-link to="/Home/About">關於DUDUPAY</router-link></li>
              <li><a href="https://www.mydy.com.tw/" target="_blank">關於東元</a></li>
            </ul>
          </div>
          <div class="col-12 col-md-3 px-md-1 mb-4">
            <p class="fw-bold text-sm-left" data-bs-toggle="collapse" data-bs-target="#footer-2" role="button" aria-expanded="false">
              商家專區 <span class="footer-dropdown-icon"></span>
            </p>
            <ul class="text-start collapse" id="footer-2">
              <li><router-link to="/Home/Dealer">已合作商家</router-link></li>
              <li><a href="https://www.mydy.com.tw/Home/Contact_us" target="_blank">成為合作商家</a></li>
              <li><router-link to="/Home/Faq">常見問與答</router-link></li>
            </ul>
          </div>
          <div class="col-12 col-md-3 px-md-1 mb-4">
            <p class="fw-bold text-sm-left" data-bs-toggle="collapse" data-bs-target="#footer-3" role="button" aria-expanded="false">
              聯絡我們 <span class="footer-dropdown-icon"></span>
            </p>
            <ul class="text-start collapse" id="footer-3">
              <li><a href="mailto:pschang@mydy.com.tw">業務合作洽談</a></li>
              <li><a href="https://maps.app.goo.gl/ongLuAEDVbN7xZNA8" target="_blank">新北市中和區建八路202號2樓</a></li>
            </ul>
          </div>
          <div class="col-12 col-md-3 text-center mb-4">
            <router-link to="/"><img class="w-100" src="/img/footerlogo.png" /></router-link>
          </div>
          <div class="social-icon-wrapper d-flex">
            <a href="https://www.facebook.com/profile.php?id=61575723575479" target="_blank"><img src="/img/line.png" /></a>
            <a href="https://www.instagram.com/dudupay520/" target="_blank"><img src="/img/ig.png" /></a>
            <a href="https://lin.ee/74qJkfR" target="_blank"><img src="/img/fb.png" /></a>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>
