<template>
  <section>
    <el-skeleton v-if="store.loading" :rows="8" animated />
    <template v-else-if="store.config">
      <el-row :gutter="12" class="stats">
        <el-col :span="6"><el-statistic title="计划工点" :value="store.config.workpointOrder.length" /></el-col>
        <el-col :span="6"><el-statistic title="架梁方向" :value="store.config.beamLines.length" /></el-col>
        <el-col :span="6"><el-statistic title="理论工效" :value="store.config.productivity.length" /></el-col>
        <el-col :span="6"><el-statistic title="任务配置" :value="store.config.scheduleTasks.length" /></el-col>
      </el-row>

      <el-tabs>
        <el-tab-pane label="工点推进顺序">
          <el-table :data="store.config.workpointOrder" border stripe>
            <el-table-column prop="order" label="排序" width="80" />
            <el-table-column prop="discipline" label="专业" width="140" />
            <el-table-column prop="name" label="工点" min-width="200" />
            <el-table-column label="前序工点" min-width="220">
              <template #default="{ row }">
                <el-input v-model="row.prev" @change="store.persistDraft" />
              </template>
            </el-table-column>
            <el-table-column label="间隔天数" width="130">
              <template #default="{ row }">
                <el-input v-model="row.gap" @change="store.persistDraft" />
              </template>
            </el-table-column>
            <el-table-column label="手动开始时间" width="160">
              <template #default="{ row }">
                <el-input v-model="row.start" placeholder="YYYY-MM-DD" @change="store.persistDraft" />
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="架梁方向">
          <el-table :data="store.config.beamLines" border stripe>
            <el-table-column prop="name" label="方向名称" min-width="160" />
            <el-table-column prop="startPier" label="起点墩台" min-width="220" />
            <el-table-column prop="endPier" label="终点墩台" min-width="220" />
            <el-table-column label="架桥资源" min-width="160">
              <template #default="{ row }">
                <el-input v-model="row.resource" @change="store.persistDraft" />
              </template>
            </el-table-column>
            <el-table-column label="计划开始时间" width="160">
              <template #default="{ row }">
                <el-input v-model="row.startTime" placeholder="YYYY-MM-DD" @change="store.persistDraft" />
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="任务配置">
          <el-table :data="visibleTasks" height="calc(100vh - 310px)" border stripe>
            <el-table-column prop="workpointName" label="工点" min-width="180" />
            <el-table-column prop="structureName" label="结构对象" min-width="180" />
            <el-table-column prop="taskOrder" label="序号" width="80" />
            <el-table-column prop="name" label="任务" min-width="150" />
            <el-table-column prop="craft" label="施工工艺" min-width="130" />
            <el-table-column prop="metric" label="工效" min-width="120" />
            <el-table-column prop="duration" label="工期" width="100" />
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useProjectStore } from "../stores/project";

const store = useProjectStore();
const visibleTasks = computed(() => store.config?.scheduleTasks.slice(0, 500) || []);
</script>
