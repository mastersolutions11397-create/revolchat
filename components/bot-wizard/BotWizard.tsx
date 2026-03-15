"use client";

import { useState, useCallback, useRef } from "react";
import {
  Bot,
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
  Send,
  ImagePlus,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import {
  agentsAPI,
  type AgentModel,
  type TelegramBotInfo,
  type CreateAgentBody,
} from "@/lib/api/agents";

type WizardStep = "knowledge" | "platform" | "telegram" | "profile" | "review";

const STEPS: { id: WizardStep; label: string }[] = [
  { id: "knowledge", label: "Knowledge Base" },
  { id: "platform", label: "Platform" },
  { id: "telegram", label: "Telegram Setup" },
  { id: "profile", label: "Profile Picture" },
  { id: "review", label: "Review & Create" },
];

const MODEL_PROVIDERS: AgentModel[] = ["openai", "deepseek", "gemini"];

const MODEL_IDS_BY_PROVIDER: Record<AgentModel, string[]> = {
  openai: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-4", "gpt-3.5-turbo"],
  deepseek: ["deepseek-chat", "deepseek-reasoner"],
  gemini: ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-pro"],
};

const MODEL_LABELS: Record<string, string> = {
  "deepseek-chat": "DeepSeek-V3.2 (Non-thinking Mode)",
  "deepseek-reasoner": "DeepSeek-V3.2 (Thinking Mode)",
};

interface BotWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  userId?: string;
}

