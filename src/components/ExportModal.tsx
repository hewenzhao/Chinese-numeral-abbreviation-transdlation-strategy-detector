import React, { useState, useEffect } from 'react';
import { BilingualPair, ExportDocxOptions, TargetLanguage, TARGET_LANGUAGES } from '../types';
import {
  getBaseFileName,
  generateDocxExportFileName,
  getTimestampString
} from '../utils/fileUtils';
import {
  Download,
  FileText,
  Check,
  Copy,
  X,
  FileCheck2,
  Settings,
  Sparkles,
  Layers,
  Table,
  FileCode,
  Tag,
  Languages
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  pairs: BilingualPair[];
  sourceFileName?: string;
  targetLanguage?: TargetLanguage;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  pairs,
  sourceFileName,
  targetLanguage = 'en'
}) => {
  const langInfo = TARGET_LANGUAGES[targetLanguage] || TARGET_LANGUAGES.en;
  const baseName = getBaseFileName(sourceFileName, '数字缩略语语料');

  const [title, setTitle] = useState(`${baseName} - ${langInfo.pairName}双语数字式缩略语翻译技巧标注交付文档`);
  const [exportFileName, setExportFileName] = useState('');
  const [layout, setLayout] = useState<'top-bottom' | 'table'>('top-bottom');
  const [includeGuide, setIncludeGuide] = useState(true);
  const [includeStats, setIncludeStats] = useState(true);
  const [colorHighlight, setColorHighlight] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync default file name whenever modal opens or sourceFileName changes
  useEffect(() => {
    if (isOpen) {
      const generated = generateDocxExportFileName(sourceFileName, `Natrans_${langInfo.code.toUpperCase()}_标注交付文档`);
      setExportFileName(generated);
      setTitle(`${baseName} - ${langInfo.pairName}双语数字式缩略语翻译技巧标注交付文档`);
    }
  }, [isOpen, sourceFileName, baseName, langInfo]);

  if (!isOpen) return null;

  // Ensure fileName has .docx suffix
  const getResolvedFileName = () => {
    let clean = (exportFileName || '').trim();
    if (!clean) {
      clean = generateDocxExportFileName(sourceFileName, 'Natrans标注交付文档');
    }
    if (!clean.toLowerCase().endsWith('.docx')) {
      clean = `${clean}.docx`;
    }
    return clean;
  };

  const handleDownloadDocx = async () => {
    setIsExporting(true);
    setErrorMsg(null);

    const finalFileName = getResolvedFileName();

    try {
      const options: ExportDocxOptions = {
        title,
        sourceFileName,
        exportFileName: finalFileName,
        layout,
        includeClassificationGuide: includeGuide,
        includeStatsTable: includeStats,
        includeHeaderSummary: true,
        colorHighlight,
        targetLanguage
      };

      const res = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pairs, options })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || '导出失败');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = finalFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setIsExporting(false);
    } catch (err: any) {
      console.error('Download error:', err);
      setErrorMsg(err.message || '导出 Word 文档失败');
      setIsExporting(false);
    }
  };

  const handleCopyText = () => {
    const textLines = pairs.map((p, idx) => {
      const zh = `[${idx + 1}] [ZH] ${p.chinese}`;
      const en = `    [EN] ${p.annotatedEnglish || p.english}`;
      return `${zh}\n${en}\n`;
    });

    const fullText = textLines.join('\n');
    navigator.clipboard.writeText(fullText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const applyFileNamePreset = (type: 'default' | 'academic' | 'english') => {
    const ts = getTimestampString();
    if (type === 'default') {
      setExportFileName(`${baseName}_Natrans标注交付文档_${ts}.docx`);
    } else if (type === 'academic') {
      setExportFileName(`${baseName}_英译技巧标注结果.docx`);
    } else {
      setExportFileName(`Natrans_${baseName}_Annotated_${ts}.docx`);
    }
  };

  return (
    <div id="export-docx-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150 overflow-y-auto">
      <div id="export-docx-modal-content" className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl max-w-xl w-full p-6 shadow-xl relative overflow-hidden my-6">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Word 文档交付与结果导出 (.docx)
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              自动将提交文件的名称作为导出文件名前缀，生成标准的学术排版 Word 交付文档
            </p>
          </div>
        </div>

        {/* Source File Badge */}
        <div className="bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 rounded-xl p-3 mb-4 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-blue-800 dark:text-blue-300">
                📄 关联提交源文件：
              </span>
              <span className="font-mono font-bold text-stone-900 dark:text-stone-100 bg-white dark:bg-stone-900 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                {sourceFileName || '数字缩略语语料'}
              </span>
            </div>
            <span className="text-[11px] text-blue-700 dark:text-blue-400 font-medium">
              提取主体：<strong className="font-mono">{baseName}</strong>
            </span>
          </div>
        </div>

        {/* Settings Form */}
        <div className="space-y-4 text-xs">
          {/* Export File Name (incorporating submitted file name) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-bold text-stone-800 dark:text-stone-200">
                导出文件名 (包含提交文件名)：
              </label>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-stone-400 mr-1">快捷命名:</span>
                <button
                  type="button"
                  onClick={() => applyFileNamePreset('default')}
                  className="px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-[10px] text-stone-600 dark:text-stone-300 font-mono"
                  title="包含原文件名+交付文档+时间戳"
                >
                  原名+交付文档
                </button>
                <button
                  type="button"
                  onClick={() => applyFileNamePreset('academic')}
                  className="px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-[10px] text-stone-600 dark:text-stone-300 font-mono"
                  title="简短标注结果"
                >
                  原名+标注结果
                </button>
                <button
                  type="button"
                  onClick={() => applyFileNamePreset('english')}
                  className="px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-[10px] text-stone-600 dark:text-stone-300 font-mono"
                  title="Natrans前缀+原名"
                >
                  Natrans_原名
                </button>
              </div>
            </div>
            <div className="relative">
              <input
                type="text"
                value={exportFileName}
                onChange={(e) => setExportFileName(e.target.value)}
                placeholder={`${baseName}_Natrans标注交付文档.docx`}
                className="w-full p-2.5 rounded-lg border border-blue-300 dark:border-blue-700 bg-blue-50/30 dark:bg-blue-950/20 text-stone-900 dark:text-stone-100 font-mono text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
              下载时将以该文件名保存，自动保留提交文件的核心标识。
            </p>
          </div>

          {/* Document Title */}
          <div>
            <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
              Word 文档内部排版主标题：
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:ring-1 focus:ring-stone-900 dark:focus:ring-stone-100"
            />
          </div>

          {/* Layout Options */}
          <div>
            <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1.5">
              双语对齐排版样式：
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`p-3 rounded-lg border cursor-pointer flex items-center gap-2.5 transition-all ${
                  layout === 'top-bottom'
                    ? 'border-stone-900 dark:border-stone-100 bg-stone-50 dark:bg-stone-800'
                    : 'border-stone-200 dark:border-stone-800 hover:border-stone-300'
                }`}
              >
                <input
                  type="radio"
                  name="layout"
                  checked={layout === 'top-bottom'}
                  onChange={() => setLayout('top-bottom')}
                  className="text-stone-900"
                />
                <div>
                  <div className="font-bold text-stone-900 dark:text-stone-100">上下段落对照 (推荐)</div>
                  <div className="text-[11px] text-stone-500">第一段中文，第二段英文标注</div>
                </div>
              </label>

              <label
                className={`p-3 rounded-lg border cursor-pointer flex items-center gap-2.5 transition-all ${
                  layout === 'table'
                    ? 'border-stone-900 dark:border-stone-100 bg-stone-50 dark:bg-stone-800'
                    : 'border-stone-200 dark:border-stone-800 hover:border-stone-300'
                }`}
              >
                <input
                  type="radio"
                  name="layout"
                  checked={layout === 'table'}
                  onChange={() => setLayout('table')}
                  className="text-stone-900"
                />
                <div>
                  <div className="font-bold text-stone-900 dark:text-stone-100">双栏表格对照</div>
                  <div className="text-[11px] text-stone-500">左右两列对应显示中文与英文</div>
                </div>
              </label>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-2 pt-2 border-t border-stone-200 dark:border-stone-800">
            <label className="flex items-center gap-2 text-stone-700 dark:text-stone-300 cursor-pointer">
              <input
                type="checkbox"
                checked={includeGuide}
                onChange={(e) => setIncludeGuide(e.target.checked)}
                className="rounded border-stone-300"
              />
              <span>在文档开头包含「四类翻译技巧规范说明表」</span>
            </label>

            <label className="flex items-center gap-2 text-stone-700 dark:text-stone-300 cursor-pointer">
              <input
                type="checkbox"
                checked={includeStats}
                onChange={(e) => setIncludeStats(e.target.checked)}
                className="rounded border-stone-300"
              />
              <span>在文档末尾包含「技巧出现频次统计与术语清单」</span>
            </label>

            <label className="flex items-center gap-2 text-stone-700 dark:text-stone-300 cursor-pointer">
              <input
                type="checkbox"
                checked={colorHighlight}
                onChange={(e) => setColorHighlight(e.target.checked)}
                className="rounded border-stone-300"
              />
              <span>在 Word 中对 &lt;Na&gt; 中文缩略语及 &lt;Natrans-X&gt; 译文标签添加学术彩色底纹高亮</span>
            </label>
          </div>
        </div>

        {errorMsg && (
          <div className="mt-3 p-2.5 rounded-lg bg-red-50 text-red-700 text-xs">
            {errorMsg}
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <button
            type="button"
            onClick={handleCopyText}
            className="px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                已复制纯文本
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                复制带标签纯文本
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-medium transition-colors"
            >
              取消
            </button>
            <button
              id="btn-download-docx-confirm"
              type="button"
              disabled={isExporting || pairs.length === 0}
              onClick={handleDownloadDocx}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm disabled:opacity-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              {isExporting ? '正在生成 Word 文档...' : '生成并下载 Word 交付文档 (.docx)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
