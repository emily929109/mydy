import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { registrationSteps } from '../config/registrationSteps'
import { useRegistrationStore } from '../stores/registration'
import type { StepKey } from '../types/registration'
import RegisterAccountView from '../views/register/RegisterAccountView.vue'
import RegisterUploadView from '../views/register/RegisterUploadView.vue'
import RegisterInfoView from '../views/register/RegisterInfoView.vue'
import RegisterTwcaConsentView from '../views/register/RegisterTwcaConsentView.vue'
import RegisterTwcaClauseView from '../views/register/RegisterTwcaClauseView.vue'
import RegisterTwcaVerifyView from '../views/register/RegisterTwcaVerifyView.vue'
import RegisterSignView from '../views/register/RegisterSignView.vue'

const stepComponents: Record<StepKey, RouteRecordRaw['component']> = {
  step1Account: RegisterAccountView,
  step2Upload: RegisterUploadView,
  step3Info: RegisterInfoView,
  step4TwcaConsent: RegisterTwcaConsentView,
  step5TwcaClause: RegisterTwcaClauseView,
  step6TwcaVerify: RegisterTwcaVerifyView,
  step7Sign: RegisterSignView,
}

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: registrationSteps[0].path },
  ...registrationSteps.map((step) => ({
    path: step.path,
    name: step.key,
    component: stepComponents[step.key],
  })),
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// 依 registrationSteps 的順序守門：某步驟的前面任一步驟未完成，一律導回第一個未完成的步驟。
router.beforeEach((to) => {
  const targetStep = registrationSteps.find((step) => step.path === to.path)
  if (!targetStep) return true

  const store = useRegistrationStore()
  const precedingSteps = registrationSteps.filter((step) => step.order < targetStep.order)
  const allPrecedingDone = precedingSteps.every((step) => store.isStepCompleted(step.key))
  if (allPrecedingDone) return true

  const firstIncompletePath = store.firstIncompleteStepPath()
  if (firstIncompletePath === to.path) return true
  return firstIncompletePath
})

export default router
