import React from 'react';
import { X, BookOpen, Download, Copy, CheckCircle2, Layers, Sparkles, FileText, Code2 } from 'lucide-react';
import { TECHNIQUE_METAS, TranslationTechnique } from '../types';

interface GuidelineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuidelineModal: React.FC<GuidelineModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const techniques: TranslationTechnique[] = ['I', 'II', 'III', 'IV'];

  const guidelineMarkdown = `# 汉英数字式缩略语翻译技巧识别与标注规范准则 (Natrans Annotation Guidelines)

## 1. 研究背景与核心原则
数字式缩略语（Numerical Abbreviations, 如“三农”、“六稳六保”、“两重”、“五位一体”）在中文政经、外交与对外传播话语中极具中国特色与高频使用特征。本系统与规范严格依据学术语料库对齐标准与严谨翻译策略分类法建立。

### 核心准绳：
- **<Na> 标签为绝对准绳**：以语料中中文句子的 \`<Na>......</Na>\` 标注符号为唯一定位与抽取标准。
- **100% 穷尽覆盖原则**：语料库中每一个 \`<Na>\` 实体均须在第一步完成句对锁定与词频统计；并在第二步在英文对应译文中穷尽定位其译法片段，判定翻译技巧（I~IV），并用独立 XML 标签包裹。
- **单句多实体复合处理**：若单句包含多个 \`<Na>\`（如同一句中包含“五位一体”和“四个全面”），英文译文中须分别独立包裹多个 \`<Natrans-X>\` 标签，并在明细清单中完整输出全部对应项。

---

## 2. 翻译技巧四大分类体系与标注规范 (Natrans Taxonomy)

### 类别 I：直译 (Literal Translation)
- **XML 标注标签**：\`<Natrans-I>...</Natrans-I>\`
- **学术定义**：完全保留汉语原文的数字形式与中心共有成分，不添加额外词义展开或括号补充说明。
- **典型特征**：英文包含对应基数词/序数词（如 Three, Four, Two 等）且紧随字面直译。
- **经典示例**：
  - 中文原文：\`<Na>三大平台</Na>\`
  - 英文译文：\`<Natrans-I>Three Platforms</Natrans-I>\`
  - 判定依据：保留数字结构 Three，字面直译 Platforms。

### 类别 II：意译 (Free / Semantic Translation)
- **XML 标注标签**：\`<Natrans-II>...</Natrans-II>\`
- **学术定义**：抛弃原文的数字表面结构，完全根据中文缩略语的具体内涵与政策实质进行语义展开翻译。
- **典型特征**：英文译文中完全省去数字表达，由并列的名词短语或从句展开。
- **经典示例**：
  - 中文原文：\`<Na>三农</Na>\`
  - 英文译文：\`<Natrans-II>agriculture, rural areas, and farmers</Natrans-II>\`
  - 判定依据：舍弃数字“三”，将农业、农村、农民的内涵完全意译展开。

### 类别 III：直译 + 意译 (Literal + Explanatory Gloss)
- **XML 标注标签**：\`<Natrans-III>...</Natrans-III>\`
- **学术定义**：同时保留原文的数字字面表达（直译），并在紧随的括号、同位语或补充从句中提供解释性意译。
- **典型特征**：英文中既有带数字的直译词组，又有括号或同位语补充说明具体内涵。
- **经典示例**：
  - 中文原文：\`<Na>两重</Na>\`
  - 英文译文：\`<Natrans-III>the 'two majors' (major national strategies and security capacity in key areas)</Natrans-III>\`
  - 判定依据：'two majors' 为直译保留数字，括号内为国家重大战略及重点领域安全能力的意译阐释。

### 类别 IV：仿拟 / 借用 (Analogy / Lexical Borrowing)
- **XML 标注标签**：\`<Natrans-IV>...</Natrans-IV>\`
- **学术定义**：仿照目标语英美数字缩略语结构（如首字母缩写、连字符代码）翻译，或直接借用英语固有固化词汇（如借用宗教/哲学/政制既有词汇）。
- **典型特征**：采用英式首字母缩写结构或借用如 trinity, troika, triage 等英语既有词汇。
- **经典示例**：
  - 中文原文：\`<Na>四换三名</Na>\` → 译文：\`<Natrans-IV>4-R & 3-W</Natrans-IV>\` (仿拟代码结构)
  - 中文原文：\`<Na>三位一体</Na>\` → 译文：\`<Natrans-IV>trinity</Natrans-IV>\` (借用英语固有词汇)

---

## 3. 两步工作流标准操作指引 (Two-Step Workflow)
1. **第一步（缩略语识别、句对定位与清单核验）**：
   - 自动扫描语料中所有 \`<Na>\` 标签，提取去重后的缩略语词条、频次及其所在句对索引。
   - 呈现《提取缩略语清单》与《定位汉英句对核验清单》，供研究者核对并可实时手动调整。
2. **第二步（英译技巧识别、独立闭合标注与综合清单）**：
   - 用户确认第一步清单后，大模型严格对锁定的重点句对执行 100% 穷尽标注。
   - 输出《翻译技巧识别与标注明细清单》（含序号、句对编号、缩略语、英译片段、技巧分类 I~IV 与学术判定依据）。
   - 支持一键导出 Word (.docx)、复制 TSV/Markdown 表格，用于学术论文分析与语料交付。
`;

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(guidelineMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([guidelineMarkdown], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Natrans_Annotation_Guidelines.md';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/80 dark:bg-stone-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                汉英数字式缩略语标注规范准则 (Annotation Guidelines)
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-mono border border-blue-200 dark:border-blue-800">
                  NuTrans Standard v2.0
                </span>
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                包含分类体系定义、学术判定标准、XML 标注规范与大模型系统提示词准绳
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-300 transition-colors"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '已复制 Markdown' : '复制规范全文'}</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadMarkdown}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-xs font-semibold text-white dark:text-stone-900 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>下载 .md 文档</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
          {/* Section 1: Introduction */}
          <div className="bg-stone-50 dark:bg-stone-950/60 border border-stone-200/80 dark:border-stone-800/80 rounded-xl p-4.5 space-y-3">
            <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              一、标注核心原则与工作流准绳
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-white dark:bg-stone-900 p-3 rounded-lg border border-stone-200 dark:border-stone-800">
                <span className="font-bold text-stone-900 dark:text-stone-100 block mb-1">
                  1. &lt;Na&gt; 标注为绝对准绳
                </span>
                中文源文必须以 <code className="font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-1 py-0.5 rounded">&lt;Na&gt;...&lt;/Na&gt;</code> 为唯一依据进行缩略语实体识别与定位。
              </div>
              <div className="bg-white dark:bg-stone-900 p-3 rounded-lg border border-stone-200 dark:border-stone-800">
                <span className="font-bold text-stone-900 dark:text-stone-100 block mb-1">
                  2. 100% 穷尽识别与标注
                </span>
                语料中出现的每一个数字缩略语实体，在第二步必须在英文译文中穷尽定位并判定技巧，无一遗漏。
              </div>
              <div className="bg-white dark:bg-stone-900 p-3 rounded-lg border border-stone-200 dark:border-stone-800">
                <span className="font-bold text-stone-900 dark:text-stone-100 block mb-1">
                  3. 复合句多实体独立包裹
                </span>
                单句若包含多个缩略语，英文中须分别以 <code className="font-mono text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 px-1 py-0.5 rounded">&lt;Natrans-X&gt;</code> 独立闭合包裹。
              </div>
            </div>
          </div>

          {/* Section 2: Taxonomy Definitions */}
          <div>
            <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2 mb-3">
              <Code2 className="w-4 h-4 text-emerald-600" />
              二、四大翻译技巧分类及标注规范 (Taxonomy Definition)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {techniques.map((code) => {
                const meta = TECHNIQUE_METAS[code];
                return (
                  <div
                    key={code}
                    className={`rounded-xl p-4 border ${meta.badgeBg} border-stone-200 dark:border-stone-800 flex flex-col justify-between`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white/90 dark:bg-black/40 border border-stone-200/80 dark:border-stone-700/80 text-stone-900 dark:text-stone-100">
                          {meta.tag}
                        </span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-stone-900/10 dark:bg-white/10 text-stone-800 dark:text-stone-200 font-mono">
                          技巧 {code}
                        </span>
                      </div>
                      <h5 className="text-sm font-bold text-stone-900 dark:text-stone-100 mt-1">
                        {code}（{meta.name} - {meta.nameEn}）
                      </h5>
                      <p className="text-xs text-stone-700 dark:text-stone-300 mt-1.5 leading-relaxed">
                        {meta.definition}
                      </p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-stone-200/60 dark:border-stone-800/60 text-xs">
                      <div className="text-stone-500 dark:text-stone-400 font-medium text-[11px] mb-1">
                        学术标准示例：
                      </div>
                      <div className="font-mono text-xs bg-white/80 dark:bg-black/40 p-2 rounded border border-stone-200/50 dark:border-stone-800/50 text-stone-800 dark:text-stone-200 break-words">
                        {meta.exampleZh} → <span className="font-bold text-stone-900 dark:text-stone-100">{meta.exampleAnnotated}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Two-step workflow explanation */}
          <div className="bg-stone-50 dark:bg-stone-950/60 border border-stone-200/80 dark:border-stone-800/80 rounded-xl p-4.5 space-y-3">
            <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-600" />
              三、学术标注两阶段流程规范
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 flex items-center justify-center font-bold shrink-0">
                  1
                </span>
                <div>
                  <strong className="text-stone-900 dark:text-stone-100">第一步：缩略语提取、句对锁定与核验清单</strong>
                  <p className="text-stone-600 dark:text-stone-400 mt-0.5">
                    从源语料中提取全部去重后的数字缩略语词条及其频次（生成清单一），并锁定对应的汉英双语对齐句对（生成清单二）。研究者可对清单进行人工审阅与纠错。
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-stone-200 dark:border-stone-800">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center font-bold shrink-0">
                  2
                </span>
                <div>
                  <strong className="text-stone-900 dark:text-stone-100">第二步：英译技巧识别、闭合标注与综合清单</strong>
                  <p className="text-stone-600 dark:text-stone-400 mt-0.5">
                    基于第一步核验锁定的清单，大模型对目标句对进行精准技巧判别（I~IV），并在英文译文中使用 &lt;Natrans-X&gt; 闭合包裹。标注完成后输出结构化明细清单与统计分析图表，支持 Word/TSV 导出。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-900/80 flex items-center justify-between">
          <span className="text-xs text-stone-500 dark:text-stone-400">
            规范已内置于大模型系统提示词（System Prompt）中，保障 100% 一致性与穷尽度。
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-bold transition-colors"
          >
            我已了解并关闭
          </button>
        </div>
      </div>
    </div>
  );
};
