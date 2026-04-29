#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
本地版：项目结构物 JSON/TXT 转施工单元数据库脚本

适用场景：
- 在本地电脑直接运行；
- 输入文件为接口导出的 JSON/TXT，例如：项目结构物数据.txt；
- 以末级“施工单元”为一行；
- 输出 SQLite 数据库、CSV明细、CSV汇总；
- 不依赖 pandas/openpyxl，仅使用 Python 标准库。

目录建议：
project_structure_converter/
├─ local_json_to_construction_db.py
├─ 项目结构物数据.txt
└─ output/
   ├─ construction_units.db
   ├─ construction_units.csv
   └─ construction_units_summary.csv

运行方式：
1. Windows 双击：运行_转换项目结构物数据.bat
2. 命令行：
   python local_json_to_construction_db.py
   python local_json_to_construction_db.py --input "D:\\data\\项目结构物数据.txt"
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import re
import sqlite3
import sys
import traceback
from collections import Counter
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional


# =========================
# 0. 本地路径处理
# =========================

def get_script_dir() -> Path:
    """获取脚本所在目录，兼容 .py 和部分打包场景。"""
    if getattr(sys, "frozen", False):
        return Path(sys.executable).resolve().parent
    return Path(__file__).resolve().parent


def find_default_input(base_dir: Path) -> Optional[Path]:
    """
    本地默认查找输入文件。
    优先级：
    1. 项目结构物数据.txt
    2. 项目结构物数据.json
    3. 当前目录下第一个 .txt/.json 文件
    """
    candidates = [
        base_dir / "项目结构物数据.txt",
        base_dir / "项目结构物数据.json",
        base_dir / "project_structure.txt",
        base_dir / "project_structure.json",
    ]

    for path in candidates:
        if path.exists() and path.is_file():
            return path

    for suffix in ("*.json", "*.txt"):
        files = list(base_dir.glob(suffix))
        if files:
            return files[0]

    return None


def ensure_output_dir(base_dir: Path, output_arg: Optional[str]) -> Path:
    if output_arg:
        out_dir = Path(output_arg).expanduser().resolve()
    else:
        out_dir = base_dir / "output"

    out_dir.mkdir(parents=True, exist_ok=True)
    return out_dir


# =========================
# 1. JSON 读取与清洗
# =========================

def read_json_file(file_path: Path) -> Dict[str, Any]:
    """
    读取本地 JSON/TXT 文件。
    兼容：
    - utf-8 / utf-8-sig；
    - txt 内含 JSON；
    - 文件前后有少量非 JSON 内容。
    """
    if not file_path.exists():
        raise FileNotFoundError(f"输入文件不存在：{file_path}")

    text = file_path.read_text(encoding="utf-8-sig").strip()

    start = text.find("{")
    end = text.rfind("}")

    if start == -1 or end == -1 or end <= start:
        raise ValueError("未识别到有效 JSON。请确认文件内容是完整接口返回数据。")

    json_text = text[start:end + 1]
    return json.loads(json_text)


