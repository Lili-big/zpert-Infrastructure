<template>
  <el-container class="app-shell">
    <el-aside width="260px" class="sidebar">
      <div class="brand">
        <strong>施工计划排程</strong>
        <span>Construction Schedule</span>
      </div>
      <el-menu router :default-active="$route.path" class="nav">
        <el-menu-item index="/responsibility">责任区域设置</el-menu-item>
        <el-menu-item index="/schedule">计划排程逻辑</el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <div>
          <h1>{{ title }}</h1>
          <p>Vue + Fastify 架构预览，数据通过本地 API 写入 Supabase PostgreSQL。</p>
        </div>
        <el-button type="primary" :loading="store.saving" @click="save">保存到数据库</el-button>
      </el-header>
      <el-main class="main">
        <el-alert v-if="store.error" :title="store.error" type="error" show-icon class="mb" />
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import { useProjectStore } from "./stores/project";

const route = useRoute();
const store = useProjectStore();

const title = computed(() => (route.path.includes("schedule") ? "计划排程逻辑设置" : "责任区域设置"));

onMounted(() => {
  if (!store.config) void store.load();
});

async function save() {
  await store.save();
  ElMessage.success("配置已写入数据库");
}
</script>
