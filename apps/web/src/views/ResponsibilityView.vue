<template>
  <section>
    <el-skeleton v-if="store.loading" :rows="8" animated />
    <template v-else>
      <el-row :gutter="12" class="stats">
        <el-col :span="6"><el-statistic title="作业主体" :value="store.resources.length" /></el-col>
        <el-col :span="6"><el-statistic title="责任节点" :value="store.assignments.length" /></el-col>
        <el-col :span="6"><el-statistic title="已配置节点" :value="configuredCount" /></el-col>
        <el-col :span="6"><el-statistic title="校验异常" :value="invalidCount" /></el-col>
      </el-row>

      <el-card class="toolbar" shadow="never">
        <el-input v-model="keyword" placeholder="搜索节点、工点、原始路径" clearable />
        <el-select v-model="workpoint" placeholder="全部工点" clearable filterable>
          <el-option v-for="item in workpointOptions" :key="item" :label="item" :value="item" />
        </el-select>
        <el-switch v-model="leafOnly" active-text="仅末级施工单元" />
      </el-card>

      <el-table :data="filteredRows" height="calc(100vh - 260px)" border stripe>
        <el-table-column prop="name" label="节点" min-width="230">
          <template #default="{ row }">
            <span :style="{ paddingLeft: `${Number(row.level || 0) * 12}px` }">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="plannedWorkpointName" label="计划工点" min-width="180" />
        <el-table-column prop="type" label="类型" width="110" />
        <el-table-column label="施工队伍" min-width="180">
          <template #default="{ row }">
            <el-select :model-value="row.teamId" filterable clearable @change="(value: string) => onTeamChange(row.nodeId, value)">
              <el-option v-for="team in store.teams" :key="team.subjectId" :label="team.teamName" :value="team.teamId" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="作业班组" min-width="220">
          <template #default="{ row }">
            <el-select
              :model-value="row.subjectId"
              filterable
              clearable
              @change="(value: string) => onSubjectChange(row.nodeId, value)"
            >
              <el-option
                v-for="subject in store.resourcesForTeam(row.teamId)"
                :key="subject.subjectId"
                :label="subject.displayName"
                :value="subject.subjectId"
              />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column prop="validation" label="校验" min-width="180" />
      </el-table>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useProjectStore } from "../stores/project";

const store = useProjectStore();
const keyword = ref("");
const workpoint = ref("");
const leafOnly = ref(false);

const workpointOptions = computed(() => [...new Set(store.assignments.map((row) => row.plannedWorkpointName || row.workpointName).filter(Boolean))]);
const configuredCount = computed(() => store.assignments.filter((row) => row.teamId).length);
const invalidCount = computed(() => store.assignments.filter((row) => row.validation).length);

const filteredRows = computed(() => {
  const text = keyword.value.trim();
  return store.assignments.filter((row) => {
    if (leafOnly.value && row.isLeaf !== "是") return false;
    if (workpoint.value && (row.plannedWorkpointName || row.workpointName) !== workpoint.value) return false;
    if (!text) return true;
    return `${row.name}${row.workpointName}${row.plannedWorkpointName}${row.rawPath}`.includes(text);
  });
});

function onTeamChange(nodeId: string, teamId: string) {
  const team = store.teams.find((item) => item.teamId === teamId) || null;
  store.applyTeam(nodeId, team);
}

function onSubjectChange(nodeId: string, subjectId: string) {
  const subject = store.subjects.find((item) => item.subjectId === subjectId) || null;
  store.applySubject(nodeId, subject);
}
</script>