def get_root_node(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    兼容接口结构：
    {
        "code": 0,
        "message": "success",
        "data": {...}
    }
    """
    data = payload.get("data")
    if isinstance(data, dict):
        return data
    return payload


def to_str(value: Any) -> str:
    """所有 ID 统一按字符串处理，避免本地 Excel/数据库读取时科学计数法或精度问题。"""
    if value is None:
        return ""
    return str(value)


# =========================
# 2. 业务识别与解析
# =========================

def is_construction_unit(node: Dict[str, Any]) -> bool:
    """
    判断节点是否为末级施工单元。

    当前接口里施工单元通常是：
    - typeName == "施工单元"
    - leaf == 1
    - 没有 children
    """
    type_name = to_str(node.get("typeName"))
    leaf_flag = node.get("leaf")
    children = node.get("children")

    if type_name == "施工单元":
        return True

    if leaf_flag == 1 and not children:
        return True

    return False


def node_brief(node: Optional[Dict[str, Any]]) -> Dict[str, str]:
    if not node:
        return {"id": "", "name": "", "typeName": ""}
    return {
        "id": to_str(node.get("id")),
        "name": to_str(node.get("name")),
        "typeName": to_str(node.get("typeName")),
    }


def find_last_by_type(ancestors: List[Dict[str, Any]], type_name: str) -> Optional[Dict[str, Any]]:
    for node in reversed(ancestors):
        if to_str(node.get("typeName")) == type_name:
            return node
    return None


def find_work_point(ancestors: List[Dict[str, Any]], leaf: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    # 优先使用 typeName=工点
    for node in reversed(ancestors):
        if to_str(node.get("typeName")) == "工点":
            return node

    # 再按 workPointId 反查
    work_point_id = to_str(leaf.get("workPointId"))
    if work_point_id:
        for node in reversed(ancestors):
            if to_str(node.get("id")) == work_point_id:
                return node

    return None


def find_professional(root: Dict[str, Any], ancestors: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """
    当前结构通常为：
    项目 -> 专业工程 -> 工点 -> 子分部 -> 分项 -> 施工单元
    因此专业工程通常是 root 的第一层 child。
    """
    if len(ancestors) >= 2 and to_str(ancestors[0].get("id")) == to_str(root.get("id")):
        return ancestors[1]
    return None


def normalize_name(text: str) -> str:
    return (
        text.replace("－", "-")
            .replace("—", "-")
            .replace("–", "-")
            .replace("～", "-")
            .replace(" ", "")
    )


def parse_unit_name(name: str, item_name: str = "") -> Dict[str, str]:
    """
    从施工单元名称中解析常用业务字段。
    解析失败不影响入库，只会留空。

    示例：
    - 左幅1-1桩基
    - 左幅1#承台
    - 左幅1号墩
    - 左幅0-1号梁-7
    - 左幅5号墩T构-3'号块
    - 左幅5-6号墩中跨合拢段
    """
    result = {
        "side": "",
        "pier_no": "",
        "span_start_no": "",
        "span_end_no": "",
        "sub_no": "",
        "component_keyword": item_name or "",
    }

    text = normalize_name(name)

    m = re.search(r"(左幅|右幅|左洞|右洞|进口|出口)", text)
    if m:
        result["side"] = m.group(1)

    # 桩基：左幅1-1桩基
    m = re.search(r"(\d+)-(\d+)桩基", text)
    if m:
        result["pier_no"] = m.group(1)
        result["sub_no"] = m.group(2)
        result["component_keyword"] = "桩基"
        return result

    # 梁片：左幅0-1号梁-7 / 左幅0-4号梁-1
    m = re.search(r"(\d+)-(\d+)号梁-(\d+)", text)
    if m:
        result["span_start_no"] = m.group(1)
        result["span_end_no"] = m.group(2)
        result["sub_no"] = m.group(3)
        result["component_keyword"] = result["component_keyword"] or "梁"
        return result

    # 承台、盖梁、扩大基础：左幅1#承台 / 左幅1#盖梁 / 左幅0#扩大基础
    m = re.search(r"(\d+)#(承台|盖梁|台帽|桥台|扩大基础)", text)
    if m:
        result["pier_no"] = m.group(1)
        result["component_keyword"] = m.group(2)
        return result

    # 墩、台：左幅1号墩 / 左幅0号台
    m = re.search(r"(\d+)号(墩|台)", text)
    if m:
        result["pier_no"] = m.group(1)
        result["component_keyword"] = result["component_keyword"] or m.group(2)

    # T构块：左幅5号墩T构-3'号块 / 左幅5号墩T构－0号块
    m = re.search(r"(\d+)号墩T构-?(\d+'?)号块", text)
    if m:
        result["pier_no"] = m.group(1)
        result["sub_no"] = m.group(2)
        result["component_keyword"] = "T构块"
        return result

    # 合拢段：左幅5-6号墩中跨合拢段
    m = re.search(r"(\d+)-(\d+)号墩(边跨|中跨)?合拢段", text)
    if m:
        result["span_start_no"] = m.group(1)
        result["span_end_no"] = m.group(2)
        result["component_keyword"] = "合拢段"
        return result

    # 直线段：左幅4号墩边跨直线段
    m = re.search(r"(\d+)号墩.*直线段", text)
    if m:
        result["pier_no"] = m.group(1)
        result["component_keyword"] = "直线段"
        return result

    return result


# =========================
# 3. 树形 JSON 转施工单元行
# =========================

def flatten_construction_units(root: Dict[str, Any]) -> List[Dict[str, Any]]:
    rows: List[Dict[str, Any]] = []

    project_id = to_str(root.get("id"))
    project_name = to_str(root.get("name"))

    def walk(node: Dict[str, Any], ancestors: List[Dict[str, Any]]) -> None:
        current_path = ancestors + [node]

        if is_construction_unit(node):
            professional = node_brief(find_professional(root, ancestors))
            work_point = node_brief(find_work_point(ancestors, node))
            sub_part = node_brief(find_last_by_type(ancestors, "子分部工程"))
            item = node_brief(find_last_by_type(ancestors, "分项工程"))

            path_names = [to_str(n.get("name")) for n in current_path if to_str(n.get("name"))]
            path_ids = [to_str(n.get("id")) for n in current_path if to_str(n.get("id"))]

            parsed = parse_unit_name(
                name=to_str(node.get("name")),
                item_name=item["name"],
            )

            now = datetime.now().isoformat(timespec="seconds")

            row = {
                "project_id": project_id,
                "project_name": project_name,

                "professional_id": professional["id"],
                "professional_name": professional["name"],

                "work_point_id": work_point["id"] or to_str(node.get("workPointId")),
                "work_point_name": work_point["name"],

                "sub_part_id": sub_part["id"],
                "sub_part_name": sub_part["name"],

                "item_id": item["id"],
                "item_name": item["name"],

                "construction_unit_id": to_str(node.get("id")),
                "construction_unit_name": to_str(node.get("name")),

                "parent_id": to_str(node.get("pid")),
                "source_work_point_id": to_str(node.get("workPointId")),
                "relation_id": to_str(node.get("relationId")),
                "category_type": to_str(node.get("categoryType")),
                "type_name": to_str(node.get("typeName")),
                "leaf_flag": to_str(node.get("leaf")),
                "measure_unit": to_str(node.get("unit")),

                "side": parsed["side"],
                "pier_no": parsed["pier_no"],
                "span_start_no": parsed["span_start_no"],
                "span_end_no": parsed["span_end_no"],
                "sub_no": parsed["sub_no"],
                "component_keyword": parsed["component_keyword"],

                "instance_count": 1,
                "quantity_value": to_str(
                    node.get("quantity")
                    or node.get("designQuantity")
                    or node.get("engineeringQuantity")
                    or ""
                ),

                "full_path": " / ".join(path_names),
                "path_ids_json": json.dumps(path_ids, ensure_ascii=False),
                "path_names_json": json.dumps(path_names, ensure_ascii=False),
                "raw_json": json.dumps(node, ensure_ascii=False),

                "created_at": now,
                "updated_at": now,
            }

            rows.append(row)
            return

        for child in node.get("children") or []:
            if isinstance(child, dict):
                walk(child, current_path)

    walk(root, [])
    return rows


# =========================
# 4. 输出 SQLite / CSV / 汇总表
# =========================

CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS construction_unit (
    project_id TEXT,
    project_name TEXT,

    professional_id TEXT,
    professional_name TEXT,

    work_point_id TEXT,
    work_point_name TEXT,

    sub_part_id TEXT,
    sub_part_name TEXT,

    item_id TEXT,
    item_name TEXT,

    construction_unit_id TEXT PRIMARY KEY,
    construction_unit_name TEXT,

    parent_id TEXT,
    source_work_point_id TEXT,
    relation_id TEXT,
    category_type TEXT,
    type_name TEXT,
    leaf_flag TEXT,
    measure_unit TEXT,

    side TEXT,
    pier_no TEXT,
    span_start_no TEXT,
    span_end_no TEXT,
    sub_no TEXT,
    component_keyword TEXT,

    instance_count INTEGER,
    quantity_value TEXT,

    full_path TEXT,
    path_ids_json TEXT,
    path_names_json TEXT,
    raw_json TEXT,

    created_at TEXT,
    updated_at TEXT
);
"""

CREATE_INDEX_SQL_LIST = [
    "CREATE INDEX IF NOT EXISTS idx_cu_project ON construction_unit(project_id);",
    "CREATE INDEX IF NOT EXISTS idx_cu_work_point ON construction_unit(work_point_id);",
    "CREATE INDEX IF NOT EXISTS idx_cu_item ON construction_unit(item_name);",
    "CREATE INDEX IF NOT EXISTS idx_cu_side_pier ON construction_unit(side, pier_no);",
    "CREATE INDEX IF NOT EXISTS idx_cu_span ON construction_unit(span_start_no, span_end_no);",
    "CREATE INDEX IF NOT EXISTS idx_cu_relation ON construction_unit(relation_id);",
]


def write_sqlite(rows: List[Dict[str, Any]], db_path: Path) -> None:
    if not rows:
        raise ValueError("没有识别到施工单元数据，未写入数据库。")

    columns = list(rows[0].keys())
    placeholders = ", ".join(["?"] * len(columns))
    col_sql = ", ".join(columns)

    insert_sql = f"""
    INSERT OR REPLACE INTO construction_unit ({col_sql})
    VALUES ({placeholders});
    """

    conn = sqlite3.connect(str(db_path))
    try:
        cur = conn.cursor()
        cur.execute(CREATE_TABLE_SQL)
        for sql in CREATE_INDEX_SQL_LIST:
            cur.execute(sql)

        cur.executemany(
            insert_sql,
            [[row.get(col) for col in columns] for row in rows],
        )
        conn.commit()
    finally:
        conn.close()


def write_csv(rows: List[Dict[str, Any]], csv_path: Path) -> None:
    if not rows:
        return

    columns = list(rows[0].keys())
    with csv_path.open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=columns)
        writer.writeheader()
        writer.writerows(rows)


