import React, { useState } from 'react';
import {
  X,
  Cpu,
  Zap,
  Sliders,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  KeyRound,
  ShieldCheck,
  Activity,
  Layers,
  Settings2,
  HelpCircle,
  ChevronRight,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Languages
} from 'lucide-react';
import {
  AIConfig,
  AVAILABLE_MODELS,
  DEFAULT_AI_CONFIG,
  ModelPreset,
  AIProvider,
  TargetLanguage,
  TARGET_LANGUAGES
} from '../types';

interface AIConfigModalProps {
  isOpen: boolean;
  config: AIConfig;
  onClose: () => void;
  onSave: (newConfig: AIConfig) => void;
}

export const AIConfigModal: React.FC<AIConfigModalProps> = ({
  isOpen,
  config,
  onClose,
  onSave
}) => {
  const [localConfig, setLocalConfig] = useState<AIConfig>({ ...config });
  const [showApiKey, setShowApiKey] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'zhipu' | 'qwen' | 'deepseek' | 'gemini'>('all');
  const [testStatus, setTestStatus] = useState<{
    loading: boolean;
    success?: boolean;
    latencyMs?: number;
    message?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleModelChange = (modelPreset: ModelPreset) => {
    setLocalConfig((prev) => ({
      ...prev,
      model: modelPreset.id,
      provider: modelPreset.provider,
      baseUrl:
        modelPreset.baseUrl ||
        (modelPreset.id.startsWith('glm')
          ? 'https://open.bigmodel.cn/api/paas/v4'
          : modelPreset.id.startsWith('qwen')
          ? 'https://llm-an182rqwrbwslp1n.cn-beijing.maas.aliyuncs.com/compatible-mode/v1'
          : modelPreset.provider === 'openai_compatible'
          ? 'https://api.deepseek.com'
          : '')
    }));
    setTestStatus(null);
  };

  const handleTestConnection = async () => {
    setTestStatus({ loading: true });
    try {
      const res = await fetch('/api/ai/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aiConfig: localConfig,
          targetLanguage: localConfig.targetLanguage || 'en'
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestStatus({
          loading: false,
          success: true,
          latencyMs: data.latencyMs,
          message: data.message || `API 连通测试成功！响应耗时 ${data.latencyMs}ms。`
        });
      } else {
        setTestStatus({
          loading: false,
          success: false,
          latencyMs: data.latencyMs,
          message: data.error || data.message || 'API 连通测试失败，请检查 API Key、Base URL 或网络状态。'
        });
      }
    } catch (err: any) {
      setTestStatus({
        loading: false,
        success: false,
        message: `网络连接异常: ${err.message || '无法访问后端服务'}`
      });
    }
  };

  const handleSaveAndApply = () => {
    onSave(localConfig);
    onClose();
  };

  const handleResetDefaults = () => {
    setLocalConfig({ ...DEFAULT_AI_CONFIG });
    setTestStatus(null);
  };

  const activePreset = AVAILABLE_MODELS.find((m) => m.id === localConfig.model) || AVAILABLE_MODELS[0];
  const isCurrentZhipu =
    localConfig.model.startsWith('glm') ||
    (localConfig.baseUrl && (localConfig.baseUrl.includes('bigmodel.cn') || localConfig.baseUrl.includes('zhipu')));
  const isCurrentQwen =
    !isCurrentZhipu &&
    (localConfig.model.startsWith('qwen') ||
      (localConfig.baseUrl && (localConfig.baseUrl.includes('aliyuncs.com') || localConfig.baseUrl.includes('dashscope'))));
  const isCurrentDeepSeek =
    !isCurrentZhipu &&
    !isCurrentQwen &&
    (localConfig.model.startsWith('deepseek-') || (localConfig.baseUrl && localConfig.baseUrl.includes('deepseek')));
  const isCurrentOpenAICompatible =
    localConfig.provider === 'openai_compatible' ||
    isCurrentZhipu ||
    isCurrentQwen ||
    isCurrentDeepSeek ||
    (localConfig.model === 'custom' && !!localConfig.baseUrl);

  const filteredModels = AVAILABLE_MODELS.filter((m) => {
    if (activeTab === 'zhipu') return m.id.startsWith('glm') || (m.baseUrl && m.baseUrl.includes('bigmodel.cn'));
    if (activeTab === 'qwen') return m.id.startsWith('qwen') || (m.baseUrl && m.baseUrl.includes('aliyuncs.com'));
    if (activeTab === 'deepseek') return m.id.startsWith('deepseek') || (m.baseUrl && m.baseUrl.includes('deepseek.com'));
    if (activeTab === 'gemini') return m.provider === 'gemini' && !m.id.startsWith('deepseek') && !m.id.startsWith('qwen') && !m.id.startsWith('glm') && m.id !== 'custom';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/80 dark:bg-stone-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                AI 模型与接口配置 (AI Model & API Configuration)
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-mono border border-purple-200 dark:border-purple-800">
                  {localConfig.model === 'custom'
                    ? localConfig.customModelName || 'Custom Model'
                    : activePreset.name}
                </span>
                {isCurrentZhipu ? (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-medium border border-rose-200 dark:border-rose-800">
                    清华智谱 AI (OpenAI 协议)
                  </span>
                ) : isCurrentQwen ? (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-medium border border-amber-200 dark:border-amber-800">
                    Qwen / 阿里云 MaaS (OpenAI 协议)
                  </span>
                ) : isCurrentDeepSeek ? (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-medium border border-blue-200 dark:border-blue-800">
                    DeepSeek (OpenAI 协议)
                  </span>
                ) : isCurrentOpenAICompatible ? (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 font-medium border border-cyan-200 dark:border-cyan-800">
                    OpenAI 兼容协议
                  </span>
                ) : (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-medium border border-emerald-200 dark:border-emerald-800">
                    Google Gemini 官方协议
                  </span>
                )}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                支持 清华智谱AI、Qwen (通义千问)、DeepSeek 与 Google Gemini 系列模型，可自定义 Base URL 与 API Key
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-stone-700 dark:text-stone-300">
          {/* 1. Model Preset Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                选择 AI 模型底座 (Model Selection)
              </label>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                    activeTab === 'all'
                      ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs font-bold'
                      : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                  }`}
                >
                  全部
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('zhipu')}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                    activeTab === 'zhipu'
                      ? 'bg-white dark:bg-stone-900 text-rose-600 dark:text-rose-400 shadow-xs font-bold'
                      : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                  }`}
                >
                  清华智谱 (GLM)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('qwen')}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                    activeTab === 'qwen'
                      ? 'bg-white dark:bg-stone-900 text-amber-600 dark:text-amber-400 shadow-xs font-bold'
                      : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                  }`}
                >
                  通义千问 (Qwen)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('deepseek')}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                    activeTab === 'deepseek'
                      ? 'bg-white dark:bg-stone-900 text-blue-600 dark:text-blue-400 shadow-xs font-bold'
                      : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                  }`}
                >
                  DeepSeek
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('gemini')}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                    activeTab === 'gemini'
                      ? 'bg-white dark:bg-stone-900 text-purple-600 dark:text-purple-400 shadow-xs font-bold'
                      : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                  }`}
                >
                  Gemini
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredModels.map((model) => {
                const isSelected = localConfig.model === model.id;
                const isZhipuModel = model.id.startsWith('glm');
                const isQwenModel = model.id.startsWith('qwen');
                const isDeepSeek = model.id.startsWith('deepseek');
                return (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => handleModelChange(model)}
                    className={`text-left p-3.5 rounded-xl border transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? isZhipuModel
                          ? 'border-rose-600 bg-rose-50/50 dark:bg-rose-950/30 dark:border-rose-500 shadow-xs ring-1 ring-rose-600/30'
                          : isQwenModel
                          ? 'border-amber-600 bg-amber-50/50 dark:bg-amber-950/30 dark:border-amber-500 shadow-xs ring-1 ring-amber-600/30'
                          : isDeepSeek
                          ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 dark:border-blue-500 shadow-xs ring-1 ring-blue-600/30'
                          : 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/30 dark:border-purple-500 shadow-xs ring-1 ring-purple-600/30'
                        : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 bg-white dark:bg-stone-900'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="font-bold text-xs text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                          {model.name}
                          {model.recommended && (
                            <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded font-semibold">
                              推荐
                            </span>
                          )}
                        </span>
                        <span
                          className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                            isZhipuModel
                              ? 'bg-rose-100/80 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : isQwenModel
                              ? 'bg-amber-100/80 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : isDeepSeek
                              ? 'bg-blue-100/70 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                              : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                          }`}
                        >
                          {model.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">
                        {model.description}
                      </p>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-stone-200/60 dark:border-stone-800/60 flex items-center justify-between text-[11px]">
                      <span className="text-stone-600 dark:text-stone-400 font-medium">
                        {model.badge}
                      </span>
                      <div className="flex items-center gap-1">
                        {isSelected ? (
                          <CheckCircle2
                            className={`w-3.5 h-3.5 ${
                              isZhipuModel
                                ? 'text-rose-600 dark:text-rose-400'
                                : isQwenModel
                                ? 'text-amber-600 dark:text-amber-400'
                                : isDeepSeek
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-purple-600 dark:text-purple-400'
                            }`}
                          />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom Model Name Input if Selected */}
            {localConfig.model === 'custom' && (
              <div className="mt-3 p-3.5 rounded-xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/60 space-y-2">
                <label className="text-xs font-semibold text-stone-900 dark:text-stone-100 block">
                  自定义模型标识符 (Custom Model Name)
                </label>
                <input
                  type="text"
                  placeholder="例如: glm-4-plus, qwen-plus, qwen-max, deepseek-v4-flash, gpt-4o 等"
                  value={localConfig.customModelName || ''}
                  onChange={(e) =>
                    setLocalConfig((prev) => ({ ...prev, customModelName: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

                <div className="flex items-center gap-3 pt-1">
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">协议类型:</label>
                  <label className="inline-flex items-center gap-1.5 text-xs text-stone-700 dark:text-stone-300 cursor-pointer">
                    <input
                      type="radio"
                      name="providerType"
                      checked={localConfig.provider === 'openai_compatible'}
                      onChange={() =>
                        setLocalConfig((prev) => ({
                          ...prev,
                          provider: 'openai_compatible',
                          baseUrl: prev.baseUrl || 'https://open.bigmodel.cn/api/paas/v4'
                        }))
                      }
                      className="accent-rose-600"
                    />
                    OpenAI / 智谱 / Qwen / DeepSeek 兼容接口
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-xs text-stone-700 dark:text-stone-300 cursor-pointer">
                    <input
                      type="radio"
                      name="providerType"
                      checked={localConfig.provider !== 'openai_compatible'}
                      onChange={() => setLocalConfig((prev) => ({ ...prev, provider: 'gemini' }))}
                      className="accent-purple-600"
                    />
                    Google Gemini 官方协议
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* 2. Endpoint & Authentication Settings */}
          <div className="bg-stone-50 dark:bg-stone-950/60 border border-stone-200/80 dark:border-stone-800/80 rounded-xl p-4.5 space-y-3.5">
            <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              API 端点与认证配置 (Base URL & API Key)
            </h4>

            {/* Base URL (for OpenAI/Zhipu/Qwen/DeepSeek Compatible) */}
            {(isCurrentOpenAICompatible || localConfig.model === 'custom') && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="text-xs font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-blue-500" />
                    Base URL (OpenAI 兼容端点地址)
                  </label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() =>
                        setLocalConfig((prev) => ({
                          ...prev,
                          baseUrl: 'https://open.bigmodel.cn/api/paas/v4'
                        }))
                      }
                      className="text-[10px] px-2 py-0.5 rounded bg-rose-50 hover:bg-rose-100 dark:bg-rose-950 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 font-medium border border-rose-200 dark:border-rose-800 transition-colors"
                    >
                      填入智谱 AI 端点
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setLocalConfig((prev) => ({
                          ...prev,
                          baseUrl: 'https://llm-an182rqwrbwslp1n.cn-beijing.maas.aliyuncs.com/compatible-mode/v1'
                        }))
                      }
                      className="text-[10px] px-2 py-0.5 rounded bg-amber-50 hover:bg-amber-100 dark:bg-amber-950 dark:hover:bg-amber-900 text-amber-700 dark:text-amber-300 font-medium border border-amber-200 dark:border-amber-800 transition-colors"
                    >
                      填入 Qwen MaaS 端点
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setLocalConfig((prev) => ({
                          ...prev,
                          baseUrl: 'https://api.deepseek.com'
                        }))
                      }
                      className="text-[10px] px-2 py-0.5 rounded bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium border border-blue-200 dark:border-blue-800 transition-colors"
                    >
                      填入 DeepSeek 端点
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="https://open.bigmodel.cn/api/paas/v4"
                  value={localConfig.baseUrl || ''}
                  onChange={(e) =>
                    setLocalConfig((prev) => ({ ...prev, baseUrl: e.target.value }))
                  }
                  className="w-full px-3.5 py-2 text-xs font-mono rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            )}

            {/* Custom API Key Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                  自定义 API Key ({isCurrentZhipu ? '清华智谱 GLM Key' : isCurrentQwen ? 'Qwen / DashScope Key' : isCurrentDeepSeek ? 'DeepSeek Key' : isCurrentOpenAICompatible ? 'OpenAI Key' : 'Gemini Key'})
                </label>
                <span className="text-[11px] text-stone-500">
                  留空则使用服务器内置环境变量
                </span>
              </div>

              <div className="relative flex items-center">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  placeholder={
                    isCurrentZhipu
                      ? 'xxxxxxxxxxxxxxxxxxxx.xxxxxxxxxxxx (清华智谱 API Key)'
                      : isCurrentQwen
                      ? 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx (Qwen / DashScope API Key)'
                      : isCurrentDeepSeek
                      ? 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx (DeepSeek API Key)'
                      : isCurrentOpenAICompatible
                      ? 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx (OpenAI API Key)'
                      : 'AIzaSyxxxxxxxxxxxxxxxxxxxxxxx (Gemini API Key)'
                  }
                  value={localConfig.customApiKey || ''}
                  onChange={(e) =>
                    setLocalConfig((prev) => ({ ...prev, customApiKey: e.target.value }))
                  }
                  className="w-full px-3.5 py-2 pr-10 text-xs font-mono rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2.5 p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* 3. Target Language Configuration */}
          <div className="bg-stone-50 dark:bg-stone-950/60 border border-stone-200/80 dark:border-stone-800/80 rounded-xl p-4.5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider flex items-center gap-1.5">
                <Languages className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                目标语言设置 (Target Language)
              </h4>
              <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                当前目标语: {TARGET_LANGUAGES[localConfig.targetLanguage || 'en']?.name} ({TARGET_LANGUAGES[localConfig.targetLanguage || 'en']?.nativeName})
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              选择语料库对齐的目标翻译语言。系统将自动针对该语种构建专属学术 Prompt、细化四大翻译技巧学术判定依据并约束闭合标签包裹。
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 pt-1">
              {(Object.keys(TARGET_LANGUAGES) as TargetLanguage[]).map((langKey) => {
                const lang = TARGET_LANGUAGES[langKey];
                const isSelected = (localConfig.targetLanguage || 'en') === langKey;
                return (
                  <button
                    key={langKey}
                    type="button"
                    onClick={() => {
                      setLocalConfig((prev) => ({ ...prev, targetLanguage: langKey }));
                      setTestStatus(null);
                    }}
                    className={`p-2.5 rounded-lg border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 shadow-xs ring-1 ring-indigo-500/30'
                        : 'border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{lang.flag}</span>
                      <div>
                        <div className="text-xs font-bold leading-tight flex items-center gap-1">
                          {lang.name}
                          {langKey === 'en' && (
                            <span className="text-[9px] px-1 py-0.2 bg-stone-100 dark:bg-stone-800 text-stone-500 rounded">
                              原语种
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-stone-400 dark:text-stone-500 font-mono">
                          {lang.nativeName}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Inference Hyperparameters */}
          <div className="bg-stone-50 dark:bg-stone-950/60 border border-stone-200/80 dark:border-stone-800/80 rounded-xl p-4.5 space-y-4">
            <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              标注推理参数与并发调控 (Inference Settings)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Temperature */}
              <div className="bg-white dark:bg-stone-900 p-3.5 rounded-lg border border-stone-200 dark:border-stone-800">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-stone-800 dark:text-stone-200">
                    温度系数 (Temperature)
                  </label>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                    {localConfig.temperature}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={localConfig.temperature}
                  onChange={(e) =>
                    setLocalConfig((prev) => ({
                      ...prev,
                      temperature: parseFloat(e.target.value)
                    }))
                  }
                  className="w-full accent-blue-600 h-1.5 bg-stone-200 dark:bg-stone-700 rounded-lg cursor-pointer mt-2"
                />
                <div className="flex justify-between text-[10px] text-stone-400 mt-1.5">
                  <span>0.0 (绝对确定性)</span>
                  <span className="text-blue-600 font-semibold">0.1 (学术推荐)</span>
                  <span>1.0 (高发散性)</span>
                </div>
              </div>

              {/* Batch Chunk Size */}
              <div className="bg-white dark:bg-stone-900 p-3.5 rounded-lg border border-stone-200 dark:border-stone-800">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-stone-800 dark:text-stone-200">
                    单批次处理句数 (Batch Chunk Size)
                  </label>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                    {localConfig.batchSize} 句 / 批
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 mt-2">
                  {[2, 4, 6, 8].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setLocalConfig((prev) => ({ ...prev, batchSize: size }))}
                      className={`py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                        localConfig.batchSize === size
                          ? 'border-purple-600 bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300'
                          : 'border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      {size} 句
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-stone-400 mt-2">
                  控制每批次同时发送给大模型的句对量，默认 4 句兼顾速度与稳定性。
                </p>
              </div>
            </div>

            {/* Strict Exhaustive Check Toggle */}
            <div className="bg-white dark:bg-stone-900 p-3.5 rounded-lg border border-stone-200 dark:border-stone-800 flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  严格 100% 穷尽硬约束核验 (Strict Exhaustive Alignment Check)
                </span>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                  强制要求大模型返回的技巧识别结果数量与第一步已核验的 &lt;Na&gt; 实体数量严格相等。
                </p>
              </div>
              <input
                type="checkbox"
                checked={localConfig.strictExhaustiveCheck}
                onChange={(e) =>
                  setLocalConfig((prev) => ({ ...prev, strictExhaustiveCheck: e.target.checked }))
                }
                className="w-4 h-4 accent-emerald-600 rounded cursor-pointer shrink-0"
              />
            </div>
          </div>

          {/* 4. API Connection Health & Test Button */}
          <div className="bg-stone-50 dark:bg-stone-950/60 border border-stone-200/80 dark:border-stone-800/80 rounded-xl p-4.5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-600" />
                  API 连通性即时诊断 (Connection Test)
                </h4>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  发送真实测试句对验证当前所选模型与 API 端点响应状况
                </p>
              </div>

              <button
                type="button"
                disabled={testStatus?.loading}
                onClick={handleTestConnection}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-semibold transition-colors disabled:opacity-50 shrink-0"
              >
                {testStatus?.loading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>{testStatus?.loading ? '正在诊断中...' : '测试当前 API 连通性'}</span>
              </button>
            </div>

            {testStatus && !testStatus.loading && (
              <div
                className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
                  testStatus.success
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                }`}
              >
                {testStatus.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="font-bold flex items-center justify-between">
                    <span>{testStatus.success ? 'API 接口响应正常' : 'API 诊断异常'}</span>
                    {testStatus.latencyMs && (
                      <span className="font-mono text-[11px] opacity-80">
                        耗时 {testStatus.latencyMs}ms
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 opacity-90">{testStatus.message}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-900/80 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold text-stone-600 dark:text-stone-400 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>恢复学术推荐默认配置</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-300 transition-colors"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSaveAndApply}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>保存并应用 AI 配置</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
