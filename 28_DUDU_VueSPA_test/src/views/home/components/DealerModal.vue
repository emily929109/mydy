<script setup>
const visible = defineModel({ type: Boolean, default: false })
</script>

<template>
  <el-dialog v-model="visible" :modal="true">
    <span>
      感謝您完成電子合約簽署。<br />本案已進入最終審核程序，預計將於 1 至 3
      個工作日內完成審核並回覆。如有任何進展，我們將第一時間通知您。
    </span>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="visible = false">關閉</el-button>
      </div>
    </template>
  </el-dialog>
</template>