def build_summary(rows: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    counter = Counter()
    for row in rows:
        key = (
            row.get("project_name", ""),
            row.get("professional_name", ""),
            row.get("work_point_name", ""),
            row.get("sub_part_name", ""),
            row.get("item_name", ""),
            row.get("measure_unit", ""),
        )
        counter[key] += 1

    summary_rows = []
    for key, count in sorted(counter.items()):
        project_name, professional_name, work_point_name, sub_part_name, item_name, measure_unit = key
        summary_rows.append({
            "project_name": project_name,
            "professional_name": professional_name,
            "work_point_name": work_point_name,
            "sub_part_name": sub_part_name,
            "item_name": item_name,
            "measure_unit": measure_unit,
            "construction_unit_count": count,
        })

    return summary_rows


def write_summary_csv(summary_rows: List[Dict[str, Any]], csv_path: Path) -> None:
    if not summary_rows:
        return

    columns = list(summary_rows[0].keys())
    with csv_path.open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=columns)
        writer.writeheader()
        writer.writerows(summary_rows)


def stable_id(prefix: str, *parts: Any) -> str:
    raw = "|".join(to_str(part) for part in parts if to_str(part))
    digest = hashlib.sha1(raw.encode("utf-8")).hexdigest()[:12]
    return f"{prefix}-{digest}"


