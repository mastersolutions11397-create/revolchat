"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { triggerWordsAPI } from "@/lib/api/trigger-words";
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

export default function TriggersPage() {
  const { user } = useAuth();

  const [triggers, setTriggers] = useState<TriggerWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTrigger, setEditingTrigger] = useState<TriggerWord | null>(null);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form state
  const [triggerWord, setTriggerWord] = useState("");
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
      const data = await triggerWordsAPI.getTriggerWords();
      setTriggers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load triggers.");
      setTriggers([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchTriggers();
    }
  }, [user, fetchTriggers]);

  // Reset form
  const resetForm = useCallback(() => {
    setTriggerWord("");
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
    setModalOpen(true);
  };

  // Open modal for editing
  const openEditModal = (trigger: TriggerWord) => {
    setEditingTrigger(trigger);
    setTriggerWord(trigger.trigger_word.replace(/^\//, ""));
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
  }, [triggerWord, description, mediaUrl, mediaType, editingTrigger, resetForm, uploadMode, selectedFile]);

  // Handle delete
  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Delete this trigger? This cannot be undone.")) return;

    try {
      await triggerWordsAPI.deleteTriggerWord(id);
      setTriggers((prev) => prev.filter((t) => t.id !== id));
      toast.success("Trigger deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete trigger");
    }
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
    trigger.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4 sm:gap-6 w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-br from-teal-primary via-[#0d6159] to-slate-800 p-4 sm:p-6 md:p-8 text-white shadow-xl overflow-visible">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-teal-accent/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-64 w-64 rounded-full bg-teal-accent/20 blur-3xl" />
        <div className="relative z-10 flex flex-col gap-4 sm:gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 min-w-0">
            <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-md shadow-inner border border-white/20 shrink-0">
              <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-teal-accent" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white">
                Trigger Words
              </h1>
              <p className="mt-1 sm:mt-2 text-sm sm:text-base md:text-lg text-white/80 max-w-xl">
                Create shortcuts like /office-pic to quickly send media in your chats.
                Type / in chat to see available triggers.
              </p>
            </div>
          </div>
          <div className="relative z-50 shrink-0">
            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center gap-2 rounded-xl bg-white text-slate-900 px-6 py-3 text-sm font-bold transition-all hover:bg-teal-primary/10 hover:text-teal-primary shadow-lg shadow-black/10 active:scale-[0.98]"
            >
              <Plus className="h-5 w-5" />
              Add Trigger
            </button>
          </div>
        </div>
      </div>

      {/* Search and Triggers List */}
      <div className="flex flex-col gap-4 sm:gap-6">
        <div className="rounded-xl sm:rounded-2xl border border-dashboard-border bg-dashboard-card shadow-lg overflow-hidden">
          {/* Search Bar */}
          <div className="border-b border-dashboard-border bg-gradient-to-br from-dashboard-bg via-teal-primary/5 to-dashboard-bg px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Hash className="h-5 w-5 text-teal-primary" />
                  Your Triggers
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  {triggers.length === 0
                    ? "No triggers yet"
                    : triggers.length === 1
                      ? "1 trigger"
                      : `${triggers.length} triggers`}
                </p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search triggers..."
                  className="w-full pl-9 pr-4 py-2 bg-white border border-dashboard-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-primary/20 focus:border-teal-primary transition-all"
                />
              </div>
            </div>
          </div>

          {/* Triggers List */}
          <div className="min-h-[300px] max-h-[60vh] overflow-y-auto p-4">
            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-slate-500">
                  <Loader2 className="h-8 w-8 animate-spin text-teal-primary" />
                  <p className="text-sm">Loading triggers...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex h-64 items-center justify-center">
                <div className="text-center max-w-sm">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                    <AlertCircle className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-semibold text-slate-900">
                    Could not load triggers
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{error}</p>
                  <button
                    type="button"
                    onClick={() => fetchTriggers()}
                    className="mt-3 text-sm font-medium text-teal-primary hover:underline"
                  >
                    Try again
                  </button>
                </div>
              </div>
            ) : filteredTriggers.length === 0 ? (
              <div className="flex h-64 items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-primary/10 text-teal-primary">
                    <Zap className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    {searchQuery ? "No triggers found" : "No triggers yet"}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {searchQuery
                      ? "Try a different search term"
                      : "Use \"Add Trigger\" to create your first trigger."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredTriggers.map((trigger) => {
                  const MediaIcon = getMediaIcon(trigger.media_type);
                  return (
                    <div
                      key={trigger.id}
                      className={`group relative flex flex-col rounded-xl border bg-white p-4 shadow-sm transition-all hover:shadow-md ${
                        trigger.is_active
                          ? "border-dashboard-border hover:border-teal-primary/30"
                          : "border-slate-200 bg-slate-50 opacity-60"
                      }`}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                            trigger.is_active ? "bg-teal-primary/10 text-teal-primary" : "bg-slate-200 text-slate-400"
                          }`}>
                            <MediaIcon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">
                              {trigger.trigger_word}
                            </p>
                            <p className="text-[10px] text-slate-500 capitalize">
                              {trigger.media_type}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(trigger)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              trigger.is_active
                                ? "text-teal-primary hover:bg-teal-primary/10"
                                : "text-slate-400 hover:bg-slate-100"
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
                        <p className="text-xs text-slate-600 mb-3 line-clamp-2">
                          {trigger.description}
                        </p>
                      )}

                      {/* Media Preview */}
                      <div className="relative flex-1 min-h-[100px] rounded-lg overflow-hidden bg-slate-100 mb-3">
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
                            <MediaIcon className="h-8 w-8 text-slate-400" />
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="text-[10px] text-slate-400">
                          Used {trigger.usage_count} times
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(trigger)}
                            className="p-1.5 text-slate-400 hover:text-teal-primary hover:bg-teal-primary/10 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(trigger.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-h-[90vh] max-w-lg overflow-y-auto rounded-2xl border border-white/20 bg-white shadow-2xl ring-1 ring-black/5 animate-in zoom-in-95 duration-200">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-primary/10 text-teal-primary shadow-sm">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {editingTrigger ? "Edit Trigger" : "Add Trigger"}
                    </h3>
                    <p className="text-xs text-slate-500">
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
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
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
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                    Trigger Word
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                      /
                    </span>
                    <input
                      type="text"
                      value={triggerWord}
                      onChange={(e) => setTriggerWord(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ""))}
                      placeholder="office-pic"
                      className="w-full pl-8 pr-4 py-2.5 text-sm bg-slate-50 border border-dashboard-border rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-primary/20 focus:border-teal-primary transition-all placeholder:text-slate-400"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 ml-1">
                    Only letters, numbers, hyphens, and underscores allowed
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                    Description (optional)
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Our office photo"
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-dashboard-border rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-primary/20 focus:border-teal-primary transition-all placeholder:text-slate-400"
                  />
                </div>

                {/* Upload Mode Toggle */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                    Media Source
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setUploadMode("upload")}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                        uploadMode === "upload"
                          ? "border-teal-primary bg-teal-primary/10 text-teal-primary"
                          : "border-dashboard-border bg-white text-slate-600 hover:border-teal-primary/30"
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
                          ? "border-teal-primary bg-teal-primary/10 text-teal-primary"
                          : "border-dashboard-border bg-white text-slate-600 hover:border-teal-primary/30"
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
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
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
                            ? "border-teal-primary bg-teal-primary/5"
                            : "border-dashboard-border bg-slate-50 hover:border-teal-primary/50 hover:bg-slate-100"
                        }`}
                      >
                        {selectedFile ? (
                          <div className="flex flex-col items-center gap-2 text-teal-primary">
                            <File className="h-8 w-8" />
                            <span className="text-sm font-medium truncate max-w-[200px]">
                              {selectedFile.name}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-slate-400">
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
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                      Media URL
                    </label>
                    <input
                      type="url"
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-dashboard-border rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-primary/20 focus:border-teal-primary transition-all placeholder:text-slate-400"
                    />

                    {/* Media Type for URL mode */}
                    <div className="mt-3">
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
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
                                ? "border-teal-primary bg-teal-primary/10 text-teal-primary"
                                : "border-dashboard-border bg-white text-slate-600 hover:border-teal-primary/30"
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
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                      Preview
                    </label>
                    <div className="relative h-40 rounded-xl overflow-hidden bg-slate-100 border border-dashboard-border">
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
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                      Preview
                    </label>
                    <div className="relative h-40 rounded-xl overflow-hidden bg-slate-100 border border-dashboard-border">
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
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-teal-primary text-white px-4 py-3 text-sm font-bold shadow-lg shadow-teal-primary/25 hover:bg-teal-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="px-4 py-3 border border-dashboard-border text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-all"
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
