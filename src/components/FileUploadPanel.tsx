import React, { useState, useRef } from 'react';
import { BilingualPair } from '../types';
import { SAMPLE_CORPORA } from '../data/sampleCorpus';
import {
  Upload,
  FileText,
  Sparkles,
  Layers,
  FileCheck,
  RefreshCw,
  Plus,
  Trash2,
  HelpCircle,
  FileSpreadsheet,
  RotateCcw,
  FileX2
} from 'lucide-react';

interface FileUploadPanelProps {
  onLoadPairs: (pairs: BilingualPair[], sourceName?: string) => void;
  onStartAnnotation: () => void;
  onClearAll?: () => void;
  onResetAnnotations?: () => void;
  onOpenClearModal?: () => void;
  isAnnotating: boolean;
  totalPairs: number;
  annotatedPairsCount?: number;
  naPairsCount?: number;
  naTermsCount?: number;
}

export const FileUploadPanel: React.FC<FileUploadPanelProps> = ({
  onLoadPairs,
  onStartAnnotation,
  onClearAll,
  onResetAnnotations,
  onOpenClearModal,
  isAnnotating,
  totalPairs,
  annotatedPairsCount = 0,
  naPairsCount = 0,
  naTermsCount = 0
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'samples'>('samples');
  const [pastedText, setPastedText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isParsingDocx, setIsParsingDocx] = useState(false);
  const [uploadFileName, setUploadFileName] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Word docx file upload
  const handleFile = async (file: File) => {
    if (!file) return;
    if (!file.name.endsWith('.docx') && !file.name.endsWith('.doc')) {
      alert('请上传 Word 文档格式（.docx 文件）');
      return;
    }

    setUploadFileName(file.name);
    setIsParsingDocx(true);
    setStatusMessage(`正在解析 Word 文档：${file.name}...`);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const bytes = new Uint8Array(arrayBuffer);
        let binary = '';
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64 = btoa(binary);

        const res = await fetch('/api/parse-docx', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64 })
        });

        const data = await res.json();
        if (data.error) {
          throw new Error(data.error);
        }

        if (Array.isArray(data.pairs) && data.pairs.length > 0) {
          const pairs: BilingualPair[] = data.pairs.map((p: any, idx: number) => ({
            id: p.id || `pair-${Date.now()}-${idx + 1}`,
            pairIndex: idx + 1,
            chinese: p.chinese || '',
            english: p.english || '',
            annotatedEnglish: '',
            detectedTerms: [],
            status: 'pending'
          }));

          onLoadPairs(pairs, file.name);
          setStatusMessage(`成功从文档解析提取出 ${pairs.length} 个汉英对齐句对！`);
        } else {
          setStatusMessage('未能从文档中自动对齐句对，已载入原始文本供手动校准。');
        }
        setIsParsingDocx(false);
      };

      reader.readAsArrayBuffer(file);
    } catch (err: any) {
      console.error('File parsing failed:', err);
      setStatusMessage(`解析文档失败: ${err.message}`);
      setIsParsingDocx(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const normalizeNaTags = (text: string) => {
    if (!text) return '';
    return text
      .replace(/＜\s*Na\s*＞/gi, '<Na>')
      .replace(/＜\s*\/\s*Na\s*＞/gi, '</Na>')
      .replace(/<\s*Na\s*>/gi, '<Na>')
      .replace(/<\s*\/\s*Na\s*>/gi, '</Na>')
      .replace(/＜\s*NA\s*＞/gi, '<Na>')
      .replace(/＜\s*\/\s*NA\s*＞/gi, '</Na>')
      .replace(/<\s*NA\s*>/gi, '<Na>')
      .replace(/<\s*\/\s*NA\s*>/gi, '</Na>');
  };

  const handlePasteSubmit = () => {
    if (!pastedText.trim()) return;

    const cleanText = normalizeNaTags(pastedText);

    const lines = cleanText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const pairs: BilingualPair[] = [];
    let pairIdx = 1;

    for (let i = 0; i < lines.length; i += 2) {
      const zh = lines[i] || '';
      const en = lines[i + 1] || '';
      pairs.push({
        id: `paste-pair-${pairIdx}`,
        pairIndex: pairIdx,
        chinese: zh,
        english: en,
        annotatedEnglish: '',
        detectedTerms: [],
        status: 'pending'
      });
      pairIdx++;
    }

    onLoadPairs(pairs, '粘贴双语文本');
    setStatusMessage(`成功导入 ${pairs.length} 个句对！`);
  };

  return (
    <div id="corpus-input-panel" className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-5 shadow-xs">
      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <button
            id="tab-samples"
            type="button"
            onClick={() => setActiveTab('samples')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'samples'
                ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            经典语料库样例
          </button>

          <button
            id="tab-upload"
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'upload'
                ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            上传 Word 文档 (.docx)
          </button>

          <button
            id="tab-paste"
            type="button"
            onClick={() => setActiveTab('paste')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'paste'
                ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            手动粘贴 / 录入
          </button>
        </div>

        {totalPairs > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500 dark:text-stone-400 hidden sm:inline">
              已载入: <span className="font-bold text-stone-800 dark:text-stone-200">{totalPairs}</span> 句对
              {naPairsCount > 0 && (
                <span className="ml-1 text-indigo-700 dark:text-indigo-300 font-semibold bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800" title={`已自动定位 ${naPairsCount} 个包含 <Na> 标签的目标句对，共包含 ${naTermsCount || naPairsCount} 个数字式缩略语实体`}>
                  🎯 锁定 {naPairsCount} 个&lt;Na&gt;重点句 {naTermsCount > naPairsCount ? `(共${naTermsCount}项缩略语)` : ''}
                </span>
              )}
              {annotatedPairsCount > 0 && (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold ml-1">
                  ({annotatedPairsCount} 已标注)
                </span>
              )}
            </span>

            {/* Clear / Reset Trigger */}
            <button
              id="btn-open-clear-modal-panel"
              type="button"
              onClick={onOpenClearModal}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 hover:bg-red-50 dark:hover:bg-red-950/40 text-stone-600 hover:text-red-600 dark:text-stone-400 dark:hover:text-red-400 text-xs font-medium transition-colors"
              title="清空或重置上次处理数据"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">清空/重置数据</span>
            </button>

            <button
              id="btn-start-annotation-top"
              type="button"
              disabled={isAnnotating}
              onClick={onStartAnnotation}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
              title={naPairsCount > 0 ? `定向识别 ${naPairsCount} 个含 <Na> 标签重点句对（共 ${naTermsCount || naPairsCount} 项缩略语）及其相邻英文译文，自动跳过其余非目标句以节省算力` : '执行全量双语技巧标注'}
            >
              {isAnnotating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  定向识别中...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  {naPairsCount > 0 ? `定向识别 (${naPairsCount}句 · ${naTermsCount || naPairsCount}项缩略语)` : '一键执行标注'}
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Tab Content 1: Samples */}
      {activeTab === 'samples' && (
        <div className="space-y-3">
          <p className="text-xs text-stone-500 dark:text-stone-400">
            选择内置的研究样例数据集进行标注演示与技巧校验：
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {SAMPLE_CORPORA.map((corpus) => (
              <div
                key={corpus.id}
                id={`corpus-card-${corpus.id}`}
                className="border border-stone-200 dark:border-stone-800 rounded-lg p-3.5 hover:border-stone-400 dark:hover:border-stone-600 bg-stone-50/50 dark:bg-stone-950/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      {corpus.name}
                    </h4>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-mono">
                      {corpus.pairs.length} 句对
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-1">
                    {corpus.description}
                  </p>
                </div>
                <div className="mt-3 pt-2 flex items-center justify-end">
                  <button
                    id={`btn-load-corpus-${corpus.id}`}
                    type="button"
                    onClick={() => {
                      onLoadPairs(corpus.pairs, corpus.name);
                      setStatusMessage(`已载入「${corpus.name}」(${corpus.pairs.length} 句对)`);
                    }}
                    className="text-xs px-3 py-1 rounded-md bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 font-medium transition-colors"
                  >
                    载入此语料库
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content 2: Upload Word (.docx) */}
      {activeTab === 'upload' && (
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFile(e.target.files[0]);
              }
            }}
            accept=".docx,.doc"
            className="hidden"
          />

          <div
            id="docx-dropzone"
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              isDragging
                ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-950/20'
                : 'border-stone-300 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-600 bg-stone-50/40 dark:bg-stone-950/30'
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
              {isParsingDocx ? '正在解析 Word 文档...' : '拖拽中英对照 Word 文档 (.docx) 到此处，或点击选择文件'}
            </h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-md mx-auto">
              支持段落上下对照（第一段中文、第二段英文）或表格对齐的 Word 文档，系统将自动对齐句对并支持标注导出。
            </p>
            {uploadFileName && (
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded bg-stone-200 dark:bg-stone-800 text-xs text-stone-800 dark:text-stone-200 font-mono">
                <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                已选择: {uploadFileName}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Content 3: Text Paste */}
      {activeTab === 'paste' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-stone-500 dark:text-stone-400">
              在下方粘贴中英上下对照文本（奇数行中文，偶数行英文）：
            </p>
            <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400">
              提示：中文句可包含 &lt;Na&gt;缩略语&lt;/Na&gt; 标注
            </span>
          </div>
          <textarea
            id="textarea-bilingual-paste"
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            rows={6}
            placeholder={`示例格式：
我们要统筹推进<Na>两重</Na>建设，加快构建现代化基础设施体系。
We need to coordinate the implementation of the "two majors" (major national strategies and security capacity in key areas) and accelerate the construction of a modern infrastructure system.
我们要扎实推进<Na>三大平台</Na>建设。
We must make solid progress in the construction of Three Platforms.
统筹做好<Na>三农</Na>各项工作。
We must coordinate efforts on agriculture, rural areas, and farmers.`}
            className="w-full text-xs font-mono p-3 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-stone-100 resize-y"
          />
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setPastedText('')}
              className="text-xs text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"
            >
              清空输入
            </button>
            <button
              id="btn-confirm-paste"
              type="button"
              onClick={handlePasteSubmit}
              disabled={!pastedText.trim()}
              className="px-4 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200 text-xs font-semibold disabled:opacity-40 transition-colors"
            >
              解析并导入句对
            </button>
          </div>
        </div>
      )}

      {statusMessage && (
        <div className="mt-3 p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-blue-800 dark:text-blue-300 text-xs flex items-center justify-between">
          <span>{statusMessage}</span>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-blue-500 hover:text-blue-700 font-bold ml-2"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};
