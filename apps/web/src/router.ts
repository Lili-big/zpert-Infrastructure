import { createRouter, createWebHistory } from "vue-router";
import ResponsibilityView from "./views/ResponsibilityView.vue";
import ScheduleView from "./views/ScheduleView.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: "/responsibility" },
    { path: "/responsibility", component: ResponsibilityView },
    { path: "/schedule", component: ScheduleView },
  ],
});