def infer_workpoint_kind(professional_name: str, work_point_name: str) -> str:
    text = f"{professional_name}{work_point_name}"
    if "隧道" in text or "洞" in work_point_name:
        return "tunnel"
    if "路基" in text:
        return "road"
    if "桥" in text or "梁" in text:
        return "bridge"
    return "general"


def discipline_node_id(kind: str, professional_id: str, professional_name: str, used_ids: set) -> str:
    preferred = {
        "bridge": "bridge",
        "tunnel": "tunnel",
        "road": "roadbed",
    }.get(kind)
    base_id = preferred or stable_id("discipline", professional_id, professional_name)
    node_id = base_id
    index = 2
    while node_id in used_ids:
        node_id = f"{base_id}-{index}"
        index += 1
    used_ids.add(node_id)
    return node_id


def parse_route_mile(name: str, fallback_index: int) -> int:
    match = re.search(r"K(\d+)\+(\d+)", name, re.IGNORECASE)
    if match:
        return int(match.group(1)) * 1000 + int(match.group(2))
    return fallback_index * 1000


def sort_key_by_numbers(value: str) -> List[Any]:
    parts = re.split(r"(\d+)", to_str(value))
    key: List[Any] = []
    for part in parts:
        key.append(int(part) if part.isdigit() else part)
    return key


