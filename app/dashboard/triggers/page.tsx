"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { useWorkspace } from "@/lib/workspace-context";
import { triggerWordsAPI } from "@/lib/api/trigger-words";
import { agentsAPI } from "@/lib/api/agents";
import type { TriggerWord, TriggerMediaType } from "@/lib/types/chat";
import { toast } from "sonner";
import {
  Zap,
  Plus,
  Trash2,
  X,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
  Video,
  File,
  Music,
  Search,
  Edit2,
  ToggleLeft,
  ToggleRight,
  Hash,
  Upload,
  Link,
} from "lucide-react";

const MEDIA_TYPE_OPTIONS: { value: TriggerMediaType; label: string; icon: typeof ImageIcon }[] = [
  { value: "image", label: "Image", icon: ImageIcon },
  { value: "video", label: "Video", icon: Video },
  { value: "file", label: "File", icon: File },
  { value: "audio", label: "Audio", icon: Music },
];

function getMediaIcon(type: TriggerMediaType) {
  const option = MEDIA_TYPE_OPTIONS.find((o) => o.value === type);
  return option?.icon || File;
}

type BotOption = {
  id: string;
  name: string;
  telegram_username?: string | null;
};

export default function TriggersPage() {
  const { user } = useAuth();
  const { activeWorkspace } = useWorkspace();

  const [triggers, setTriggers] = useState<TriggerWord[]>([]);
  const [bots, setBots] = useState<BotOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBotFilterId, setSelectedBotFilterId] = useState("");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTrigger, setEditingTrigger] = useState<TriggerWord | null>(null);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form state
  const [triggerWord, setTriggerWord] = useState("");
  const [selectedBotId, setSelectedBotId] = useState("");
  const [description, setDescription] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState<TriggerMediaType>("image");
  const [uploadMode, setUploadMode] = useState<"upload" | "url">("upload");
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Fetch triggers
  const fetchTriggers = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      if (!activeWorkspace) {
        setTriggers([]);
        setBots([]);
        return;
      }
      const [triggerData, botsResponse] = await Promise.all([
        triggerWordsAPI.getTriggerWords(selectedBotFilterId || undefined),
        agentsAPI.list(activeWorkspace.id),
      ]);
      const botData = botsResponse.agents.map((agent) => ({
        id: agent.id,
        name: agent.name,
        telegram_username: agent.telegram_username ?? null,
      }));
      setBots(botData);
      setTriggers(triggerData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load triggers.");
      setTriggers([]);
      setBots([]);
    } finally {
      setLoading(false);
    }
  }, [selectedBotFilterId, user, activeWorkspace]);

  useEffect(() => {
    if (user) {
      fetchTriggers();
    }
  }, [user, fetchTriggers]);

  // Reset form
  const resetForm = useCallback(() => {
    setTriggerWord("");
    setSelectedBotId("");
    setDescription("");
    setMediaUrl("");
    setMediaType("image");
    setModalError(null);
    setEditingTrigger(null);
    setSelectedFile(null);
    setUploadMode("upload");
  }, []);

  // Handle file selection
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setModalError("File too large. Maximum size is 10MB.");
      return;
    }

    setSelectedFile(file);
    setModalError(null);

    // Auto-detect media type
    if (file.type.startsWith("image/")) {
      setMediaType("image");
    } else if (file.type.startsWith("video/")) {
      setMediaType("video");
    } else if (file.type.startsWith("audio/")) {
      setMediaType("audio");
    } else {
      setMediaType("file");
    }
  }, []);

  // Open modal for new trigger
  const openAddModal = () => {
    resetForm();
    if (selectedBotFilterId) {
      setSelectedBotId(selectedBotFilterId);
    }
    setModalOpen(true);
  };

  // Open modal for editing
  const openEditModal = (trigger: TriggerWord) => {
    setEditingTrigger(trigger);
    setTriggerWord(trigger.trigger_word.replace(/^\//, ""));
    setSelectedBotId(trigger.bot_id || "");
    setDescription(trigger.description || "");
    setMediaUrl(trigger.media_url);
    setMediaType(trigger.media_type);
    setModalError(null);
    setUploadMode("url"); // When editing, show URL mode with existing URL
    setSelectedFile(null);
    setModalOpen(true);
  };

  // Handle save (create or update)
  const handleSave = useCallback(async () => {
    setModalError(null);

    if (!triggerWord.trim()) {
      setModalError("Trigger word is required.");
      return;
    }

    if (!selectedBotId) {
      setModalError("Please choose a bot for this trigger.");
      return;
    }

    // Check if we have media (either file or URL)
    if (uploadMode === "upload" && !selectedFile && !mediaUrl) {
      setModalError("Please select a file to upload.");
      return;
    }
    if (uploadMode === "url" && !mediaUrl.trim()) {
      setModalError("Media URL is required.");
      return;
    }

    setSaving(true);
    try {
      let finalMediaUrl = mediaUrl;
      let finalMediaType = mediaType;

      // Upload file if selected
      if (uploadMode === "upload" && selectedFile) {
        setUploading(true);
        try {
          const uploadResult = await triggerWordsAPI.uploadMedia(selectedFile);
          finalMediaUrl = uploadResult.url;
          finalMediaType = uploadResult.media_type;
        } catch (uploadErr) {
          setModalError(uploadErr instanceof Error ? uploadErr.message : "Failed to upload file.");
          setSaving(false);
          setUploading(false);
          return;
        }
        setUploading(false);
      }

      if (editingTrigger) {
        // Update existing
        const updated = await triggerWordsAPI.updateTriggerWord(editingTrigger.id, {
          bot_id: selectedBotId,
          trigger_word: triggerWord.trim(),
          description: description.trim() || undefined,
          media_url: finalMediaUrl.trim(),
          media_type: finalMediaType,
        });
        setTriggers((prev) =>
          prev.map((t) => (t.id === updated.id ? updated : t))
        );
        toast.success("Trigger updated successfully");
      } else {
        // Create new
        const created = await triggerWordsAPI.createTriggerWord({
          bot_id: selectedBotId,
          trigger_word: triggerWord.trim(),
          description: description.trim() || undefined,
          media_url: finalMediaUrl.trim(),
          media_type: finalMediaType,
        });
        setTriggers((prev) => [created, ...prev]);
        toast.success("Trigger created successfully");
      }
      resetForm();
      setModalOpen(false);
    } catch (err) {
      setModalError(err instanceof Error ? err.message : "Failed to save trigger.");
    } finally {
      setSaving(false);
    }
  }, [triggerWord, selectedBotId, description, mediaUrl, mediaType, editingTrigger, resetForm, uploadMode, selectedFile]);

  // Handle delete
  const handleDelete = useCallback(async (id: string) => {
    toast.warning("Delete this trigger?", {
      description: "This action cannot be undone.",
      duration: 10000,
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            await triggerWordsAPI.deleteTriggerWord(id);
            setTriggers((prev) => prev.filter((t) => t.id !== id));
            toast.success("Trigger deleted");
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to delete trigger");
          }
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {
          toast("Deletion cancelled");
        },
      },
    });
  }, []);

  // Handle toggle active
  const handleToggleActive = useCallback(async (trigger: TriggerWord) => {
    try {
      const updated = await triggerWordsAPI.updateTriggerWord(trigger.id, {
        is_active: !trigger.is_active,
      });
      setTriggers((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      );
      toast.success(updated.is_active ? "Trigger enabled" : "Trigger disabled");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update trigger");
    }
  }, []);

  // Filter triggers
  const filteredTriggers = triggers.filter((trigger) =>
    trigger.trigger_word.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trigger.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (bots.find((bot) => bot.id === trigger.bot_id)?.name ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4 sm:gap-6 w-full max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 text-brand" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Triggers</h1>
            <p className="text-sm text-text-muted">Keyword-based media and response automation</p>
          </div>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 rounded-xl bg-brand text-white px-4 py-2.5 text-sm font-bold transition-all hover:bg-brand/90 shadow-sm active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Add Trigger
        </button>
      </div>

      {/* Search and Triggers List */}
      <div className="flex flex-col gap-4 sm:gap-6">
        <div className="rounded-xl sm:rounded-2xl border border-border bg-surface shadow-lg overflow-hidden">
          {/* Search Bar */}
          <div className="border-b border-border bg-background px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div>
                <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                  <Hash className="h-5 w-5 text-brand" />
                  Your Triggers
                </h3>
                <p className="text-sm text-text-muted mt-1">
                  {triggers.length === 0
                    ? selectedBotFilterId
                      ? "No triggers for this bot"
                      : "No triggers yet"
                    : triggers.length === 1
                      ? "1 trigger"
                      : `${triggers.length} triggers`}
                </p>
              </div>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                <select
                  value={selectedBotFilterId}
                  onChange={(e) => setSelectedBotFilterId(e.target.value)}
                  className="w-full sm:w-56 px-3 py-2 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                >
                  <option value="">All bots</option>
                  {bots.map((bot) => (
                    <option key={bot.id} value={bot.id}>
                      {bot.name}
                      {bot.telegram_username ? ` (@${bot.telegram_username})` : ""}
                    </option>
                  ))}
                </select>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search triggers..."
                    className="w-full pl-9 pr-4 py-2 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Triggers List */}
          <div className="min-h-[300px] max-h-[60vh] overflow-y-auto p-4">
            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-text-muted">
                  <Loader2 className="h-8 w-8 animate-spin text-brand" />
                  <p className="text-sm">Loading triggers...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex h-64 items-center justify-center">
                <div className="text-center max-w-sm">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                    <AlertCircle className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-semibold text-text-primary">
                    Could not load triggers
                  </p>
                  <p className="mt-1 text-xs text-text-muted">{error}</p>
                  <button
                    type="button"
                    onClick={() => fetchTriggers()}
                    className="mt-3 text-sm font-medium text-brand hover:underline"
                  >
                    Try again
                  </button>
                </div>
              </div>
            ) : filteredTriggers.length === 0 ? (
              <div className="flex h-64 items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
                    <Zap className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-semibold text-text-primary">
                    {searchQuery ? "No triggers found" : "No triggers yet"}
                  </p>
                  <p className="mt-1 text-xs text-text-muted">
                    {searchQuery
                      ? "Try a different search term"
                      : selectedBotFilterId
                        ? "Try a different bot or add a trigger for this bot."
                        : "Use \"Add Trigger\" to create your first trigger."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredTriggers.map((trigger) => {
                  const MediaIcon = getMediaIcon(trigger.media_type);
                  const bot = bots.find((item) => item.id === trigger.bot_id);
                  return (
                    <div
                      key={trigger.id}
                      className={`group relative flex flex-col rounded-xl border bg-surface p-4 shadow-sm transition-all hover:shadow-md ${
                        trigger.is_active
                          ? "border-border hover:border-brand/30"
                          : "border-border bg-background opacity-60"
                      }`}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                            trigger.is_active ? "bg-brand/10 text-brand" : "bg-background text-text-muted"
                          }`}>
                            <MediaIcon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-text-primary truncate">
                              {trigger.trigger_word}
                            </p>
                            <p className="text-[10px] text-text-muted capitalize truncate">
                              {trigger.media_type}
                              {bot ? ` - ${bot.name}` : ""}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(trigger)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              trigger.is_active
                                ? "text-brand hover:bg-brand/10"
                                : "text-text-muted hover:bg-background"
                            }`}
                            title={trigger.is_active ? "Disable" : "Enable"}
                          >
                            {trigger.is_active ? (
                              <ToggleRight className="h-5 w-5" />
                            ) : (
                              <ToggleLeft className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Description */}
                      {trigger.description && (
                        <p className="text-xs text-text-secondary mb-3 line-clamp-2">
                          {trigger.description}
                        </p>
                      )}

                      {/* Media Preview */}
                      <div className="relative flex-1 min-h-[100px] rounded-lg overflow-hidden bg-background mb-3">
                        {trigger.media_type === "image" ? (
                          <Image
                            src={trigger.media_url}
                            alt={trigger.trigger_word}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/placeholder-image.png";
                            }}
                          />
                        ) : trigger.media_type === "video" ? (
                          <video
                            src={trigger.media_url}
                            className="w-full h-full object-cover"
                            muted
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <MediaIcon className="h-8 w-8 text-text-muted" />
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <span className="text-[10px] text-text-muted">
                          Used {trigger.usage_count} times
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(trigger)}
                            className="p-1.5 text-text-muted hover:text-brand hover:bg-brand/10 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(trigger.id)}
                            className="p-1.5 text-text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-h-[90vh] max-w-lg overflow-y-auto rounded-2xl border border-border bg-surface shadow-2xl ring-1 ring-black/5 animate-in zoom-in-95 duration-200">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand shadow-sm">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text-primary">
                      {editingTrigger ? "Edit Trigger" : "Add Trigger"}
                    </h3>
                    <p className="text-xs text-text-muted">
                      Create a shortcut for quick media access
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setModalOpen(false);
                  }}
                  className="rounded-lg p-2 text-text-muted hover:bg-background hover:text-text-secondary transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {modalError && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs font-medium text-red-600 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {modalError}
                </div>
              )}

              <div className="space-y-4">
                {/* Trigger Word */}
                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5 ml-1">
                    Bot
                  </label>
                  <select
                    value={selectedBotId}
                    onChange={(e) => setSelectedBotId(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm bg-background border border-border rounded-xl focus:bg-surface focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                  >
                    <option value="">Select a bot...</option>
                    {bots.map((bot) => (
                      <option key={bot.id} value={bot.id}>
                        {bot.name}
                        {bot.telegram_username ? ` (@${bot.telegram_username})` : ""}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-text-muted mt-1 ml-1">
                    Choose which bot this trigger belongs to
                  </p>
                </div>

                {/* Trigger Word */}
                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5 ml-1">
                    Trigger Word
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-medium">
                      /
                    </span>
                    <input
                      type="text"
                      value={triggerWord}
                      onChange={(e) => setTriggerWord(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ""))}
                      placeholder="office-pic"
                      className="w-full pl-8 pr-4 py-2.5 text-sm bg-background border border-border rounded-xl focus:bg-surface focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all placeholder:text-text-muted"
                    />
                  </div>
                  <p className="text-[10px] text-text-muted mt-1 ml-1">
                    Only letters, numbers, hyphens, and underscores allowed
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5 ml-1">
                    Description (optional)
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Our office photo"
                    className="w-full px-4 py-2.5 text-sm bg-background border border-border rounded-xl focus:bg-surface focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all placeholder:text-text-muted"
                  />
                </div>

                {/* Upload Mode Toggle */}
                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5 ml-1">
                    Media Source
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setUploadMode("upload")}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                        uploadMode === "upload"
                          ? "border-brand bg-brand/10 text-brand"
                          : "border-border bg-surface text-text-secondary hover:border-brand/30"
                      }`}
                    >
                      <Upload className="h-4 w-4" />
                      <span className="text-sm font-medium">Upload File</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadMode("url")}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                        uploadMode === "url"
                          ? "border-brand bg-brand/10 text-brand"
                          : "border-border bg-surface text-text-secondary hover:border-brand/30"
                      }`}
                    >
                      <Link className="h-4 w-4" />
                      <span className="text-sm font-medium">Enter URL</span>
                    </button>
                  </div>
                </div>

                {/* File Upload */}
                {uploadMode === "upload" && (
                  <div>
                    <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5 ml-1">
                      Upload Media
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        onChange={handleFileSelect}
                        accept="image/*,video/*,audio/*,.pdf"
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                          selectedFile
                            ? "border-brand bg-brand/5"
                            : "border-border bg-background hover:border-brand/50 hover:bg-background"
                        }`}
                      >
                        {selectedFile ? (
                          <div className="flex flex-col items-center gap-2 text-brand">
                            <File className="h-8 w-8" />
                            <span className="text-sm font-medium truncate max-w-[200px]">
                              {selectedFile.name}
                            </span>
                            <span className="text-[10px] text-text-muted">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-text-muted">
                            <Upload className="h-8 w-8" />
                            <span className="text-sm">Click to upload or drag and drop</span>
                            <span className="text-[10px]">Max 10MB - Images, Videos, Audio, PDF</span>
                          </div>
                        )}
                      </label>
                    </div>
                    {selectedFile && (
                      <button
                        type="button"
                        onClick={() => setSelectedFile(null)}
                        className="mt-2 text-xs text-red-500 hover:text-red-600"
                      >
                        Remove file
                      </button>
                    )}
                  </div>
                )}

                {/* Media URL */}
                {uploadMode === "url" && (
                  <div>
                    <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5 ml-1">
                      Media URL
                    </label>
                    <input
                      type="url"
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-4 py-2.5 text-sm bg-background border border-border rounded-xl focus:bg-surface focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all placeholder:text-text-muted"
                    />

                    {/* Media Type for URL mode */}
                    <div className="mt-3">
                      <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5 ml-1">
                        Media Type
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {MEDIA_TYPE_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setMediaType(option.value)}
                            className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${
                              mediaType === option.value
                                ? "border-brand bg-brand/10 text-brand"
                                : "border-border bg-surface text-text-secondary hover:border-brand/30"
                            }`}
                          >
                            <option.icon className="h-4 w-4" />
                            <span className="text-[10px] font-medium">{option.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Preview */}
                {uploadMode === "url" && mediaUrl && mediaType === "image" && (
                  <div>
                    <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5 ml-1">
                      Preview
                    </label>
                    <div className="relative h-40 rounded-xl overflow-hidden bg-background border border-border">
                      <Image
                        src={mediaUrl}
                        alt="Preview"
                        fill
                        className="object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* File Preview for uploaded images */}
                {uploadMode === "upload" && selectedFile && selectedFile.type.startsWith("image/") && (
                  <div>
                    <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5 ml-1">
                      Preview
                    </label>
                    <div className="relative h-40 rounded-xl overflow-hidden bg-background border border-border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={URL.createObjectURL(selectedFile)}
                        alt="Preview"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || uploading}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-brand text-white px-4 py-3 text-sm font-bold shadow-lg shadow-brand/25 hover:bg-brand/90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving || uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {uploading ? "Uploading..." : "Saving..."}
                    </>
                  ) : editingTrigger ? (
                    "Update Trigger"
                  ) : (
                    "Add Trigger"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setModalOpen(false);
                  }}
                  className="px-4 py-3 border border-border text-text-secondary rounded-xl font-semibold text-sm hover:bg-background transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
