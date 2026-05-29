<script setup></script>

<template>
  <div class="mb-7 register-link section text-center mt-0 mt-md-5">
    <a href="/Home/Register" target="_blank">
      <p class="fs-2 fs-md-3 py-3 py-md-4 mx-auto">立即線上申辦</p>
    </a>
  </div>
</template>

<style>
/* 由原站 Index.cshtml「按鈕熊熊升起效果」CSS 搬移 */
.register-link p {
  color: #fff;
  background-color: transparent;
  border-radius: 8px;
  position: relative;
  cursor: pointer;
  margin-bottom: 0;
  z-index: 1;
  clip-path: polygon(0% -500%, 100% -500%, 100% 100%, 0% 100%);
  animation: buttonPulse 3s infinite ease-in-out;
  transition: color 0.3s ease;
}

@keyframes buttonPulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(0, 171, 151, 0.4);
  }
  50% {
    transform: scale(1.02);
    box-shadow: 0 0 15px 5px rgba(0, 171, 151, 0.2);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(0, 171, 151, 0);
  }
}

.register-link p:hover {
  color: black;
  clip-path: polygon(0% -500%, 100% -500%, 100% 120%, 0% 120%);
  animation-play-state: paused;
  transition: clip-path 0.3s 0.3s ease-out;
}

.register-link p::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(110deg, #00ab97 40%, rgb(0 150 136 / 60%) 50%, #00ab97 60%);
  background-size: 200% 100%;
  border-radius: 8px;
  z-index: -2;
  transition: background-color 0.3s ease;
  animation: shimmerSweep 8s infinite linear;
}

@keyframes shimmerSweep {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.register-link p:hover::after {
  background: #ffc843;
}

.register-link p::before {
  content: '';
  width: 210px;
  height: 170px;
  display: block;
  position: absolute;
  background-image: url(/img/bear.png);
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center bottom;
  bottom: -15px;
  left: 80px;
  z-index: -1;
  opacity: 0;
  transform: translateY(180px);
  transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s ease;
}

.register-link p:hover::before {
  opacity: 1;
  transform: translateY(0);
}

@media (max-width: 768px) {
  .register-link p {
    clip-path: polygon(0% -500%, 100% -500%, 100% 120%, 0% 120%);
  }
  .register-link p::before {
    left: 15px;
    width: 140px;
    height: 115px;
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 576px) {
  .register-link p::before {
    width: 100px;
    height: 82px;
    bottom: -8px;
    left: 5px;
  }
}
</style>