def unit_row_brief(row: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "id": row.get("construction_unit_id", ""),
        "name": row.get("construction_unit_name", ""),
        "subPart": row.get("sub_part_name", ""),
        "item": row.get("item_name", ""),
        "unit": row.get("measure_unit", ""),
        "side": row.get("side", ""),
        "pierNo": row.get("pier_no", ""),
        "spanStartNo": row.get("span_start_no", ""),
        "spanEndNo": row.get("span_end_no", ""),
        "subNo": row.get("sub_no", ""),
        "component": row.get("component_keyword", ""),
        "fullPath": row.get("full_path", ""),
    }


def make_structure_node(prefix: str, key: str, name: str, node_type: str) -> Dict[str, Any]:
    return {
        "id": stable_id(prefix, key, name, node_type),
        "name": name,
        "type": node_type,
        "expanded": node_type == "子分部工程",
        "unitCount": 0,
        "constructionUnits": [],
        "_children": {},
    }


def add_unit_to_node(node: Dict[str, Any], unit: Dict[str, Any]) -> None:
    node["unitCount"] = node.get("unitCount", 0) + 1
    node.setdefault("constructionUnits", []).append(unit)


def child_node(parent: Dict[str, Any], prefix: str, key: str, name: str, node_type: str) -> Dict[str, Any]:
    children = parent.setdefault("_children", {})
    if key not in children:
        children[key] = make_structure_node(prefix, key, name, node_type)
    return children[key]


def finalize_structure_node(node: Dict[str, Any]) -> Dict[str, Any]:
    children = list(node.pop("_children", {}).values())
    children.sort(key=lambda item: sort_key_by_numbers(item.get("name", "")))
    if children:
        node["children"] = [finalize_structure_node(child) for child in children]
    else:
        node.pop("expanded", None)
    return node


def structure_node_sort_key(node: Dict[str, Any]) -> List[Any]:
    name = node.get("name", "")
    if "下部" in name:
        return [0]
    if "上部" in name:
        return [1]
    return [2, *sort_key_by_numbers(name)]


def lower_part_key(row: Dict[str, Any]) -> tuple:
    pier_no = row.get("pier_no") or "未识别"
    component = row.get("component_keyword", "")
    pier_label = "台" if "台" in component or pier_no in {"0", "9", "11", "13"} else "墩"
    return pier_no, f"{pier_no}#{pier_label}"


def strip_side_prefix(name: str) -> str:
    return re.sub(r"^(左幅|右幅|左洞|右洞)", "", to_str(name))


def int_or_none(value: Any) -> Optional[int]:
    text = to_str(value)
    return int(text) if text.isdigit() else None


def cast_in_place_interval(row: Dict[str, Any]) -> Optional[tuple]:
    if "现浇" not in to_str(row.get("item_name")):
        return None

    span_start = int_or_none(row.get("span_start_no"))
    span_end = int_or_none(row.get("span_end_no"))
    if span_start is not None and span_end is not None:
        return (min(span_start, span_end), max(span_start, span_end))

    pier_no = int_or_none(row.get("pier_no"))
    if pier_no is not None:
        return (pier_no, pier_no)

    return None


