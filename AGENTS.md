# 项目说明与协作备忘

本文档记录当前 `D:\codex` 项目的结构、运行方式、数据流和开发注意事项，供后续维护者或编码 Agent 快速接手。

## 1. 项目定位

这是一个本地运行的施工计划排程原型项目，围绕“项目结构数据解析 → 责任区域配置 → 计划排程逻辑配置 → 排程结果计算”展开。

当前核心目标：

- 从 `项目结构数据/项目结构物数据.txt` 中解析项目、专业、工点、结构对象、施工单元数据。
- 生成左侧项目结构树和右侧结构对象/任务拆解数据。
- 用 Excel 维护队伍、班组、责任区域、施工方向、架梁方向、理论工效和计划任务配置。
- 在 HTML 页面中读取这些配置，支持页面编辑并写回本地 Excel。
- 基于配置生成可校验、可发布的计划排程结果。

当前项目数据快照：

- 项目名称：`XX公路项目2`
- 工点数量：`10`
- 施工单元数量：`722`
- 责任区域配置行数：`767`
- 班组施工方向行数：`32`
- 理论工效行数：`29`
- 计划排程任务配置行数：`320`

## 2. 主要入口

### 页面入口

- `responsibility-area-settings.html`
  - 初始化设置里的“责任区域设置”页面。
  - 用于配置结构树节点的施工队伍和作业班组。
  - 读取 `项目结构数据/output/project_structure_data.js` 和 `项目结构数据/output/responsibility_area_data.js`。

- `project-schedule-logic-settings.html`
  - “计划排程逻辑设置”页面。
  - 包含工点推进顺序、架梁方向、队伍/班组责任区域、结构对象树、结构任务拆解、校验、发布等模块。
  - 依赖 `project-schedule-engine.js` 执行校验和排程算法。

### 本地服务入口

- `启动本地配置服务.bat`
  - 启动 `local_config_server.mjs`。
  - 默认监听 `http://127.0.0.1:8787`。
  - 启动后会打开 `responsibility-area-settings.html`。
  - 页面写 Excel 时必须通过这个本地服务。

### 数据更新入口

- `项目结构数据/运行数据更新.bat`
  - 双击后自动寻找当前目录下的 `.txt` 文件。
  - 执行 `local_json_to_construction_db.py`，将 txt/json 解析成结构数据。
  - 执行 `sync_responsibility_workbook.mjs`，同步责任区域 Excel 和页面数据。

## 3. 数据流

标准数据更新流程：

1. 用户更新 `项目结构数据/项目结构物数据.txt`。
2. 双击运行 `项目结构数据/运行数据更新.bat`。
3. Python 脚本解析 txt/json，输出：
   - `项目结构数据/output/construction_units.csv`
   - `项目结构数据/output/construction_units.db`
   - `项目结构数据/output/construction_units_summary.csv`
   - `项目结构数据/output/project_structure_data.json`
   - `项目结构数据/output/project_structure_data.js`
4. Node 脚本同步责任区域配置表，输出：
   - `项目结构数据/责任区域配置.xlsx`
   - `项目结构数据/output/responsibility_area_data.json`
   - `项目结构数据/output/responsibility_area_data.js`
5. HTML 页面读取 `output/*.js` 作为页面数据源。
6. 页面编辑后，通过 `local_config_server.mjs` 写回 `责任区域配置.xlsx`，并刷新 `responsibility_area_data.json/js`。

不要手工编辑 `output/project_structure_data.js` 或 `output/responsibility_area_data.js`，这些文件应由脚本生成。

## 4. Excel 工作簿

主配置工作簿：

- `项目结构数据/责任区域配置.xlsx`

当前包含 7 个 sheet：

1. `队伍班组基础数据`
   - 手动维护施工队伍、班组、作业主体。
   - 作业主体支持“队伍”和“队伍-班组”。

2. `责任区域设置`
   - 保存结构树节点与施工队伍/作业班组的配置关系。
   - 结构节点来自 txt 解析后的结构树。

3. `班组施工方向`
   - 保存班组在工点内的施工方向。
   - 主要支持“从小到大”和“从大到小”。

4. `架梁方向设置`
   - 保存架梁方向、起终点墩台、架桥资源、转场时间、前置方向、计划开始时间。

5. `理论工效配置`
   - 保存默认理论工效。
   - 施工工序通过结构树类型和关键字与项目结构对象匹配。
   - 当前约定：所有桩基默认按 `旋挖钻`，墩身默认按 `整体式浇筑`。

6. `工点推进顺序`
   - 保存同专业工点组织推进顺序、间隔天数、手动开始时间。

7. `计划排程任务配置`
   - 保存计划排程页面里的结构任务项拆解结果。
   - 页面保存后会写入这里，后续可手动维护。

注意：如果 Excel/WPS 正打开 `责任区域配置.xlsx`，脚本或页面保存可能失败，或生成 `责任区域配置_待替换.xlsx`。保存前应关闭占用该文件的 Excel/WPS 窗口。

## 5. 关键脚本说明

### `项目结构数据/local_json_to_construction_db.py`

负责解析 `项目结构物数据.txt` 或 json 输入。

主要能力：

- 扁平化施工单元。
- 识别项目、专业、工点、左右幅、墩号、梁号、现浇连续梁块段等信息。
- 生成施工单元 CSV、SQLite 数据库和页面结构树数据。
- 将桥梁左右幅拆成独立计划工点。
- 输出 `PROJECT_STRUCTURE_DATA` 给页面使用。

### `项目结构数据/sync_responsibility_workbook.mjs`

负责把最新结构数据与责任区域 Excel 同步。

