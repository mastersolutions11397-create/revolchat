"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import { ActivityLogger } from "@/lib/utils/activityLogger";
import { knowledgeAPI } from "@/lib/api/knowledge";
import type { KnowledgeRecord, KnowledgeImportance } from "@/lib/api/knowledge";
import {
  googleSheetsAPI,
  extractSheetIdFromUrl,
  type GoogleSheet,
} from "@/lib/api/google-sheets";

export default function KnowledgePage() {
  const { user } = useAuth();
  const { currentWorkspace, selectedWorkspaceId } = useWorkspace();
  const [localSelectedId, setLocalSelectedId] = useState<string | null>(null);
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeRecord[]>([]);
  const [knowledgeLoading, setKnowledgeLoading] = useState(false);
  const [knowledgeError, setKnowledgeError] = useState<string | null>(null);
  const workspaceId =
    currentWorkspace?.id || selectedWorkspaceId || localSelectedId || null;

  useEffect(() => {
    // Fallback: read from localStorage immediately on mount
    try {
      const val = localStorage.getItem("selectedWorkspaceId");
      if (val && val !== "undefined" && val !== "null") {
        setLocalSelectedId(val);
      }
    } catch {}
  }, []);
  const [activeTab, setActiveTab] = useState<"text" | "pdf" | "sheets" | null>(
    null
  );
  const [textTitle, setTextTitle] = useState("");
  const [textContent, setTextContent] = useState("");
  const [textCategory, setTextCategory] = useState("branding");
  const [importanceLevel, setImportanceLevel] = useState(2); // 1..4 → low/normal/high/critical
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [submittingText, setSubmittingText] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const MAX_CONTENT_LENGTH = 100000; // backend safety limit
  const [pdfTitle, setPdfTitle] = useState("");
  const [pdfCategory, setPdfCategory] = useState("branding");
  const [pdfImportanceLevel, setPdfImportanceLevel] = useState(3);
  const [pdfTags, setPdfTags] = useState<string[]>([]);
  const [pdfTagInput, setPdfTagInput] = useState("");
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfSuccessMessage, setPdfSuccessMessage] = useState<string | null>(
    null
  );
  const [isProcessingPdfs, setIsProcessingPdfs] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [sheetsConnected, setSheetsConnected] = useState(false);
  const [clickedTemplateIndex, setClickedTemplateIndex] = useState<
    number | null
  >(null);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [googleSheetLink, setGoogleSheetLink] = useState("");
  const [linkInputError, setLinkInputError] = useState<string | null>(null);
  const [googleSheets, setGoogleSheets] = useState<GoogleSheet[]>([]);
  const [sheetsLoading, setSheetsLoading] = useState(false);
  const [sheetsError, setSheetsError] = useState<string | null>(null);
  const [submittingSheet, setSubmittingSheet] = useState(false);
  const [showTemplateCards, setShowTemplateCards] = useState(false);

  const cardLinks = [
    "https://docs.google.com/spreadsheets/d/1aQz9uW585_1u8u_ElIrfmO5ybazwxt53jTRh12LRif8/edit?usp=share_link",
    "https://docs.google.com/spreadsheets/d/1bUCXkEr0kNJjW89VmtLN6tdhjd1z6mGZJhDARJiNvd8/edit?gid=1602948167#gid=1602948167",
    "https://docs.google.com/spreadsheets/d/1jXh9PxqJRI-6JvNrO7ZHD116POlg5KeBmVymyyxyX3o/edit?gid=1602948167#gid=1602948167",
    "https://docs.google.com/spreadsheets/d/1gnhRyFTSZgcS5yCwaJxheXlZfLYGL5PKnnql1Ok0GnM/edit?gid=1966269518#gid=1966269518",
  ];

  const templateCards = [
    "Conversational Template",
    "Order Fulfillment Template",
    "Lead Generating Template",
    "Appointment Booking Template",
  ];

  // Map template index to sheet_type
  const getSheetTypeFromTemplate = (index: number): string => {
    const types = [
      "conversational",
      "order_fulfillment",
      "lead_generating",
      "appointment_booking",
    ];
    return types[index] || "general";
  };

  const textDocumentsCount = knowledgeItems.filter((item) => {
    const type = item.file_type?.toLowerCase();
    return !type || type === "text";
  }).length;
  const pdfFilesCount = knowledgeItems.filter((item) => {
    const type = item.file_type?.toLowerCase();
    return type === "pdf";
  }).length;
  const connectedSheetsCount = googleSheets.length > 0 ? 1 : 0; // Only one sheet allowed per workspace
  const hasGoogleSheet = googleSheets.length > 0;

  const formatDateTime = (value?: string | null, emptyFallback = "Unknown") => {
    if (!value) {
      return emptyFallback;
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return emptyFallback;
    }
    return date.toLocaleString();
  };

  const loadKnowledge = useCallback(async (id: string) => {
    setKnowledgeLoading(true);
    setKnowledgeError(null);
    try {
      const response = await knowledgeAPI.getKnowledgeList(id);
      setKnowledgeItems(response?.results ?? []);
    } catch (error: any) {
      setKnowledgeError(
        error?.message || "Failed to fetch knowledge for this workspace"
      );
      setKnowledgeItems([]);
    } finally {
      setKnowledgeLoading(false);
    }
  }, []);

  const loadGoogleSheets = useCallback(async (id: string) => {
    setSheetsLoading(true);
    setSheetsError(null);
    try {
      const response = await googleSheetsAPI.getGoogleSheets(id);
      setGoogleSheets(response?.data ?? []);
      setSheetsConnected(response?.data && response.data.length > 0);
    } catch (error: any) {
      setSheetsError(
        error?.message || "Failed to fetch Google Sheets for this workspace"
      );
      setGoogleSheets([]);
      setSheetsConnected(false);
    } finally {
      setSheetsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!workspaceId) {
      setKnowledgeItems([]);
      setKnowledgeLoading(false);
      setKnowledgeError(null);
      setGoogleSheets([]);
      setSheetsLoading(false);
      setSheetsError(null);
      return;
    }

    loadKnowledge(workspaceId);
    loadGoogleSheets(workspaceId);
  }, [workspaceId, loadKnowledge, loadGoogleSheets]);

  const handleRefreshKnowledge = useCallback(() => {
    if (workspaceId) {
      loadKnowledge(workspaceId);
    }
  }, [workspaceId, loadKnowledge]);

  const resetTextForm = () => {
    setTextTitle("");
    setTextContent("");
    setTextCategory("branding");
    setImportanceLevel(3);
    setTags([]);
    setTagInput("");
    setSubmitError(null);
  };

  const resetPdfForm = () => {
    setUploadedFiles([]);
    setPdfTitle("");
    setPdfCategory("branding");
    setPdfImportanceLevel(3);
    setPdfTags([]);
    setPdfTagInput("");
    setPdfError(null);
    setPdfSuccessMessage(null);
    setIsProcessingPdfs(false);
  };

  useEffect(() => {
    if (uploadedFiles.length === 0) {
      return;
    }

    setPdfTitle((prev) => {
      if (prev) {
        return prev;
      }

      if (uploadedFiles.length === 1) {
        const [first] = uploadedFiles;
        return first.name.replace(/\.pdf$/i, "");
      }

      return `${uploadedFiles.length} PDF documents`;
    });
  }, [uploadedFiles]);

  // Detect when user returns from Google Sheet
  useEffect(() => {
    if (clickedTemplateIndex === null) return;

    let wasBlurred = false;

    const handleBlur = () => {
      wasBlurred = true;
    };

    const handleFocus = () => {
      if (wasBlurred && !showLinkInput) {
        // Small delay to ensure the window has fully focused
        setTimeout(() => {
          setShowLinkInput(true);
        }, 500);
      }
    };

    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        wasBlurred &&
        !showLinkInput
      ) {
        setTimeout(() => {
          setShowLinkInput(true);
        }, 500);
      }
    };

    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [clickedTemplateIndex, showLinkInput]);

  const handleTemplateClick = (index: number) => {
    setClickedTemplateIndex(index);
    window.open(cardLinks[index], "_blank");
  };

  const validateGoogleSheetsLink = (
    link: string
  ): { isValid: boolean; error?: string } => {
    if (!link.trim()) {
      return { isValid: false, error: "Please enter a Google Sheets link" };
    }

    // Try to create a URL object to validate format
    let url: URL;
    try {
      url = new URL(link.trim());
    } catch {
      return { isValid: false, error: "Please enter a valid URL" };
    }

    // Check if it's a Google domain
    if (
      url.hostname !== "docs.google.com" &&
      url.hostname !== "drive.google.com"
    ) {
      return {
        isValid: false,
        error: "Link must be from Google Docs or Google Drive",
      };
    }

    // Check if it's specifically a Google Sheets link
    const pathname = url.pathname;
    const isSpreadsheet = pathname.includes("/spreadsheets/");

    if (!isSpreadsheet) {
      // Check if it's a Google Drive link that points to a spreadsheet
      if (pathname.includes("/file/d/") || pathname.includes("/file/d/")) {
        // Drive link might be a spreadsheet, but we can't verify without opening
        // We'll allow it but warn it might need to be the direct spreadsheet link
      } else {
        return {
          isValid: false,
          error:
            "Link must be a Google Sheets URL (docs.google.com/spreadsheets/...)",
        };
      }
    }

    // Additional validation: check if it has a spreadsheet ID pattern
    const spreadsheetIdPattern = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
    const match = link.match(spreadsheetIdPattern);

    if (isSpreadsheet && !match) {
      return {
        isValid: false,
        error:
          "Link appears to be malformed. Please use a valid Google Sheets share link",
      };
    }

    return { isValid: true };
  };

  const handleSubmitLink = async () => {
    const validation = validateGoogleSheetsLink(googleSheetLink);

    if (!validation.isValid) {
      setLinkInputError(
        validation.error || "Please enter a valid Google Sheets link"
      );
      return;
    }

    setLinkInputError(null);

    if (!workspaceId || clickedTemplateIndex === null) {
      setLinkInputError("Workspace or template information missing");
      return;
    }

    // Check if a sheet already exists
    if (googleSheets.length > 0) {
      setLinkInputError(
        "Only one Google Sheet can be connected per workspace. Please disconnect the existing sheet first."
      );
      return;
    }

    // Extract sheet ID from URL
    const sheetId = extractSheetIdFromUrl(googleSheetLink);
    if (!sheetId) {
      setLinkInputError("Could not extract sheet ID from URL");
      return;
    }

    setSubmittingSheet(true);

    try {
      const sheetType = getSheetTypeFromTemplate(clickedTemplateIndex);

      // Save to backend
      await googleSheetsAPI.createGoogleSheet(workspaceId, {
        sheet_id: sheetId,
        sheet_type: sheetType,
      });

      // Log activity
      await ActivityLogger.logIntegrationEvent(
        workspaceId,
        "google_sheets",
        "connected",
        `Connected ${templateCards[clickedTemplateIndex]}: ${googleSheetLink}`
      );

      // Refresh Google Sheets list
      await loadGoogleSheets(workspaceId);

      // Refresh dashboard activities
      if ((window as any).refreshDashboardActivities) {
        (window as any).refreshDashboardActivities();
      }

      // Reset states
      setGoogleSheetLink("");
      setShowLinkInput(false);
      setClickedTemplateIndex(null);
      setShowTemplateCards(false);
    } catch (error: any) {
      setLinkInputError(error?.message || "Failed to save Google Sheet link");
      console.error("Error saving Google Sheet link:", error);
    } finally {
      setSubmittingSheet(false);
    }
  };

  const handleDeleteSheet = async (sheetId: string) => {
    if (!workspaceId) return;

    if (!confirm("Are you sure you want to disconnect this Google Sheet?")) {
      return;
    }

    try {
      await googleSheetsAPI.deleteGoogleSheet(workspaceId, sheetId);

      // Log activity
      await ActivityLogger.logIntegrationEvent(
        workspaceId,
        "google_sheets",
        "disconnected",
        `Disconnected Google Sheet: ${sheetId}`
      );

      // Refresh Google Sheets list
      await loadGoogleSheets(workspaceId);

      // Refresh dashboard activities
      if ((window as any).refreshDashboardActivities) {
        (window as any).refreshDashboardActivities();
      }
    } catch (error: any) {
      setSheetsError(error?.message || "Failed to delete Google Sheet");
      console.error("Error deleting Google Sheet:", error);
    }
  };

  const handleDeleteKnowledge = async (knowledgeId: string, title: string) => {
    if (!workspaceId) return;

    if (
      !confirm(
        `Are you sure you want to delete "${title}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await knowledgeAPI.deleteKnowledge(workspaceId, knowledgeId);

      // Log activity
      await ActivityLogger.logKnowledgeUpdate(
        workspaceId,
        "text",
        `Deleted knowledge entry: ${title}`
      );

      // Refresh knowledge list
      await loadKnowledge(workspaceId);

      // Refresh dashboard activities
      if ((window as any).refreshDashboardActivities) {
        (window as any).refreshDashboardActivities();
      }
    } catch (error: any) {
      setKnowledgeError(error?.message || "Failed to delete knowledge entry");
      console.error("Error deleting knowledge entry:", error);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isProcessingPdfs) {
      return;
    }

    const files = Array.from(event.target.files || []);

    if (files.length === 0) {
      return;
    }

    setUploadedFiles((prev) => [...prev, ...files]);
    setPdfError(null);
    setPdfSuccessMessage(null);

    event.target.value = "";
  };

  const handleProcessPDFs = async () => {
    const activeWorkspaceId = workspaceId;

    if (!activeWorkspaceId) {
      setPdfError("Please select a workspace first");
      return;
    }

    if (uploadedFiles.length === 0) {
      setPdfError("Please select at least one PDF file to upload");
      return;
    }

    if (!pdfTitle.trim()) {
      setPdfError("Title is required");
      return;
    }

    setPdfError(null);
    setPdfSuccessMessage(null);
    setIsProcessingPdfs(true);

    const importance: KnowledgeImportance =
      pdfImportanceLevel === 1
        ? "low"
        : pdfImportanceLevel === 2
        ? "normal"
        : pdfImportanceLevel === 3
        ? "high"
        : "critical";

    const metadata = {
      title: pdfTitle.trim(),
      category: pdfCategory,
      importance,
      tags: pdfTags,
    };

    try {
      const uploadedNames: string[] = [];

      for (const file of uploadedFiles) {
        await knowledgeAPI.uploadPdfKnowledge(
          activeWorkspaceId,
          file,
          metadata
        );
        uploadedNames.push(file.name);
      }

      const summary =
        uploadedNames.length === 1
          ? `Uploaded PDF: ${uploadedNames[0]}`
          : `Uploaded ${uploadedNames.length} PDFs (${uploadedNames
              .slice(0, 3)
              .join(", ")}${uploadedNames.length > 3 ? ", …" : ""})`;

      await ActivityLogger.logKnowledgeUpdate(
        activeWorkspaceId,
        "pdf",
        summary
      );

      if ((window as any).refreshDashboardActivities) {
        (window as any).refreshDashboardActivities();
      }

      await loadKnowledge(activeWorkspaceId);

      setPdfSuccessMessage(`${summary} successfully.`);
      setUploadedFiles([]);
      setPdfTitle("");
      setPdfCategory("branding");
      setPdfImportanceLevel(3);
      setPdfTags([]);
      setPdfTagInput("");
    } catch (error: any) {
      const message =
        error?.message ||
        (typeof error === "string" ? error : "Failed to process PDF files");
      setPdfError(message);
    } finally {
      setIsProcessingPdfs(false);
    }
  };

  const handleGoogleSheetsConnect = async () => {
    if (currentWorkspace?.id) {
      try {
        // Simulate Google Sheets connection
        setSheetsConnected(true);

        // Log activity
        await ActivityLogger.logIntegrationEvent(
          currentWorkspace.id,
          "google_sheets",
          "connected",
          "Google Sheets integration established"
        );

        // Refresh dashboard activities
        if ((window as any).refreshDashboardActivities) {
          (window as any).refreshDashboardActivities();
        }
      } catch (error) {
        console.error("Error connecting Google Sheets:", error);
      }
    }
  };

  const handleTextSubmit = async () => {
    if (textContent.trim() && currentWorkspace?.id) {
      try {
        // Handle text knowledge submission
        console.log("Text knowledge submitted:", textContent);

        // Log activity
        await ActivityLogger.logKnowledgeUpdate(
          currentWorkspace.id,
          "text",
          `Added ${textContent.length} characters of text knowledge`
        );

        // Refresh dashboard activities
        if ((window as any).refreshDashboardActivities) {
          (window as any).refreshDashboardActivities();
        }

        // Clear form
        setTextContent("");
        setActiveTab(null);
      } catch (error) {
        console.error("Error submitting text knowledge:", error);
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Knowledge Base</h1>
          <p className="text-gray-600 mt-2">
            Add knowledge to your AI agents from various sources
          </p>
          <div className="mt-1 text-xs text-gray-500 flex items-center gap-2">
            <span>
              Workspace:
              {currentWorkspace?.name
                ? ` ${currentWorkspace.name}`
                : workspaceId
                ? " (loading...)"
                : " None"}
            </span>
            {workspaceId ? (
              <span className="px-2 py-0.5 rounded bg-gray-100 border border-gray-200 text-gray-700">
                {workspaceId}
              </span>
            ) : (
              <span className="text-red-600">No workspace selected</span>
            )}
            {workspaceId && (
              <button
                onClick={() => navigator.clipboard.writeText(workspaceId ?? "")}
                className="ml-1 px-2 py-0.5 border border-gray-300 rounded text-gray-600 hover:bg-gray-50"
              >
                Copy ID
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Knowledge Source Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Text Input Option */}
        <div
          onClick={() => {
            if (activeTab === "text") {
              setActiveTab(null);
              resetTextForm();
            } else {
              // switching from another tab clears previous state
              resetPdfForm();
              setSheetsConnected(false);
              setActiveTab("text");
            }
          }}
          className={`yeti-card rounded-2xl p-8 yeti-shadow hover:shadow-xl transition-all group ${
            activeTab && activeTab !== "text"
              ? "opacity-50 pointer-events-none cursor-not-allowed"
              : "cursor-pointer"
          } ${activeTab === "text" ? "ring-2 ring-blue-500" : ""}`}
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <span className="text-3xl text-white">📝</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
              Text Knowledge
            </h3>
            <p className="text-gray-600 text-sm">
              Add knowledge by typing or pasting text directly
            </p>
          </div>
        </div>

        {/* PDF Upload Option */}
        <div
          onClick={() => {
            if (activeTab === "pdf") {
              setActiveTab(null);
              resetPdfForm();
            } else {
              // switching from another tab clears previous state
              resetTextForm();
              setSheetsConnected(false);
              resetPdfForm();
              setActiveTab("pdf");
            }
          }}
          className={`yeti-card rounded-2xl p-8 yeti-shadow hover:shadow-xl transition-all group ${
            activeTab && activeTab !== "pdf"
              ? "opacity-50 pointer-events-none cursor-not-allowed"
              : "cursor-pointer"
          } ${activeTab === "pdf" ? "ring-2 ring-red-500" : ""}`}
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <span className="text-3xl text-white">📄</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
              PDF Documents
            </h3>
            <p className="text-gray-600 text-sm">
              Upload PDF files to extract and process knowledge
            </p>
          </div>
        </div>

        {/* Google Sheets Option */}
        <div
          onClick={() => {
            if (activeTab === "sheets") {
              setActiveTab(null);
              setSheetsConnected(false);
              setClickedTemplateIndex(null);
              setShowLinkInput(false);
              setGoogleSheetLink("");
            } else {
              // switching from another tab clears previous state
              resetTextForm();
              resetPdfForm();
              setSheetsConnected(false);
              setClickedTemplateIndex(null);
              setShowLinkInput(false);
              setGoogleSheetLink("");
              setActiveTab("sheets");
            }
          }}
          className={`yeti-card rounded-2xl p-8 yeti-shadow hover:shadow-xl transition-all group ${
            activeTab && activeTab !== "sheets"
              ? "opacity-50 pointer-events-none cursor-not-allowed"
              : "cursor-pointer"
          } ${activeTab === "sheets" ? "ring-2 ring-green-500" : ""}`}
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <span className="text-3xl text-white">📊</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
              Google Sheets
            </h3>
            <p className="text-gray-600 text-sm">
              Connect and sync data from Google Sheets
            </p>
          </div>
        </div>
      </div>

      {/* Active Tab Content */}
      {activeTab && (
        <div className="yeti-card rounded-2xl p-8 yeti-shadow">
          {activeTab === "text" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">
                  Add Text Knowledge
                </h3>
                <button
                  onClick={() => setActiveTab(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              {submitError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                  {submitError}
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={textTitle}
                  onChange={(e) => setTextTitle(e.target.value)}
                  placeholder="e.g., Brand Guidelines"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Knowledge Content
                </label>
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Enter your knowledge content here... You can paste articles, documentation, FAQs, or any text-based information that your AI agents should know."
                  rows={12}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                />
                <p
                  className={`text-sm mt-2 ${
                    textContent.length > MAX_CONTENT_LENGTH
                      ? "text-red-600"
                      : "text-gray-500"
                  }`}
                >
                  {textContent.length} characters
                  {textContent.length > MAX_CONTENT_LENGTH &&
                    ` (exceeds ${MAX_CONTENT_LENGTH} limit)`}
                </p>
              </div>

              {/* Category and Importance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={textCategory}
                    onChange={(e) => setTextCategory(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                  >
                    <option value="branding">Branding</option>
                    <option value="products">Products</option>
                    <option value="policies">Policies</option>
                    <option value="support">Support</option>
                    <option value="operations">Operations</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Importance
                  </label>
                  <div className="px-3 py-2 border border-gray-200 rounded-lg">
                    <input
                      type="range"
                      min={1}
                      max={4}
                      step={1}
                      value={importanceLevel}
                      onChange={(e) =>
                        setImportanceLevel(parseInt(e.target.value, 10))
                      }
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Low</span>
                      <span>Normal</span>
                      <span>High</span>
                      <span>Critical</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map((t, i) => (
                    <span
                      key={`${t}-${i}`}
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-700"
                    >
                      {t}
                      <button
                        type="button"
                        onClick={() =>
                          setTags((prev) => prev.filter((_, idx) => idx !== i))
                        }
                        className="text-purple-700 hover:text-purple-900"
                        aria-label={`Remove ${t}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (
                      (e.key === "Enter" || e.key === ",") &&
                      tagInput.trim()
                    ) {
                      e.preventDefault();
                      const newTag = tagInput.trim();
                      if (!tags.includes(newTag)) {
                        setTags((prev) => [...prev, newTag]);
                      }
                      setTagInput("");
                    }
                  }}
                  placeholder="Type a tag and press Enter"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={async () => {
                    const activeWorkspaceId = workspaceId;
                    if (!activeWorkspaceId) {
                      setSubmitError("Please select a workspace first");
                      return;
                    }
                    setSubmitError(null);
                    const importance: KnowledgeImportance =
                      importanceLevel === 1
                        ? "low"
                        : importanceLevel === 2
                        ? "normal"
                        : importanceLevel === 3
                        ? "high"
                        : "critical";
                    if (!textTitle.trim()) {
                      setSubmitError("Title is required");
                      return;
                    }
                    if (!textContent.trim()) {
                      setSubmitError("Content is required");
                      return;
                    }
                    try {
                      setSubmittingText(true);
                      await knowledgeAPI.addTextKnowledge(activeWorkspaceId, {
                        title: textTitle.trim(),
                        content:
                          textContent.length > MAX_CONTENT_LENGTH
                            ? textContent.slice(0, MAX_CONTENT_LENGTH)
                            : textContent.trim(),
                        category: textCategory,
                        importance,
                        tags,
                      });
                      await ActivityLogger.logKnowledgeUpdate(
                        activeWorkspaceId,
                        "text",
                        `Added text knowledge: ${textTitle.trim()}`
                      );
                      await loadKnowledge(activeWorkspaceId);
                      if ((window as any).refreshDashboardActivities) {
                        (window as any).refreshDashboardActivities();
                      }
                      setTextTitle("");
                      setTextContent("");
                      setTextCategory("branding");
                      setImportanceLevel(2);
                      setTags([]);
                      setTagInput("");
                      setActiveTab(null);
                    } catch (error: any) {
                      setSubmitError(
                        error?.message || "Failed to add text knowledge"
                      );
                    } finally {
                      setSubmittingText(false);
                    }
                  }}
                  disabled={
                    submittingText || !textTitle.trim() || !textContent.trim()
                  }
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingText ? "Saving..." : "Add to Knowledge Base"}
                </button>
                <button
                  onClick={() => {
                    resetTextForm();
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          {activeTab === "pdf" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">
                  Upload PDF Documents
                </h3>
                <button
                  onClick={() => setActiveTab(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl text-white">📄</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Upload PDF Files
                </h4>
                <p className="text-gray-600 mb-4">
                  Drag and drop PDF files here, or click to browse
                </p>

                <input
                  type="file"
                  accept=".pdf"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="pdf-upload"
                  disabled={isProcessingPdfs}
                />
                <label
                  htmlFor="pdf-upload"
                  className={`bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold transition-all inline-block ${
                    isProcessingPdfs
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:from-red-700 hover:to-pink-700 cursor-pointer"
                  }`}
                >
                  {isProcessingPdfs ? "Uploading..." : "Choose PDF Files"}
                </label>
              </div>

              {pdfError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                  {pdfError}
                </div>
              )}

              {pdfSuccessMessage && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-700">
                  {pdfSuccessMessage}
                </div>
              )}

              {uploadedFiles.length > 0 && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-gray-900">
                      Uploaded Files
                    </h4>
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-red-500 text-xl">📄</span>
                          <span className="text-sm font-medium text-gray-900">
                            {file.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setUploadedFiles((prev) => {
                              const next = prev.filter((_, i) => i !== index);
                              if (next.length === 0) {
                                setPdfTitle("");
                                setPdfTags([]);
                                setPdfTagInput("");
                                setPdfCategory("branding");
                                setPdfImportanceLevel(3);
                              }
                              return next;
                            });
                            setPdfError(null);
                            setPdfSuccessMessage(null);
                          }}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        value={pdfTitle}
                        onChange={(e) => setPdfTitle(e.target.value)}
                        placeholder="e.g., Brand Guidelines"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        This title and metadata apply to all selected files.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category
                        </label>
                        <select
                          value={pdfCategory}
                          onChange={(e) => setPdfCategory(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all bg-white"
                        >
                          <option value="branding">Branding</option>
                          <option value="products">Products</option>
                          <option value="policies">Policies</option>
                          <option value="support">Support</option>
                          <option value="operations">Operations</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Importance
                        </label>
                        <div className="px-3 py-2 border border-gray-200 rounded-lg">
                          <input
                            type="range"
                            min={1}
                            max={4}
                            step={1}
                            value={pdfImportanceLevel}
                            onChange={(e) =>
                              setPdfImportanceLevel(
                                parseInt(e.target.value, 10)
                              )
                            }
                            className="w-full accent-red-500"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Low</span>
                            <span>Normal</span>
                            <span>High</span>
                            <span>Critical</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tags
                      </label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {pdfTags.map((t, i) => (
                          <span
                            key={`${t}-${i}`}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-700"
                          >
                            {t}
                            <button
                              type="button"
                              onClick={() =>
                                setPdfTags((prev) =>
                                  prev.filter((_, idx) => idx !== i)
                                )
                              }
                              className="text-purple-700 hover:text-purple-900"
                              aria-label={`Remove ${t}`}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                      <input
                        type="text"
                        value={pdfTagInput}
                        onChange={(e) => setPdfTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (
                            (e.key === "Enter" || e.key === ",") &&
                            pdfTagInput.trim()
                          ) {
                            e.preventDefault();
                            const newTag = pdfTagInput.trim();
                            if (!pdfTags.includes(newTag)) {
                              setPdfTags((prev) => [...prev, newTag]);
                            }
                            setPdfTagInput("");
                          }
                        }}
                        placeholder="Type a tag and press Enter"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={handleProcessPDFs}
                  disabled={uploadedFiles.length === 0 || isProcessingPdfs}
                  className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-red-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessingPdfs
                    ? "Uploading..."
                    : "Upload to Knowledge Base"}
                </button>
                <button
                  onClick={resetPdfForm}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}

          {activeTab === "sheets" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">
                  Connect Google Sheets
                </h3>
                <button
                  onClick={() => {
                    setActiveTab(null);
                    setSheetsConnected(false);
                    setClickedTemplateIndex(null);
                    setShowLinkInput(false);
                    setGoogleSheetLink("");
                    setShowTemplateCards(false);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              {googleSheets.length > 0 && !showTemplateCards ? (
                <div className="space-y-4">
                  {sheetsError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                      {sheetsError}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg flex-1">
                      <span className="text-green-500 text-xl">✅</span>
                      <span className="text-green-700 font-medium">
                        Google Sheet Connected
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 px-3">
                      Only one sheet allowed per workspace
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      ℹ️ You can view and manage your connected Google Sheet in
                      the Knowledge Library below.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-gray-900">
                      Connected Sheets
                    </h4>
                    {sheetsLoading && (
                      <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                        <span className="ml-2 text-sm text-gray-600">
                          Refreshing...
                        </span>
                      </div>
                    )}
                    <div className="space-y-2">
                      {googleSheets.map((sheet) => {
                        const sheetTypeLabel = sheet.sheet_type
                          ? sheet.sheet_type
                              .split("_")
                              .map(
                                (word) =>
                                  word.charAt(0).toUpperCase() + word.slice(1)
                              )
                              .join(" ")
                          : "General";
                        const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheet.sheet_id}/edit`;

                        return (
                          <div
                            key={sheet.id}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center space-x-3 flex-1">
                              <span className="text-green-500 text-xl">📊</span>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <a
                                    href={sheetUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm font-medium text-gray-900 hover:text-green-600 transition-colors"
                                  >
                                    {sheetTypeLabel} Sheet
                                  </a>
                                  <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded">
                                    {sheet.sheet_type || "general"}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  Sheet ID: {sheet.sheet_id}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Connected: {formatDateTime(sheet.created_at)}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteSheet(sheet.id)}
                              className="ml-4 px-3 py-1.5 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                              title="Disconnect this sheet"
                            >
                              Disconnect
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {googleSheets.length === 0 && (
                    <div className="pt-4 border-t border-gray-200">
                      <button
                        onClick={() => {
                          setShowTemplateCards(true);
                        }}
                        className="w-full px-6 py-3 border-2 border-dashed border-gray-300 text-gray-700 rounded-lg font-medium hover:border-green-500 hover:text-green-600 hover:bg-green-50 transition-all"
                      >
                        + Add Another Google Sheet
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {sheetsError && googleSheets.length === 0 && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-700">
                      ⚠️ {sheetsError} You can still connect a new sheet below.
                    </div>
                  )}
                  {sheetsLoading && googleSheets.length === 0 && (
                    <div className="flex items-center justify-center py-2 text-sm text-gray-500">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                      Loading connected sheets...
                    </div>
                  )}
                  {hasGoogleSheet && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                      <p className="text-sm text-yellow-800">
                        ⚠️ A Google Sheet is already connected to this
                        workspace. You can only connect one sheet per workspace.
                        To add a different sheet, please disconnect the existing
                        one first.
                      </p>
                    </div>
                  )}
                  {googleSheets.length > 0 && (
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-gray-900">
                        Select a Template
                      </h4>
                      <button
                        onClick={() => {
                          setShowTemplateCards(false);
                        }}
                        className="text-sm text-gray-600 hover:text-gray-900"
                      >
                        ← Back to Sheet
                      </button>
                    </div>
                  )}
                  <div
                    className={`grid grid-cols-1 lg:grid-cols-2 gap-8 ${
                      hasGoogleSheet ? "pointer-events-none opacity-50" : ""
                    }`}
                  >
                    {/* Template Cards Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      {templateCards.map((template, index) => (
                        <div
                          key={index}
                          onClick={
                            hasGoogleSheet
                              ? undefined
                              : () => handleTemplateClick(index)
                          }
                          className={`bg-gray-900 border border-cyan-400/30 rounded-lg p-6 ${
                            hasGoogleSheet
                              ? ""
                              : "cursor-pointer hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20"
                          } transition-all group`}
                        >
                          <div className="text-center text-white">
                            <h4 className="text-lg font-semibold group-hover:text-cyan-300 transition-colors">
                              {template}
                            </h4>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Instruction Panel */}
                    <div
                      className={`bg-teal-500 rounded-lg p-6 text-white ${
                        hasGoogleSheet ? "opacity-50" : ""
                      }`}
                    >
                      <div className="space-y-6">
                        {/* Make a Copy Section */}
                        <div>
                          <h4 className="text-lg font-bold mb-3">
                            Make a Copy
                          </h4>
                          <p className="text-sm leading-relaxed">
                            Open this template sheet. Click File → Make a copy
                            to save it to your own Google Drive.
                          </p>
                        </div>

                        {/* Share With the AI Agent Section */}
                        <div>
                          <h4 className="text-lg font-bold mb-3">
                            Share With the AI Agent
                          </h4>
                          <p className="text-sm leading-relaxed">
                            Share your copy with:{" "}
                            <a
                              href="mailto:ai.agent.dispatch@gmail.com"
                              className="underline hover:text-teal-100 transition-colors"
                            >
                              ai.agent.dispatch@gmail.com
                            </a>
                            <br />
                            Make sure to give Edit Access so the AI can update
                            results.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Knowledge Base Summary */}
      <div className="yeti-card rounded-2xl p-8 yeti-shadow">
        <h3 className="text-xl font-bold text-gray-900 mb-6">
          Knowledge Base Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {textDocumentsCount}
            </div>
            <div className="text-sm text-gray-600">Text Documents</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">
              {pdfFilesCount}
            </div>
            <div className="text-sm text-gray-600">PDF Files</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {connectedSheetsCount}
            </div>
            <div className="text-sm text-gray-600">Connected Sheets</div>
          </div>
        </div>
      </div>

      <div className="yeti-card rounded-2xl p-8 yeti-shadow">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Knowledge Library
            </h3>
            <p className="text-sm text-gray-500">
              {!workspaceId
                ? "Select a workspace to load knowledge"
                : knowledgeLoading &&
                  knowledgeItems.length === 0 &&
                  googleSheets.length === 0
                ? "Loading knowledge..."
                : (() => {
                    const totalItems =
                      knowledgeItems.length + googleSheets.length;
                    if (totalItems === 0) return "No items available";
                    if (totalItems === 1) return "1 item available";
                    return `${totalItems} items available`;
                  })()}
            </p>
          </div>
          {workspaceId && (
            <button
              onClick={handleRefreshKnowledge}
              disabled={knowledgeLoading}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {knowledgeLoading ? "Refreshing..." : "Refresh"}
            </button>
          )}
        </div>

        {!workspaceId ? (
          <div className="p-6 border border-dashed border-gray-200 rounded-xl text-sm text-gray-500 text-center">
            Choose a workspace to view its knowledge items.
          </div>
        ) : knowledgeError ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {knowledgeError}
          </div>
        ) : knowledgeLoading && knowledgeItems.length === 0 ? (
          <div className="text-sm text-gray-500">Loading knowledge...</div>
        ) : knowledgeItems.length === 0 && googleSheets.length === 0 ? (
          <div className="p-6 border border-dashed border-gray-200 rounded-xl text-sm text-gray-500 text-center">
            No knowledge items yet. Add text, upload PDFs, or connect a Google
            Sheet to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {knowledgeLoading && (
              <div className="text-xs text-gray-500">Refreshing...</div>
            )}
            {knowledgeItems.map((item) => {
              const normalizedType =
                (item.file_type ?? "").trim().toLowerCase() || "text";
              const typeLabel = normalizedType.toUpperCase();
              const typeDisplay =
                normalizedType.charAt(0).toUpperCase() +
                normalizedType.slice(1);

              return (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-xl bg-white/80 p-5 shadow-sm"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {item.title}
                        </h4>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                          {typeLabel}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        <span className="inline-flex items-center gap-1">
                          <span className="font-medium text-gray-600">
                            File type:
                          </span>
                          {typeDisplay}
                        </span>
                        {item.category && (
                          <span className="inline-flex items-center gap-1">
                            <span className="font-medium text-gray-600">
                              Category:
                            </span>
                            {item.category}
                          </span>
                        )}
                        {item.importance && (
                          <span className="inline-flex items-center gap-1 capitalize">
                            <span className="font-medium text-gray-600">
                              Importance:
                            </span>
                            {item.importance}
                          </span>
                        )}
                        {typeof item.usage_count === "number" && (
                          <span className="inline-flex items-center gap-1">
                            <span className="font-medium text-gray-600">
                              Usage:
                            </span>
                            {item.usage_count}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1">
                          <span className="font-medium text-gray-600">
                            Created:
                          </span>
                          {formatDateTime(item.created_at)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <span className="font-medium text-gray-600">
                            Last used:
                          </span>
                          {formatDateTime(item.last_used_at, "Never")}
                        </span>
                      </div>
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {item.tags.map((tag, idx) => (
                            <span
                              key={`${item.id}-tag-${idx}`}
                              className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 md:flex-col md:items-end">
                      {item.file_url && (
                        <a
                          href={item.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-purple-600 hover:text-purple-700"
                        >
                          View file
                        </a>
                      )}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (navigator?.clipboard?.writeText) {
                              navigator.clipboard.writeText(item.id);
                            }
                          }}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Copy ID
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteKnowledge(
                              item.entry_id || item.id,
                              item.title
                            )
                          }
                          className="text-sm font-medium text-red-600 hover:text-red-700"
                          title="Delete this knowledge entry"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Display Google Sheets in Knowledge Library */}
            {googleSheets.map((sheet) => {
              const sheetTypeLabel = sheet.sheet_type
                ? sheet.sheet_type
                    .split("_")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")
                : "General";
              const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheet.sheet_id}/edit`;

              return (
                <div
                  key={sheet.id}
                  className="border border-gray-200 rounded-xl bg-white/80 p-5 shadow-sm"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {sheetTypeLabel} Google Sheet
                        </h4>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          GOOGLE SHEETS
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        <span className="inline-flex items-center gap-1">
                          <span className="font-medium text-gray-600">
                            Sheet ID:
                          </span>
                          <code className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">
                            {sheet.sheet_id}
                          </code>
                        </span>
                        {sheet.sheet_type && (
                          <span className="inline-flex items-center gap-1 capitalize">
                            <span className="font-medium text-gray-600">
                              Type:
                            </span>
                            {sheetTypeLabel}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1">
                          <span className="font-medium text-gray-600">
                            Connected:
                          </span>
                          {formatDateTime(sheet.created_at)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <span className="font-medium text-gray-600">
                            Updated:
                          </span>
                          {formatDateTime(sheet.updated_at)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 md:flex-col md:items-end">
                      <a
                        href={sheetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-green-600 hover:text-green-700"
                      >
                        Open Sheet →
                      </a>
                      <button
                        onClick={() => handleDeleteSheet(sheet.id)}
                        className="text-sm font-medium text-red-600 hover:text-red-700"
                        title="Disconnect this sheet"
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Link Input Modal */}
      {showLinkInput && clickedTemplateIndex !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                Share Your Google Sheet
              </h3>
              <button
                onClick={() => {
                  setShowLinkInput(false);
                  setGoogleSheetLink("");
                  setLinkInputError(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <p className="text-sm text-gray-600">
              Please paste the link to your copied Google Sheet for{" "}
              <strong>{templateCards[clickedTemplateIndex]}</strong>
            </p>

            {linkInputError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                {linkInputError}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Google Sheets Link
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={googleSheetLink}
                  onChange={(e) => {
                    setGoogleSheetLink(e.target.value);
                    // Real-time validation feedback
                    if (e.target.value.trim()) {
                      const validation = validateGoogleSheetsLink(
                        e.target.value
                      );
                      if (!validation.isValid) {
                        setLinkInputError(validation.error || "");
                      } else {
                        setLinkInputError(null);
                      }
                    } else {
                      setLinkInputError(null);
                    }
                  }}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all ${
                    googleSheetLink.trim() && !linkInputError
                      ? validateGoogleSheetsLink(googleSheetLink).isValid
                        ? "border-green-500 focus:border-green-500"
                        : "border-gray-300"
                      : linkInputError
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-300"
                  }`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSubmitLink();
                    }
                  }}
                />
                {googleSheetLink.trim() &&
                  validateGoogleSheetsLink(googleSheetLink).isValid && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <svg
                        className="w-5 h-5 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
              </div>
              {linkInputError && (
                <p className="mt-1 text-xs text-red-600">{linkInputError}</p>
              )}
              {googleSheetLink.trim() &&
                validateGoogleSheetsLink(googleSheetLink).isValid && (
                  <p className="mt-1 text-xs text-green-600">
                    ✓ Valid Google Sheets link
                  </p>
                )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleSubmitLink}
                disabled={
                  submittingSheet ||
                  !validateGoogleSheetsLink(googleSheetLink).isValid
                }
                className="flex-1 bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-teal-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingSheet ? "Connecting..." : "Connect"}
              </button>
              <button
                onClick={() => {
                  setShowLinkInput(false);
                  setGoogleSheetLink("");
                  setLinkInputError(null);
                  setClickedTemplateIndex(null);
                }}
                disabled={submittingSheet}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