def build_cast_in_place_components(rows: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    intervals = [interval for row in rows if (interval := cast_in_place_interval(row))]
    if not intervals:
        return []

    intervals.sort()
    merged: List[List[int]] = []
    for start, end in intervals:
        if not merged or start > merged[-1][1]:
            merged.append([start, end])
        else:
            merged[-1][1] = max(merged[-1][1], end)

    return [{"start": start, "end": end, "key": f"{start}-{end}", "name": f"{start}-{end}号梁"} for start, end in merged]


def cast_in_place_beam_key(row: Dict[str, Any], components: List[Dict[str, Any]]) -> Optional[tuple]:
    interval = cast_in_place_interval(row)
    if not interval:
        return None

    start, end = interval
    for component in components:
        if component["start"] <= start and end <= component["end"]:
            return component["key"], component["name"]

    return f"{start}-{end}", f"{start}-{end}号梁"


def upper_part_key(row: Dict[str, Any], cast_components: Optional[List[Dict[str, Any]]] = None) -> tuple:
    item_name = row.get("item_name") or row.get("component_keyword") or "上部结构"
    span_start = row.get("span_start_no")
    span_end = row.get("span_end_no")
    pier_no = row.get("pier_no")

    if "现浇" in item_name:
        beam = cast_in_place_beam_key(row, cast_components or [])
        if beam:
            beam_key, beam_name = beam
            return item_name, beam_key, beam_name

    if span_start and span_end:
        return item_name, f"{span_start}-{span_end}", f"{span_start}-{span_end}号梁"

    if pier_no:
        return item_name, pier_no, f"{pier_no}#墩"

    return item_name, row.get("construction_unit_id", ""), row.get("construction_unit_name", "") or item_name


def build_structure_nodes(rows: List[Dict[str, Any]], prefix: str) -> List[Dict[str, Any]]:
    subparts: Dict[str, Dict[str, Any]] = {}
    cast_components = build_cast_in_place_components(rows)

    for row in rows:
        unit = unit_row_brief(row)
        sub_name = row.get("sub_part_name") or "结构对象"
        sub_key = row.get("sub_part_id") or sub_name

        if sub_key not in subparts:
            subparts[sub_key] = make_structure_node(f"{prefix}-sub", sub_key, sub_name, "子分部工程")

        subpart = subparts[sub_key]
        add_unit_to_node(subpart, unit)

        if "下部" in sub_name:
            pier_key, pier_name = lower_part_key(row)
            pier = child_node(subpart, f"{prefix}-pier", pier_key, pier_name, "墩台号")
            add_unit_to_node(pier, unit)
            continue

        if "上部" in sub_name:
            item_name, beam_key, beam_name = upper_part_key(row, cast_components)
            item = child_node(subpart, f"{prefix}-upper-item", item_name, item_name, "梁类型")
            add_unit_to_node(item, unit)
            beam = child_node(item, f"{prefix}-beam", f"{item_name}-{beam_key}", beam_name, "梁号")
            add_unit_to_node(beam, unit)
            continue

        item_name = row.get("item_name") or row.get("construction_unit_name") or "施工单元"
        item_key = row.get("item_id") or row.get("construction_unit_id") or item_name
        item_type = "分项工程" if row.get("item_name") else "施工单元"
        item = child_node(subpart, f"{prefix}-item", item_key, item_name, item_type)
        add_unit_to_node(item, unit)

    nodes: List[Dict[str, Any]] = []
    for subpart in subparts.values():
        nodes.append(finalize_structure_node(subpart))

    nodes.sort(key=structure_node_sort_key)

    return nodes


def build_pier_options(rows: List[Dict[str, Any]]) -> List[str]:
    options: List[str] = []
    seen = set()
    for row in rows:
        if infer_workpoint_kind(row.get("professional_name", ""), row.get("work_point_name", "")) != "bridge":
            continue
        pier_no = row.get("pier_no")
        if not pier_no:
            continue
        side = row.get("side", "")
        component = row.get("component_keyword", "")
        pier_label = "台" if "台" in component else "墩"
        option = f"{row.get('work_point_name', '')}-{side}-{pier_no}#{pier_label}".replace("--", "-")
        if option not in seen:
            seen.add(option)
            options.append(option)
    return options


def page_workpoint_identity(row: Dict[str, Any]) -> Dict[str, str]:
    professional_id = row.get("professional_id", "") or stable_id("professional", row.get("professional_name", ""))
    professional_name = row.get("professional_name", "") or "未命名专业"
    base_work_point_id = row.get("work_point_id", "") or stable_id("workpoint", professional_id, row.get("work_point_name", ""))
    base_work_point_name = row.get("work_point_name", "") or "未命名工点"
    kind = infer_workpoint_kind(professional_name, base_work_point_name)
    side = row.get("side", "")

    if kind == "bridge" and side in {"左幅", "右幅"}:
        side_code = "left" if side == "左幅" else "right"
        return {
            "id": f"{base_work_point_id}-{side_code}",
            "sourceId": base_work_point_id,
            "name": f"{base_work_point_name}{side}",
            "baseName": base_work_point_name,
            "side": side,
            "kind": kind,
        }

    return {
        "id": base_work_point_id,
        "sourceId": base_work_point_id,
        "name": base_work_point_name,
        "baseName": base_work_point_name,
        "side": side,
        "kind": kind,
    }


def build_page_data(rows: List[Dict[str, Any]], summary_rows: List[Dict[str, Any]]) -> Dict[str, Any]:
    if not rows:
        return {}

    project_id = rows[0].get("project_id", "")
    project_name = rows[0].get("project_name", "")
    professional_map: Dict[str, Dict[str, Any]] = {}

    for row in rows:
        professional_id = row.get("professional_id", "") or stable_id("professional", row.get("professional_name", ""))
        professional_name = row.get("professional_name", "") or "未命名专业"
        identity = page_workpoint_identity(row)
        work_point_id = identity["id"]
        work_point_name = identity["name"]
        kind = identity["kind"]

        if professional_id not in professional_map:
            professional_map[professional_id] = {
                "id": professional_id,
                "name": professional_name,
                "kind": kind,
                "workpoints": {},
                "unitCount": 0,
            }

        professional = professional_map[professional_id]
        professional["unitCount"] += 1
        if work_point_id not in professional["workpoints"]:
            professional["workpoints"][work_point_id] = {
                "id": work_point_id,
                "sourceId": identity["sourceId"],
                "disciplineId": professional_id,
                "discipline": professional_name,
                "kind": kind,
                "name": work_point_name,
                "baseName": identity["baseName"],
                "side": identity["side"],
                "type": "workpoint",
                "status": "已配置",
                "unitCount": 0,
            }
        professional["workpoints"][work_point_id]["unitCount"] += 1

    used_node_ids = {"project-root"}
    workpoints: List[Dict[str, Any]] = []
    tree_children: List[Dict[str, Any]] = []
    workpoint_rows_by_id: Dict[str, List[Dict[str, Any]]] = {}
    rows_by_kind: Dict[str, List[Dict[str, Any]]] = {}

    for row in rows:
        identity = page_workpoint_identity(row)
        work_point_id = identity["id"]
        kind = identity["kind"]
        workpoint_rows_by_id.setdefault(work_point_id, []).append(row)
        rows_by_kind.setdefault(kind, []).append(row)

    for professional in professional_map.values():
        node_id = discipline_node_id(professional["kind"], professional["id"], professional["name"], used_node_ids)
        previous_name = ""
        children = []
        for workpoint in professional["workpoints"].values():
            index = len(workpoints) + 1
            workpoint["prev"] = previous_name
            workpoint["gap"] = "0"
            workpoint["start"] = ""
            workpoint["mile"] = parse_route_mile(workpoint["name"], index)
            workpoints.append({
                "id": workpoint["id"],
                "sourceId": workpoint["sourceId"],
                "discipline": workpoint["discipline"],
                "kind": workpoint["kind"],
                "name": workpoint["name"],
                "baseName": workpoint["baseName"],
                "side": workpoint["side"],
                "prev": workpoint["prev"],
                "gap": workpoint["gap"],
                "start": workpoint["start"],
                "mile": workpoint["mile"],
                "unitCount": workpoint["unitCount"],
            })
            children.append({
                "id": workpoint["id"],
                "sourceId": workpoint["sourceId"],
                "name": workpoint["name"],
                "type": "workpoint",
                "status": workpoint["status"],
                "baseName": workpoint["baseName"],
                "side": workpoint["side"],
                "unitCount": workpoint["unitCount"],
            })
            previous_name = workpoint["name"]

        tree_children.append({
            "id": node_id,
            "sourceId": professional["id"],
            "name": professional["name"],
            "type": "discipline",
            "status": "已配置",
            "expanded": True,
            "unitCount": professional["unitCount"],
            "children": children,
        })

    pier_options = build_pier_options(rows)
    beam_lines = []
    if pier_options:
        beam_lines.append({
            "id": "beam-1",
            "name": "架梁方向1",
            "startPier": pier_options[0],
            "endPier": pier_options[-1],
            "resource": "1号架桥机",
            "transfer": "0",
            "prev": "",
            "startTime": "",
        })

    structure_templates_by_workpoint = {
        workpoint_id: build_structure_nodes(workpoint_rows, f"wp-{stable_id('', workpoint_id).strip('-')}")
        for workpoint_id, workpoint_rows in workpoint_rows_by_id.items()
    }
    structure_templates = {
        kind: build_structure_nodes(kind_rows, kind)
        for kind, kind_rows in rows_by_kind.items()
    }

    return {
        "source": {
            "projectId": project_id,
            "projectName": project_name,
            "constructionUnitCount": len(rows),
            "workpointCount": len(workpoints),
            "generatedAt": datetime.now().isoformat(timespec="seconds"),
        },
        "tree": [{
            "id": "project-root",
            "sourceId": project_id,
            "name": project_name,
            "type": "project",
            "status": "已配置",
            "expanded": True,
            "unitCount": len(rows),
            "children": tree_children,
        }],
        "workpoints": workpoints,
        "pierOptions": pier_options,
        "beamLines": beam_lines,
        "resources": ["1号架桥机", "2号架桥机", "3号架桥机"],
        "structureTemplates": structure_templates,
        "structureTemplatesByWorkpoint": structure_templates_by_workpoint,
        "summary": summary_rows,
    }


def write_page_data_files(rows: List[Dict[str, Any]], summary_rows: List[Dict[str, Any]], output_dir: Path) -> None:
    page_data = build_page_data(rows, summary_rows)
    json_path = output_dir / "project_structure_data.json"
    js_path = output_dir / "project_structure_data.js"

    json_text = json.dumps(page_data, ensure_ascii=False, indent=2)
    json_path.write_text(json_text + "\n", encoding="utf-8")
    js_path.write_text(f"window.PROJECT_STRUCTURE_DATA = {json_text};\n", encoding="utf-8")


def print_summary(rows: List[Dict[str, Any]], output_dir: Path) -> None:
    print("\n====== 转换结果 ======")
    print(f"施工单元总数：{len(rows)}")

    work_points = sorted({r["work_point_name"] for r in rows if r.get("work_point_name")})
    print(f"工点数量：{len(work_points)}")
    if work_points:
        print("工点列表：")
        for name in work_points[:20]:
            print(f"  - {name}")
        if len(work_points) > 20:
            print(f"  ... 还有 {len(work_points) - 20} 个")

    print("\n输出文件：")
    print(f"  - {output_dir / 'construction_units.db'}")
    print(f"  - {output_dir / 'construction_units.csv'}")
    print(f"  - {output_dir / 'construction_units_summary.csv'}")
    print(f"  - {output_dir / 'project_structure_data.json'}")
    print(f"  - {output_dir / 'project_structure_data.js'}")
    print("====================\n")


# =========================
# 5. 主程序：适配本地双击运行
# =========================

def run(input_path: Path, output_dir: Path) -> None:
    payload = read_json_file(input_path)
    root = get_root_node(payload)

    rows = flatten_construction_units(root)
    if not rows:
        raise ValueError("未识别到任何末级施工单元。请检查 JSON 中是否包含 typeName=施工单元 或 leaf=1。")

    db_path = output_dir / "construction_units.db"
    csv_path = output_dir / "construction_units.csv"
    summary_csv_path = output_dir / "construction_units_summary.csv"
    summary_rows = build_summary(rows)

    write_sqlite(rows, db_path)
    write_csv(rows, csv_path)
    write_summary_csv(summary_rows, summary_csv_path)
    write_page_data_files(rows, summary_rows, output_dir)

    print_summary(rows, output_dir)


def main() -> None:
    base_dir = get_script_dir()

    parser = argparse.ArgumentParser(description="本地版：项目结构物 JSON/TXT 转施工单元数据库。")
    parser.add_argument("--input", "-i", help="输入 JSON/TXT 文件路径。不填则默认查找脚本同目录下的项目结构物数据.txt。")
    parser.add_argument("--output", "-o", help="输出目录。不填则输出到脚本同目录下的 output 文件夹。")

    args = parser.parse_args()

    if args.input:
        input_path = Path(args.input).expanduser().resolve()
    else:
        input_path = find_default_input(base_dir)
        if input_path is None:
            print("未在脚本同目录找到 项目结构物数据.txt / .json。")
            manual_path = input("请输入 JSON/TXT 文件完整路径：").strip().strip('"')
            input_path = Path(manual_path).expanduser().resolve()

    output_dir = ensure_output_dir(base_dir, args.output)

    print("====== 本地结构物数据转换 ======")
    print(f"脚本目录：{base_dir}")
    print(f"输入文件：{input_path}")
    print(f"输出目录：{output_dir}")

    run(input_path, output_dir)


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print("\n转换失败：")
        print(str(e))
        print("\n详细错误：")
        traceback.print_exc()

    # 双击运行时保留窗口，命令行运行时也不会影响结果
    if sys.stdin and sys.stdin.isatty():
        input("\n按 Enter 键退出...")