主要能力：

- 读取 `construction_units.csv` 和 `project_structure_data.json`。
- 维护 `责任区域配置.xlsx` 的 7 个 sheet。
- 根据 txt 变化对责任区域配置做增删改同步。
- 保留可复用的手动配置，例如队伍、作业班组、施工方向、架梁方向、理论工效、任务配置。
- 生成 `RESPONSIBILITY_AREA_DATA` 给页面使用。

### `local_config_server.mjs`

本地 HTTP 服务，负责页面与 Excel 的读写桥接。

主要接口：

- `GET /api/responsibility/data`
  - 从 `责任区域配置.xlsx` 读取最新配置并刷新页面数据。

- `POST /api/responsibility/save`
  - 接收页面当前配置，写回 `责任区域配置.xlsx`。
  - 同步输出 `responsibility_area_data.json/js`。

- `GET /api/status`
  - 返回服务状态和工作簿路径。

### `project-schedule-logic-settings.js`

计划排程逻辑设置页面的主交互脚本。

主要职责：

- 渲染项目结构树、项目级配置、工点级配置。
- 读取并应用 Excel 中的工点推进顺序、架梁方向、理论工效和计划任务配置。
- 根据当前结构对象生成默认结构任务拆解。
- 默认从 `理论工效配置` 匹配施工工艺和工效。
- 页面保存时，将方向、任务配置、工点推进顺序等写回 Excel。

### `responsibility-area-settings.js`

责任区域设置页面的主交互脚本。

主要职责：

- 按 txt 解析出来的结构树展示工点和节点。
- 配置施工队伍和作业班组。
- 父节点配置会批量下发到下属末级施工单元。
- 作业班组选项依赖当前行施工队伍过滤。

### `project-schedule-engine.js`

计划排程算法引擎。

当前已有能力：

- 标准化工点、架梁方向、系统参数。
- 基础配置校验。
- 生成工点虚拟开始节点。
- 生成任务节点和内部 FS 关系。
- 生成下部结构完成控制节点。
- 生成工点内班组流水、跨工点班组流水。
- 生成架梁方向内部顺序、方向间关系、架桥资源串行关系和通行条件控制关系。
- 对全局网络做环检查和正向前推。

维护提醒：

- 引擎需要同时兼容浏览器和 Node 环境，文件末尾通过 `module.exports` 暴露。
- 页面侧传入的数据来自 `getScheduleEngineInput()`。
- 若要输出独立 Excel 排程结果，应优先复用该引擎，而不是另写一套算法。

## 6. 页面与数据约定

- 页面数据源不是后端数据库，而是本地生成的 `window.PROJECT_STRUCTURE_DATA` 和 `window.RESPONSIBILITY_AREA_DATA`。
- 工点树来自 `PROJECT_STRUCTURE_DATA.tree`。
- 工点列表来自 `PROJECT_STRUCTURE_DATA.workpoints`。
- 工点专属结构对象优先来自 `PROJECT_STRUCTURE_DATA.structureTemplatesByWorkpoint`。
- 责任区域、班组方向、理论工效、任务配置来自 `RESPONSIBILITY_AREA_DATA`。
- 页面编辑会先写内存状态，再通过本地服务保存到 Excel。
- 浏览器 `localStorage` 中可能缓存责任区域数据；如果页面显示旧数据，可以刷新本地服务数据或清理相关缓存。

## 7. 排程算法业务口径

当前 MVP 排程逻辑的核心口径：

- 工点手动开始时间只约束工点虚拟开始节点。
- 结构对象内部任务关系当前仅支持 FS。
- 结构对象首任务默认挂接到工点虚拟开始节点。
- 桥梁下部结构完成后，控制对应上部结构或架梁任务开始。
- 同一班组在同一工点内按施工方向串联。
- 同专业跨工点如果共享班组且施工内容一致，则按工点推进顺序串联。
- 架梁方向需要考虑方向内部顺序、方向间前置、架桥资源串行、隧道/路基通行条件。
- 排程采用全局任务网络拓扑排序后正向前推。

## 8. 常用命令

在 `D:\codex` 目录执行：

```powershell
node --check local_config_server.mjs
node --check project-schedule-engine.js
node --check project-schedule-logic-settings.js
node --check 项目结构数据\sync_responsibility_workbook.mjs
```

更新项目结构数据：

```powershell
项目结构数据\运行数据更新.bat
```

启动本地配置服务：

```powershell
启动本地配置服务.bat
```

检查 8787 端口是否已有服务：

```powershell
netstat -ano | Select-String ':8787'
```

## 9. 开发注意事项

- 当前目录不是 Git 仓库，`git status` 不可用。
- 文件整体使用 UTF-8，中文字段名较多，读写时请显式使用 UTF-8。
- 手动编辑文件时优先小范围修改，避免重写大文件。
- 修改 Excel schema 时，需要同时更新：
  - `local_config_server.mjs`
  - `项目结构数据/sync_responsibility_workbook.mjs`
  - 页面读取/保存逻辑
  - `responsibility_area_data.json/js` 的生成逻辑
- 修改结构树生成口径时，优先更新 `local_json_to_construction_db.py`，再运行 `运行数据更新.bat` 重新生成输出。
- 修改计划排程算法时，优先更新 `project-schedule-engine.js`，页面侧只负责组装输入和展示输出。
- 如果需要生成正式排程结果 Excel，建议新建独立脚本，读取 `project_structure_data.json`、`responsibility_area_data.json` 和 `project-schedule-engine.js` 的计算结果后输出，不要把结果写回 `责任区域配置.xlsx`。