export default function BotWizard({
  isOpen,
  onClose,
  onCreated,
  userId,
}: BotWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>("knowledge");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Knowledge base state
  const [botName, setBotName] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [modelProvider, setModelProvider] = useState<AgentModel>("openai");
  const [modelId, setModelId] = useState(MODEL_IDS_BY_PROVIDER.openai[0] ?? "");
  const [apiKey, setApiKey] = useState("");

  // Platform state
  const [selectedPlatform, setSelectedPlatform] = useState<"telegram" | null>(
    "telegram"
  );

  // Telegram state
  const [telegramToken, setTelegramToken] = useState("");
  const [telegramValidating, setTelegramValidating] = useState(false);
  const [telegramBotInfo, setTelegramBotInfo] =
    useState<TelegramBotInfo | null>(null);
  const [telegramError, setTelegramError] = useState<string | null>(null);

  // Profile picture state
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(
    null
  );
  const [profilePicturePreview, setProfilePicturePreview] = useState<
    string | null
  >(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = useCallback(() => {
    setCurrentStep("knowledge");
    setBotName("");
    setSystemPrompt("");
    setModelProvider("openai");
    setModelId(MODEL_IDS_BY_PROVIDER.openai[0] ?? "");
    setApiKey("");
    setSelectedPlatform("telegram");
    setTelegramToken("");
    setTelegramBotInfo(null);
    setTelegramError(null);
    setProfilePictureFile(null);
    setProfilePicturePreview(null);
    setError(null);
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const getCurrentStepIndex = () =>
    STEPS.findIndex((s) => s.id === currentStep);

  const canGoNext = useCallback(() => {
    switch (currentStep) {
      case "knowledge":
        return systemPrompt.trim().length > 0 && apiKey.trim().length > 0;
      case "platform":
        return selectedPlatform !== null;
      case "telegram":
        return telegramBotInfo !== null;
      case "profile":
        return true; // Profile picture is optional
      case "review":
        return true;
      default:
        return false;
    }
  }, [currentStep, systemPrompt, apiKey, selectedPlatform, telegramBotInfo]);

  const goToNextStep = useCallback(() => {
    const idx = getCurrentStepIndex();
    if (idx < STEPS.length - 1) {
      setCurrentStep(STEPS[idx + 1].id);
    }
  }, [currentStep]);

  const goToPreviousStep = useCallback(() => {
    const idx = getCurrentStepIndex();
    if (idx > 0) {
      setCurrentStep(STEPS[idx - 1].id);
    }
  }, [currentStep]);

  const validateTelegramToken = useCallback(async () => {
    if (!telegramToken.trim()) {
      setTelegramError("Please enter a bot token");
      return;
    }

    setTelegramValidating(true);
    setTelegramError(null);
    setTelegramBotInfo(null);

    try {
      const result = await agentsAPI.validateTelegramToken(telegramToken.trim());
      if (result.valid && result.bot_info) {
        setTelegramBotInfo(result.bot_info);
      } else {
        setTelegramError(result.error || "Invalid token");
      }
    } catch (err) {
      setTelegramError(
        err instanceof Error ? err.message : "Failed to validate token"
      );
    } finally {
      setTelegramValidating(false);
    }
  }, [telegramToken]);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          setError("File too large. Max 5MB allowed.");
          return;
        }
        setProfilePictureFile(file);
        const reader = new FileReader();
        reader.onload = () => {
          setProfilePicturePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    []
  );

  const handleCreate = useCallback(async () => {
    setIsCreating(true);
    setError(null);

    try {
      // Create the agent/bot in our database (webhook is auto-registered by /api/bots)
      const body: CreateAgentBody = {
        name: botName.trim() || "Unnamed Bot",
        model: modelProvider,
        model_id: modelId || null,
        system_prompt: systemPrompt.trim(),
        api_key: apiKey.trim(),
        telegram_bot_token: telegramToken.trim() || undefined,
        telegram_username: telegramBotInfo?.username || undefined,
        telegram_first_name: telegramBotInfo?.first_name || undefined,
        user_id: userId,
      };

      const createdAgent = await agentsAPI.create(body);

      // Step 3: Upload profile picture if selected
      if (profilePictureFile && createdAgent.id) {
        try {
          await agentsAPI.uploadProfilePicture(
            createdAgent.id,
            profilePictureFile
          );
        } catch (picErr) {
          console.error("Failed to upload profile picture:", picErr);
          // Don't fail the whole creation, just log the error
        }
      }

      onCreated();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create bot");
    } finally {
      setIsCreating(false);
    }
  }, [
    botName,
    modelProvider,
    modelId,
    systemPrompt,
    apiKey,
    telegramToken,
    telegramBotInfo,
    profilePictureFile,
    userId,
    onCreated,
    handleClose,
  ]);

  if (!isOpen) return null;

  const stepIndex = getCurrentStepIndex();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-h-[90vh] max-w-3xl overflow-hidden rounded-2xl border border-white/20 bg-white shadow-2xl ring-1 ring-black/5 animate-in zoom-in-95 duration-200 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-dashboard-border bg-gradient-to-r from-teal-primary/5 to-transparent px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-primary/10 text-teal-primary shadow-sm">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Create Bot</h3>
              <p className="text-xs text-slate-500">
                Step {stepIndex + 1} of {STEPS.length}:{" "}
                {STEPS[stepIndex]?.label}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="flex gap-1 px-6 py-3 bg-slate-50">
          {STEPS.map((step, idx) => (
            <div
              key={step.id}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                idx <= stepIndex ? "bg-teal-primary" : "bg-slate-200"
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-xs font-medium text-red-600 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {/* Step 1: Knowledge Base */}
          {currentStep === "knowledge" && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Bot Name (optional)
                </label>
                <input
                  type="text"
                  value={botName}
                  onChange={(e) => setBotName(e.target.value)}
                  placeholder="e.g. Support Bot, Sales Assistant"
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-dashboard-border rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-primary/20 focus:border-teal-primary transition-all placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  System Prompt <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="You are a helpful assistant that..."
                  rows={6}
                  className="w-full px-4 py-3 text-sm bg-slate-50 border border-dashboard-border rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-primary/20 focus:border-teal-primary transition-all resize-none placeholder:text-slate-400"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Define your bot&apos;s personality and behavior
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Provider
                  </label>
                  <select
                    value={modelProvider}
                    onChange={(e) => {
                      const next = e.target.value as AgentModel;
                      setModelProvider(next);
                      setModelId(MODEL_IDS_BY_PROVIDER[next]?.[0] ?? "");
                    }}
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-dashboard-border rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-primary/20 focus:border-teal-primary transition-all"
                  >
                    {MODEL_PROVIDERS.map((m) => (
                      <option key={m} value={m}>
                        {m.charAt(0).toUpperCase() + m.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Model
                  </label>
                  <select
                    value={modelId}
                    onChange={(e) => setModelId(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-dashboard-border rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-primary/20 focus:border-teal-primary transition-all"
                  >
                    {MODEL_IDS_BY_PROVIDER[modelProvider]?.map((id) => (
                      <option key={id} value={id}>
                        {MODEL_LABELS[id] ?? id}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  API Key <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-... or your provider API key"
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-dashboard-border rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-primary/20 focus:border-teal-primary transition-all placeholder:text-slate-400"
                  autoComplete="off"
                />
              </div>
            </div>
          )}

          {/* Step 2: Platform Selection */}
          {currentStep === "platform" && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 mb-4">
                Select where you want to deploy your bot
              </p>

              <button
                type="button"
                onClick={() => setSelectedPlatform("telegram")}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                  selectedPlatform === "telegram"
                    ? "border-teal-primary bg-teal-primary/5"
                    : "border-dashboard-border hover:border-teal-primary/50"
                }`}
              >
                <div className="h-12 w-12 rounded-xl bg-[#0088cc]/10 flex items-center justify-center">
                  <Image
                    src="/yetti/telegram_logo.png"
                    alt="Telegram"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-slate-900">Telegram</p>
                  <p className="text-sm text-slate-500">
                    Connect to Telegram Bot API
                  </p>
                </div>
                {selectedPlatform === "telegram" && (
                  <Check className="h-5 w-5 text-teal-primary" />
                )}
              </button>

              {/* Coming soon platforms */}
              <div className="opacity-50 pointer-events-none">
                <div className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-dashboard-border">
                  <div className="h-12 w-12 rounded-xl bg-pink-100 flex items-center justify-center text-2xl">
                    📸
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-slate-900">Instagram</p>
                    <p className="text-sm text-slate-500">Coming soon</p>
                  </div>
                </div>
              </div>

              <div className="opacity-50 pointer-events-none">
                <div className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-dashboard-border">
                  <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center text-2xl">
                    💬
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-slate-900">WhatsApp</p>
                    <p className="text-sm text-slate-500">Coming soon</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Telegram Setup */}
          {currentStep === "telegram" && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Telegram Bot Token <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={telegramToken}
                    onChange={(e) => {
                      setTelegramToken(e.target.value);
                      setTelegramBotInfo(null);
                      setTelegramError(null);
                    }}
                    placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                    className="flex-1 px-4 py-2.5 text-sm bg-slate-50 border border-dashboard-border rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-primary/20 focus:border-teal-primary transition-all placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={validateTelegramToken}
                    disabled={telegramValidating || !telegramToken.trim()}
                    className="px-4 py-2.5 bg-teal-primary text-white text-sm font-semibold rounded-xl hover:bg-teal-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {telegramValidating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Validating
                      </>
                    ) : (
                      "Validate"
                    )}
                  </button>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Get your token from{" "}
                  <a
                    href="https://t.me/BotFather"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-primary hover:underline font-medium"
                  >
                    @BotFather
                  </a>{" "}
                  on Telegram
                </p>
              </div>

              {telegramError && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {telegramError}
                </div>
              )}

              {telegramBotInfo && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-2xl">
                      🤖
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                        Bot Verified
                      </p>
                      <p className="text-lg font-bold text-slate-900">
                        @{telegramBotInfo.username}
                      </p>
                      <p className="text-sm text-slate-600">
                        {telegramBotInfo.first_name}
                      </p>
                    </div>
                    <Check className="ml-auto h-6 w-6 text-emerald-500" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Profile Picture */}
          {currentStep === "profile" && (
            <div className="space-y-5">
              <p className="text-sm text-slate-600">
                Upload a profile picture for your bot. This will be synced to
                Telegram automatically.
              </p>

              <div className="flex flex-col items-center gap-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative h-32 w-32 rounded-full border-2 border-dashed border-dashboard-border bg-slate-50 flex items-center justify-center cursor-pointer hover:border-teal-primary hover:bg-teal-primary/5 transition-all group"
                >
                  {profilePicturePreview ? (
                    <Image
                      src={profilePicturePreview}
                      alt="Profile preview"
                      fill
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <ImagePlus className="h-8 w-8 text-slate-400 group-hover:text-teal-primary transition-colors" />
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 text-sm font-medium text-teal-primary hover:bg-teal-primary/10 rounded-lg transition-colors"
                >
                  {profilePicturePreview ? "Change Picture" : "Upload Picture"}
                </button>

                {profilePictureFile && (
                  <p className="text-xs text-slate-500">
                    {profilePictureFile.name} (
                    {(profilePictureFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}

                <p className="text-xs text-slate-500 text-center">
                  Supported formats: JPEG, PNG, WebP, GIF. Max 5MB.
                </p>
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === "review" && (
            <div className="space-y-5">
              <p className="text-sm text-slate-600 mb-4">
                Review your bot configuration before creating
              </p>

              <div className="space-y-4">
                {/* Bot preview card */}
                <div className="p-4 bg-slate-50 rounded-xl border border-dashboard-border">
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 rounded-full bg-teal-primary/10 flex items-center justify-center overflow-hidden">
                      {profilePicturePreview ? (
                        <Image
                          src={profilePicturePreview}
                          alt="Bot"
                          width={64}
                          height={64}
                          className="object-cover"
                        />
                      ) : (
                        <Bot className="h-8 w-8 text-teal-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900">
                        {botName || "Unnamed Bot"}
                      </h4>
                      {telegramBotInfo && (
                        <p className="text-sm text-teal-primary font-medium">
                          @{telegramBotInfo.username}
                        </p>
                      )}
                      <p className="text-xs text-slate-500 mt-1">
                        {MODEL_LABELS[modelId] ?? modelId ?? modelProvider}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid gap-3">
                  <div className="flex justify-between items-start p-3 bg-white rounded-lg border border-dashboard-border">
                    <span className="text-xs font-semibold text-slate-500 uppercase">
                      System Prompt
                    </span>
                    <span className="text-sm text-slate-900 text-right max-w-[70%] line-clamp-2">
                      {systemPrompt.slice(0, 100)}
                      {systemPrompt.length > 100 ? "..." : ""}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-dashboard-border">
                    <span className="text-xs font-semibold text-slate-500 uppercase">
                      Platform
                    </span>
                    <span className="text-sm text-slate-900 flex items-center gap-2">
                      <Send className="h-4 w-4 text-[#0088cc]" />
                      Telegram
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-dashboard-border">
                    <span className="text-xs font-semibold text-slate-500 uppercase">
                      API Key
                    </span>
                    <span className="text-sm text-slate-900 font-mono">
                      {apiKey.slice(0, 4)}••••••••{apiKey.slice(-4)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-dashboard-border">
                    <span className="text-xs font-semibold text-slate-500 uppercase">
                      Profile Picture
                    </span>
                    <span className="text-sm text-slate-900">
                      {profilePictureFile ? "Uploaded" : "None"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-dashboard-border px-6 py-4 bg-slate-50">
          <button
            type="button"
            onClick={goToPreviousStep}
            disabled={stepIndex === 0 || isCreating}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isCreating}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>

            {currentStep === "review" ? (
              <button
                type="button"
                onClick={handleCreate}
                disabled={isCreating}
                className="px-6 py-2 bg-teal-primary text-white text-sm font-bold rounded-xl hover:bg-teal-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Create Bot
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={goToNextStep}
                disabled={!canGoNext()}
                className="px-6 py-2 bg-teal-primary text-white text-sm font-bold rounded-xl hover:bg-teal-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
