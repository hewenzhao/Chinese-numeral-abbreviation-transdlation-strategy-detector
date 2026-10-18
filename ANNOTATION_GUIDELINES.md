# 汉英数字式缩略语翻译技巧识别与标注规范准则 (Natrans Annotation Guidelines)

## 1. 规范概述与核心研究准绳
本标注规范（Annotation Guidelines）专为汉英双语对齐语料库中“数字式缩略语”的识别、对齐、翻译技巧分类与 XML 规范化标注制定。

### 核心准绳与要求：
1. **以 `<Na>......</Na>` 标注为唯一绝对依据**：
   - 中文源文中的 `<Na>` 标签是缩略语实体的唯一合法标记。系统与研究者以此为基准进行提取、词频统计与句对定位。
2. **100% 穷尽识别与标注（Exhaustive Processing）**：
   - 语料中出现的每一个 `<Na>` 实体，均必须在第一步生成核验清单，并在第二步在对应英文译文中穷尽定位其译法片段，判定翻译技巧类别，无一遗漏。
3. **单句多实体复合句独立包裹**：
   - 若单句包含多个 `<Na>` 实体（例如同一句中出现“<Na>五位一体</Na>”与“<Na>四个全面</Na>”），在英文译文中必须分别使用 `<Natrans-X>` 独立闭合包裹，禁止将多个缩略语合并至单个标签内。

---

## 2. 四大翻译技巧分类体系与标注规范 (Natrans Taxonomy)

| 技巧代码 | 中文名称 | 英文名称 | 核心特征 | XML 标注标签 | 经典范例 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **I** | **直译** | Literal Translation | 保留数字与字面词汇，无附加展开解释 | `<Natrans-I>...</Natrans-I>` | `<Na>三大平台</Na>` → `<Natrans-I>Three Platforms</Natrans-I>` |
| **II** | **意译** | Free / Semantic Translation | 舍弃数字，完全按实质内涵语义展开 | `<Natrans-II>...</Natrans-II>` | `<Na>三农</Na>` → `<Natrans-II>agriculture, rural areas, and farmers</Natrans-II>` |
| **III** | **直译+意译** | Literal + Explanatory Gloss | 保留数字直译，附加括号/同位语意译解释 | `<Natrans-III>...</Natrans-III>` | `<Na>两重</Na>` → `<Natrans-III>the 'two majors' (major national strategies and security capacity in key areas)</Natrans-III>` |
| **IV** | **仿拟/借用** | Analogy / Lexical Borrowing | 仿照英美代码结构或借用英语固有固化词汇 | `<Natrans-IV>...</Natrans-IV>` | `<Na>四换三名</Na>` → `<Natrans-IV>4-R & 3-W</Natrans-IV>`<br/>`<Na>三位一体</Na>` → `<Natrans-IV>trinity</Natrans-IV>` |

---

## 3. 两步工作流标准执行规程 (Two-Step Workflow Protocol)

### 第一步：缩略语识别、句对定位与清单核验
- **操作目标**：扫描源语料库，提取去重后的数字缩略语词条及其出现频次，锁定含有 `<Na>` 的重点汉英句对。
- **交付清单**：
  1. 《提取缩略语清单》（词条、频次、关联句对编号）
  2. 《定位汉英句对核验清单》（高亮 `<Na>` 标记与英文原译）
- **核验确认**：研究者可在线审阅、纠错 `<Na>` 标签，确认无误后点击启动第二步。

### 第二步：英译技巧识别、闭合标注与综合清单
- **操作目标**：大模型对锁定的重点句对执行 100% 穷尽标注，在英文译文中用 `<Natrans-I/II/III/IV>` 独立闭合包裹。
- **交付清单**：
  1. 《翻译技巧识别与标注明细清单》（序号、句对编号、缩略语、英译片段、技巧分类 I~IV、学术判定依据）
  2. 《学术计量统计看板》（各技巧频次、构成占比、100% 穷尽覆盖率）
- **导出交付**：支持一键导出排版对齐的学术 Word 交付文档 (`.docx`) 及 TSV 纯文本表格。

---

## 4. 大模型系统提示词与评判准则 (System Prompt Specification)
在调用 Gemini 3.7 大模型执行标注时，系统底层采用严格约束的 JSON Schema 与结构化 Prompt，确保：
1. `detectedTerms` 数组长度必须严格等于该句中 identified `<Na>` 的总项数。
2. 每个项均输出明确的学术判定理由（explanation），提供可追溯的定性研究依据。
