import { computed, ref } from "vue";
import { defineStore } from "pinia";
import type { Assignment, ProjectStructure, Resource, ResponsibilityPayload } from "@construction/shared";
import { api } from "../api/client";

const draftKey = "construction-platform.config-draft.v1";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export const useProjectStore = defineStore("project", () => {
  const loading = ref(false);
  const saving = ref(false);
  const error = ref("");
  const projectId = ref("default");
  const projectStructure = ref<ProjectStructure | null>(null);
  const config = ref<ResponsibilityPayload | null>(null);

  const assignments = computed(() => config.value?.assignments || []);
  const resources = computed(() => config.value?.resources || []);
  const teams = computed(() => resources.value.filter((item) => item.type === "队伍"));
  const subjects = computed(() => resources.value);
  const workpoints = computed(() => projectStructure.value?.workpoints || []);

  async function load() {
    loading.value = true;
    error.value = "";
    try {
      const bootstrap = await api.bootstrap("default");
      projectId.value = bootstrap.projectId || bootstrap.config.source?.projectId || "default";
      projectStructure.value = bootstrap.projectStructure;
      const draft = localStorage.getItem(draftKey);
      config.value = draft ? JSON.parse(draft) : bootstrap.config;
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : String(cause);
    } finally {
      loading.value = false;
    }
  }

  function persistDraft() {
    if (!config.value) return;
    localStorage.setItem(draftKey, JSON.stringify(config.value));
  }

  function clearDraft() {
    localStorage.removeItem(draftKey);
  }

  function resourcesForTeam(teamId: string) {
    return subjects.value.filter((subject) => subject.teamId === teamId);
  }

  function updateAssignment(nodeId: string, patch: Partial<Assignment>) {
    const row = assignments.value.find((item) => item.nodeId === nodeId);
    if (!row) return;
    Object.assign(row, patch);
    persistDraft();
  }

  function applyTeam(nodeId: string, team: Resource | null) {
    const row = assignments.value.find((item) => item.nodeId === nodeId);
    if (!row) return;
    updateAssignment(nodeId, {
      teamId: team?.teamId || "",
      teamName: team?.teamName || "",
      subjectId: "",
      subjectName: "",
    });
    if (row.isLeaf !== "是") {
      assignments.value
        .filter((item) => item.isLeaf === "是" && item.nodeId.startsWith(`${nodeId}>`))
        .forEach((item) => {
          Object.assign(item, {
            teamId: team?.teamId || "",
            teamName: team?.teamName || "",
            subjectId: "",
            subjectName: "",
          });
        });
      persistDraft();
    }
  }

  function applySubject(nodeId: string, subject: Resource | null) {
    const row = assignments.value.find((item) => item.nodeId === nodeId);
    if (!row) return;
    updateAssignment(nodeId, {
      teamId: subject?.teamId || row.teamId || "",
      teamName: subject?.teamName || row.teamName || "",
      subjectId: subject?.subjectId || "",
      subjectName: subject?.displayName || "",
    });
    if (row.isLeaf !== "是") {
      assignments.value
        .filter((item) => item.isLeaf === "是" && item.nodeId.startsWith(`${nodeId}>`))
        .forEach((item) => {
          Object.assign(item, {
            teamId: subject?.teamId || item.teamId || "",
            teamName: subject?.teamName || item.teamName || "",
            subjectId: subject?.subjectId || "",
            subjectName: subject?.displayName || "",
          });
        });
      persistDraft();
    }
  }

  function serializeConfig() {
    if (!config.value) throw new Error("配置尚未加载。");
    return clone(config.value);
  }

  async function save() {
    saving.value = true;
    error.value = "";
    try {
      const result = await api.saveConfig(projectId.value, serializeConfig());
      clearDraft();
      return result;
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : String(cause);
      throw cause;
    } finally {
      saving.value = false;
    }
  }

  return {
    loading,
    saving,
    error,
    projectId,
    projectStructure,
    config,
    assignments,
    resources,
    teams,
    subjects,
    workpoints,
    load,
    save,
    persistDraft,
    resourcesForTeam,
    applyTeam,
    applySubject,
  };
});
