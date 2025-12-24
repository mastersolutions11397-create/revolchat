"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ElementType,
} from "react";
import { User } from "@supabase/supabase-js";
import { useAuth } from "@/lib/auth-context";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import { useOnboardingTour } from "@/lib/contexts/OnboardingTourContext";
import { knowledgeAPI } from "@/lib/api/knowledge";
import type { KnowledgeRecord, KnowledgeImportance } from "@/lib/api/knowledge";
import {
  googleSheetsAPI,
  extractSheetIdFromUrl,
  type GoogleSheet,
} from "@/lib/api/google-sheets";
import { chatAPI } from "@/lib/api/chat";
import ReactMarkdown from "react-markdown";
import Image from "next/image";
import {
  Eye,
  ExternalLink,
  FileDown,
  FileSpreadsheet,
  FileText,
  Plus,
  Trash2,
  X,
  Loader2,
  SendHorizontal,
  AlertCircle,
  RefreshCcwIcon,
  Info,
  Link as LinkIcon,
} from "lucide-react";

type PreviewTarget =
  | { kind: "knowledge"; item: KnowledgeRecord }
  | { kind: "sheet"; item: GoogleSheet };

type KnowledgeTableRow =
  | {
      kind: "knowledge";
      id: string;
      title: string;
      typeDisplay: string;
      icon: ElementType;
      category: string;
      usage: string;
      updated: string;
      importance: string | null;
      link: string | null;
      deleteId: string;
      item: KnowledgeRecord;
    }
  | {
      kind: "sheet";
      id: string;
      title: string;
      typeDisplay: string;
      icon: ElementType;
      category: string;
      usage: string;
      updated: string;
      importance: null;
      link: string | null;
      deleteId: string;
      sheet: GoogleSheet;
    };

export default function KnowledgePage() {
  const { user } = useAuth();
  console.log("user", user);
  const { currentWorkspace, selectedWorkspaceId } = useWorkspace();
  const { onNavigateToKnowledgeBase, onKnowledgeBaseCompleted, onTestAgentMessageCompleted } = useOnboardingTour();
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

  // Trigger tour callback when landing on knowledge base page
  useEffect(() => {
    onNavigateToKnowledgeBase();
  }, [onNavigateToKnowledgeBase]);
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
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const addMenuRef = useRef<HTMLDivElement | null>(null);
  const [previewItem, setPreviewItem] = useState<PreviewTarget | null>(null);

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
    const types = ["1", "2", "3", "4"];
    return types[index] || "1";
  };

  // Helper function to format sheet type label
  const formatSheetTypeLabel = (
    sheetType: string | null | undefined
  ): string => {
    if (!sheetType) return "Google Sheet";

    const sheetTypeStr = String(sheetType);
    // Check if it contains underscores (e.g., "order_fulfillment_template")
    if (sheetTypeStr.includes("_")) {
      return sheetTypeStr
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }

    // Handle numeric types (e.g., "1", "2", "3")
    const typeMap: Record<string, string> = {
      "1": "Customer Support Template",
      "2": "Order Fulfillment Template",
      "3": "Lead Generating Template",
      "4": "Appointment Booking Template",
    };
    return typeMap[sheetTypeStr] || "Google Sheet";
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
  const hasKnowledge = knowledgeItems.length > 0 || googleSheets.length > 0;
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

  const tableRows = useMemo<KnowledgeTableRow[]>(() => {
    const knowledgeRows = knowledgeItems.map((item) => {
      const normalizedType =
        (item.file_type ?? "").trim().toLowerCase() || "text";
      const typeDisplay =
        normalizedType.charAt(0).toUpperCase() + normalizedType.slice(1);
      const icon: ElementType = normalizedType === "pdf" ? FileDown : FileText;

      return {
        kind: "knowledge" as const,
        id: item.id,
        title: item.title,
        typeDisplay,
        icon,
        category: item.category || "—",
        usage:
          typeof item.usage_count === "number"
            ? item.usage_count.toString()
            : "—",
        updated: formatDateTime(
          item.last_used_at ||
            (item as { updated_at?: string }).updated_at ||
            item.created_at,
          "Never"
        ),
        importance: item.importance ?? null,
        link: item.file_url || null,
        deleteId: item.entry_id || item.id,
        item,
      };
    });

    const sheetRows = googleSheets.map((sheet) => {
      const sheetTypeLabel =
        typeof sheet.sheet_type === "string" && sheet.sheet_type
          ? sheet.sheet_type
              .split("_")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")
          : "Google Sheet";
      const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheet.sheet_id}/edit`;

      return {
        kind: "sheet" as const,
        id: sheet.id,
        title: `${sheetTypeLabel}`,
        typeDisplay: "Google Sheet",
        icon: FileSpreadsheet as ElementType,
        category: sheetTypeLabel,
        usage: "—",
        updated: formatDateTime(sheet.updated_at),
        importance: null,
        link: sheetUrl,
        deleteId: sheet.id,
        sheet,
      };
    });

    return [...knowledgeRows, ...sheetRows];
  }, [knowledgeItems, googleSheets]);

  const loadKnowledge = useCallback(async (id: string) => {
    setKnowledgeLoading(true);
    setKnowledgeError(null);
    try {
      const response = await knowledgeAPI.getKnowledgeList(id);
      setKnowledgeItems(response?.results ?? []);
    } catch (error: unknown) {
      setKnowledgeError(
        error instanceof Error
          ? error.message
          : "Failed to fetch knowledge for this workspace"
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
    } catch (error: unknown) {
      setSheetsError(
        error instanceof Error
          ? error.message
          : "Failed to fetch Google Sheets for this workspace"
      );
      setGoogleSheets([]);
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

  useEffect(() => {
    if (!isAddMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        addMenuRef.current &&
        event.target instanceof Node &&
        !addMenuRef.current.contains(event.target)
      ) {
        setIsAddMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isAddMenuOpen]);

  useEffect(() => {
    if (!previewItem) return;
    if (
      (previewItem.kind === "knowledge" &&
        !knowledgeItems.some((item) => item.id === previewItem.item.id)) ||
      (previewItem.kind === "sheet" &&
        !googleSheets.some((sheet) => sheet.id === previewItem.item.id))
    ) {
      setPreviewItem(null);
    }
  }, [previewItem, knowledgeItems, googleSheets]);

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

  const closeActiveTab = () => {
    setActiveTab(null);
    setIsAddMenuOpen(false);
  };

  // Check if text/PDF can be added (not allowed if Google Sheet exists)
  const canAddTextOrPdf = !hasGoogleSheet;

  // Check if Google Sheet can be added (not allowed if text/PDF exists or if a sheet already exists)
  const canAddGoogleSheet = knowledgeItems.length === 0 && !hasGoogleSheet;

  const openTextForm = () => {
    if (!canAddTextOrPdf) return;
    resetPdfForm();
    setClickedTemplateIndex(null);
    setShowLinkInput(false);
    setGoogleSheetLink("");
    setActiveTab("text");
    setIsAddMenuOpen(false);
  };

  const openPdfForm = () => {
    if (!canAddTextOrPdf) return;
    resetTextForm();
    setClickedTemplateIndex(null);
    setShowLinkInput(false);
    setGoogleSheetLink("");
    setActiveTab("pdf");
    setIsAddMenuOpen(false);
  };

  const openSheetsForm = () => {
    if (!canAddGoogleSheet) return;
    resetTextForm();
    resetPdfForm();
    setClickedTemplateIndex(null);
    setShowLinkInput(false);
    setGoogleSheetLink("");
    setActiveTab("sheets");
    setIsAddMenuOpen(false);
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

      // Refresh Google Sheets list
      await loadGoogleSheets(workspaceId);

      // Reset states and close modals
      setGoogleSheetLink("");
      setShowLinkInput(false);
      setClickedTemplateIndex(null);
      setShowTemplateCards(false);
      
      // Trigger tour callback after a small delay to ensure modals are closed
      setTimeout(() => {
        onKnowledgeBaseCompleted();
      }, 100);
    } catch (error: unknown) {
      setLinkInputError(
        error instanceof Error
          ? error.message
          : "Failed to save Google Sheet link"
      );
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

      // Refresh Google Sheets list
      await loadGoogleSheets(workspaceId);
    } catch (error: unknown) {
      setSheetsError(
        error instanceof Error ? error.message : "Failed to delete Google Sheet"
      );
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

      // Refresh knowledge list
      await loadKnowledge(workspaceId);
    } catch (error: unknown) {
      setKnowledgeError(
        error instanceof Error
          ? error.message
          : "Failed to delete knowledge entry"
      );
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

      await loadKnowledge(activeWorkspaceId);

      setPdfSuccessMessage(`${summary} successfully.`);
      setUploadedFiles([]);
      setPdfTitle("");
      setPdfCategory("branding");
      setPdfImportanceLevel(3);
      setPdfTags([]);
      setPdfTagInput("");
      
      // Close the PDF form tab
      closeActiveTab();
      
      // Trigger tour callback after a small delay to ensure modal is closed
      setTimeout(() => {
        onKnowledgeBaseCompleted();
      }, 100);
    } catch (error: unknown) {
      const message =
        (error instanceof Error ? error.message : undefined) ||
        (typeof error === "string" ? error : "Failed to process PDF files");
      setPdfError(message);
    } finally {
      setIsProcessingPdfs(false);
    }
  };

  // Tooltip Component
  const Tooltip = ({
    text,
    children,
  }: {
    text: string;
    children?: React.ReactNode;
  }) => {
    const [show, setShow] = useState(false);
    return (
      <div className="relative inline-flex items-center group">
        {children}
        <button
          type="button"
          onMouseEnter={() => setShow(true)}
          onMouseLeave={() => setShow(false)}
          className="ml-1.5 text-slate-400 hover:text-sky-500 transition-colors"
        >
          <Info className="h-3.5 w-3.5" />
        </button>
        {show && (
          <div className="absolute left-0 top-full mt-2 z-50 w-56 rounded-lg bg-slate-900/95 backdrop-blur-md px-3 py-2 text-xs text-white shadow-xl border border-white/10 animate-in fade-in slide-in-from-top-1 duration-200">
            {text}
            <div className="absolute -top-1 left-4 h-2 w-2 rotate-45 bg-slate-900/95 border-l border-t border-white/10"></div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto lg:min-h-[calc(100vh-8rem)]">
      {/* Header - Navy Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900 p-8 text-white shadow-xl overflow-visible">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-sky-500/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-64 w-64 rounded-full bg-sky-500/20 blur-3xl"></div>

        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md shadow-inner border border-white/20">
              <FileText className="h-8 w-8 text-sky-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                Knowledge Base
              </h1>
              <p className="mt-2 text-lg text-sky-100/80 max-w-xl">
                Manage knowledge and chat with your data in one place.
              </p>
            </div>
          </div>

          <div className="relative z-50" ref={addMenuRef}>
            <button
              type="button"
              data-tour="add-knowledge-button"
              onClick={() => setIsAddMenuOpen((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-xl bg-white text-slate-900 px-6 py-3 text-sm font-bold transition-all hover:bg-sky-50 hover:text-sky-700 shadow-lg shadow-black/10 active:scale-[0.98]"
            >
              <Plus className="h-5 w-5" />
              Add Knowledge
            </button>
            {isAddMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 origin-top-right rounded-2xl border border-slate-200 bg-white p-2 shadow-xl ring-1 ring-black/5 focus:outline-none animate-in fade-in zoom-in-95 duration-200 z-[1000]">
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={openTextForm}
                    disabled={!canAddTextOrPdf}
                    className={`flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left transition-colors ${
                      canAddTextOrPdf
                        ? "hover:bg-slate-50 cursor-pointer"
                        : "opacity-50 cursor-not-allowed"
                    } group relative`}
                    title={
                      !canAddTextOrPdf
                        ? "Cannot add text when a Google Sheet is connected"
                        : ""
                    }
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-500 ${canAddTextOrPdf ? "group-hover:scale-110" : ""} transition-transform`}
                    >
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">
                        Text Document
                      </div>
                      <div className="text-xs text-slate-500 font-medium">
                        {canAddTextOrPdf
                          ? "Write or paste knowledge"
                          : "Unavailable (Sheet connected)"}
                      </div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={openPdfForm}
                    disabled={!canAddTextOrPdf}
                    className={`flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left transition-colors ${
                      canAddTextOrPdf
                        ? "hover:bg-slate-50 cursor-pointer"
                        : "opacity-50 cursor-not-allowed"
                    } group relative`}
                    title={
                      !canAddTextOrPdf
                        ? "Cannot add PDF when a Google Sheet is connected"
                        : ""
                    }
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 text-rose-600 ${canAddTextOrPdf ? "group-hover:scale-110" : ""} transition-transform`}
                    >
                      <FileDown className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">
                        PDF Upload
                      </div>
                      <div className="text-xs text-slate-500 font-medium">
                        {canAddTextOrPdf
                          ? "Import multi-page documents"
                          : "Unavailable (Sheet connected)"}
                      </div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={openSheetsForm}
                    disabled={!canAddGoogleSheet}
                    className={`flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left transition-colors ${
                      canAddGoogleSheet
                        ? "hover:bg-slate-50 cursor-pointer"
                        : "opacity-50 cursor-not-allowed"
                    } group relative`}
                    title={
                      !canAddGoogleSheet
                        ? hasGoogleSheet
                          ? "Only one Google Sheet allowed per workspace"
                          : "Cannot add Google Sheet when text/PDF exists"
                        : ""
                    }
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 ${canAddGoogleSheet ? "group-hover:scale-110" : ""} transition-transform`}
                    >
                      <FileSpreadsheet className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">
                        Google Sheet
                      </div>
                      <div className="text-xs text-slate-500 font-medium">
                        {canAddGoogleSheet
                          ? "Sync structured data"
                          : hasGoogleSheet
                            ? "Already connected"
                            : "Unavailable (Text/PDF exists)"}
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Knowledge & Chat Layout */}
      <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
        <div className="flex h-[522px] flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 bg-gradient-to-br from-slate-50 via-sky-50/20 to-slate-50 px-6 py-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-sky-500" />
                Knowledge Library
              </h3>
              <p className="text-sm text-slate-600 mt-1">
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
            <div className="flex items-center gap-4">
              <div className="hidden xl:flex items-center gap-4">
                <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 ">
                  <FileText className="h-4 w-4 text-sky-500" />
                  <span className="text-xs font-medium text-slate-700">
                    Text
                  </span>
                  <div className="flex items-center justify-center size-6 rounded-full bg-sky-100">
                    <span className="text-xs font-bold text-sky-700">
                      {textDocumentsCount}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 ">
                  <FileDown className="h-4 w-4 text-sky-500" />
                  <span className="text-xs font-medium text-slate-700">
                    PDF
                  </span>
                  <div className="flex items-center justify-center size-6 rounded-full shrink-0 bg-sky-100">
                    <span className="text-xs font-bold text-sky-700">
                      {pdfFilesCount}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 ">
                  <FileSpreadsheet className="h-4 w-4 text-sky-500" />
                  <span className="text-xs font-medium text-slate-700">
                    Sheets
                  </span>
                  <div className="flex items-center justify-center size-6 rounded-full shrink-0 bg-sky-100">
                    <span className="text-xs font-bold text-sky-700">
                      {connectedSheetsCount}
                    </span>
                  </div>
                </div>
              </div>
              {workspaceId && (
                <button
                  onClick={handleRefreshKnowledge}
                  disabled={knowledgeLoading}
                  className="inline-flex items-center gap-2 rounded-lg  bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-all hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-50 "
                >
                  <RefreshCcwIcon className="h-4 w-4 text-sky-500" />
                  Refresh
                </button>
              )}
            </div>
          </div>
          {/* On small screens, keep summary below as a grid */}
          <div className="border-b border-slate-200 bg-slate-50/30 px-6 py-3 xl:hidden">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 shadow-sm border border-slate-200">
                <FileText className="h-4 w-4 text-sky-500" />
                <span className="text-xs font-medium text-slate-700">Text</span>
                <div className="flex items-center justify-center size-6 rounded-full bg-sky-100">
                  <span className="text-xs font-bold p-1 text-sky-700">
                    {textDocumentsCount}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 shadow-sm border border-slate-200">
                <FileDown className="h-4 w-4 text-sky-500" />
                <span className="text-xs font-medium text-slate-700">PDF</span>
                <div className="flex items-center justify-center size-6 rounded-full shrink-0 bg-sky-100">
                  <span className="text-xs font-bold p-1 text-sky-700">
                    {pdfFilesCount}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 shadow-sm border border-slate-200">
                <FileSpreadsheet className="h-4 w-4 text-sky-500" />
                <span className="text-xs font-medium text-slate-700">
                  Sheets
                </span>
                <div className="flex items-center justify-center size-6 rounded-full bg-emerald-100">
                  <span className="text-xs font-bold p-1 text-sky-700">
                    {connectedSheetsCount}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="h-full overflow-hidden">
            <div className="flex h-full flex-col">
              <div className="flex-1 overflow-y-auto ">
                {!workspaceId ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-500">
                        <FileText className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        Select a workspace
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Choose a workspace to view its knowledge items.
                      </p>
                    </div>
                  </div>
                ) : knowledgeError ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
                    {knowledgeError}
                  </div>
                ) : knowledgeLoading && tableRows.length === 0 ? (
                  <div className="space-y-4">
                    {/* Skeleton table container */}
                    <div className="overflow-hidden border border-gray-100 bg-white">
                      {/* Header skeleton */}
                      <div className="border-b border-gray-100 bg-gray-50 px-6 py-3">
                        <div className="h-3 w-24 rounded bg-gray-200 animate-pulse" />
                      </div>
                      {/* Rows skeleton */}
                      <div className="divide-y divide-gray-100">
                        {Array.from({ length: 8 }).map((_, index) => (
                          <div
                            key={index}
                            className="grid grid-cols-[minmax(0,1fr),auto] items-center gap-3 px-3 py-3"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-gray-200 animate-pulse" />
                                <div className="min-w-0 space-y-2">
                                  <div className="h-3 w-40 rounded bg-gray-200 animate-pulse" />
                                  <div className="h-2 w-24 rounded bg-gray-200 animate-pulse" />
                                </div>
                              </div>
                              <div className="flex items-center justify-end gap-2">
                                <div className="h-7 w-7 rounded-md bg-gray-200 animate-pulse" />
                                <div className="h-7 w-7 rounded-md bg-gray-200 animate-pulse" />
                                <div className="h-7 w-7 rounded-md bg-gray-200 animate-pulse" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : tableRows.length === 0 ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-500">
                        <FileText className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        No knowledge yet
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Use “Add Knowledge” to get started.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="">
                    <div className="overflow-hidden border border-gray-100 bg-white shadow-sm">
                      <div className="grid grid-cols-[minmax(0,1fr),auto] items-center border-b border-gray-100 bg-gray-50 px-6 py-2 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                        <div className="flex items-center justify-between gap-3">
                          <div>File</div>
                          <div>Actions</div>
                        </div>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {tableRows.map((row) => {
                          const Icon = row.icon;
                          const isSelected =
                            (previewItem?.kind === "knowledge" &&
                              row.kind === "knowledge" &&
                              previewItem.item.id === row.id) ||
                            (previewItem?.kind === "sheet" &&
                              row.kind === "sheet" &&
                              previewItem.item.id === row.id);

                          return (
                            <div
                              key={`${row.kind}-${row.id}`}
                              className={`grid grid-cols-[minmax(0,1fr),auto] h-[60px] items-center gap-3 px-3  text-xs transition ${
                                isSelected
                                  ? "border-l-2 border-sky-500 bg-sky-50/70"
                                  : "hover:bg-gray-50"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex py-2 items-center gap-3">
                                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-500 shadow-inner">
                                    <Icon className="h-4 w-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="truncate font-medium text-gray-900">
                                      {row.title}
                                    </p>
                                    <p className="text-[10px] text-gray-500">
                                      {row.typeDisplay}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center justify-end gap-1.5 py-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPreviewItem(
                                      row.kind === "knowledge"
                                        ? { kind: "knowledge", item: row.item }
                                        : { kind: "sheet", item: row.sheet }
                                    )
                                  }
                                  className="group inline-flex h-8 w-8 items-center justify-center rounded-lg border-2 border-slate-200 bg-white text-slate-500 transition-all hover:border-sky-300 hover:bg-sky-50 hover:text-sky-500 hover:scale-105 active:scale-95 shadow-sm"
                                  title="Preview"
                                >
                                  <Eye className="h-4 w-4 transition-transform group-hover:scale-110" />
                                </button>
                                {row.link && (
                                  <a
                                    href={row.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group inline-flex h-8 w-8 items-center justify-center rounded-lg border-2 border-slate-200 bg-white text-slate-500 transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-sky-500 hover:scale-105 active:scale-95 shadow-sm"
                                    title="Open in new tab"
                                  >
                                    <ExternalLink className="h-4 w-4 transition-transform group-hover:scale-110" />
                                  </a>
                                )}
                                <button
                                  type="button"
                                  onClick={() =>
                                    row.kind === "knowledge"
                                      ? handleDeleteKnowledge(
                                          row.deleteId,
                                          row.item.title
                                        )
                                      : handleDeleteSheet(row.deleteId)
                                  }
                                  className="group inline-flex h-8 w-8 items-center justify-center rounded-lg border-2 border-slate-200 bg-white text-slate-500 transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-600 hover:scale-105 active:scale-95 shadow-sm"
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4 transition-transform group-hover:scale-110" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {previewItem && (
                <div
                  className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                  onClick={() => setPreviewItem(null)}
                >
                  <div
                    className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white shadow-xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-4 py-3">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          {previewItem.kind === "knowledge"
                            ? previewItem.item.title
                            : formatSheetTypeLabel(previewItem.item.sheet_type)}
                        </h4>
                        <p className="text-xs text-gray-600">
                          {previewItem.kind === "knowledge"
                            ? (
                                previewItem.item.file_type || "Text"
                              ).toUpperCase()
                            : "GOOGLE SHEET"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPreviewItem(null)}
                        className="rounded-full border border-transparent p-1 text-gray-500 transition hover:border-gray-300 hover:text-gray-700"
                        title="Close preview"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid gap-4 p-4 text-sm text-gray-700 md:grid-cols-2">
                      {previewItem.kind === "knowledge" ? (
                        <>
                          <div>
                            <p className="text-xs uppercase text-gray-500">
                              Category
                            </p>
                            <p className="font-medium">
                              {previewItem.item.category || "—"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs uppercase text-gray-500">
                              Importance
                            </p>
                            <p className="font-medium capitalize">
                              {previewItem.item.importance || "Normal"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs uppercase text-gray-500">
                              Created
                            </p>
                            <p className="font-medium">
                              {formatDateTime(previewItem.item.created_at)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs uppercase text-gray-500">
                              Last Used
                            </p>
                            <p className="font-medium">
                              {formatDateTime(
                                previewItem.item.last_used_at,
                                "Never"
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs uppercase text-gray-500">
                              Usage
                            </p>
                            <p className="font-medium">
                              {typeof previewItem.item.usage_count === "number"
                                ? previewItem.item.usage_count
                                : "—"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs uppercase text-gray-500">
                              ID
                            </p>
                            <p className="break-all font-medium">
                              {previewItem.item.entry_id || previewItem.item.id}
                            </p>
                          </div>
                          {previewItem.item.tags &&
                            previewItem.item.tags.length > 0 && (
                              <div className="md:col-span-2">
                                <p className="text-xs uppercase text-gray-500">
                                  Tags
                                </p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {previewItem.item.tags.map((tag, index) => (
                                    <span
                                      key={`${tag}-${index}`}
                                      className="rounded-full bg-white px-3 py-1 text-xs font-medium text-sky-500 shadow-sm"
                                    >
                                      #{tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          {previewItem.item.file_url && (
                            <div className="md:col-span-2">
                              <a
                                href={previewItem.item.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm font-semibold text-sky-500 transition hover:border-sky-300 hover:text-sky-700"
                              >
                                <ExternalLink className="h-4 w-4" />
                                Open Source Document
                              </a>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <div>
                            <p className="text-xs uppercase text-gray-500">
                              Sheet ID
                            </p>
                            <p className="break-all font-medium">
                              {previewItem.item.sheet_id}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs uppercase text-gray-500">
                              Sheet Type
                            </p>
                            <p className="font-medium">
                              {formatSheetTypeLabel(
                                previewItem.item.sheet_type
                              )}
                              {previewItem.item.sheet_type
                                ? previewItem.item.sheet_type
                                    .split("_")
                                    .map(
                                      (word) =>
                                        word.charAt(0).toUpperCase() +
                                        word.slice(1)
                                    )
                                    .join(" ")
                                : "General"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs uppercase text-gray-500">
                              Connected
                            </p>
                            <p className="font-medium">
                              {formatDateTime(previewItem.item.created_at)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs uppercase text-gray-500">
                              Updated
                            </p>
                            <p className="font-medium">
                              {formatDateTime(previewItem.item.updated_at)}
                            </p>
                          </div>
                          <div className="md:col-span-2">
                            <a
                              href={`https://docs.google.com/spreadsheets/d/${previewItem.item.sheet_id}/edit`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm font-semibold text-sky-500 transition hover:border-sky-300 hover:text-sky-700"
                            >
                              <ExternalLink className="h-4 w-4" />
                              Open Google Sheet
                            </a>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="h-[520px] xl:w-[360px] xl:flex-shrink-0">
          <ChatPanel
            workspaceId={workspaceId}
            workspaceName={currentWorkspace?.name ?? null}
            hasKnowledge={hasKnowledge}
            hasGoogleSheet={hasGoogleSheet}
            user={user}
            onTestAgentMessageCompleted={onTestAgentMessageCompleted}
          />
        </div>
      </div>

      {/* Active Tab Content (Modal) */}
      {activeTab && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-h-[90vh] max-w-2xl overflow-y-auto rounded-2xl border border-white/20 bg-white shadow-2xl ring-1 ring-black/5 animate-in zoom-in-95 duration-200">
            {activeTab === "text" && (
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-500 shadow-sm">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        Add Text
                      </h3>
                      <p className="text-xs text-slate-500">
                        Create a new knowledge entry
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      resetTextForm();
                      closeActiveTab();
                    }}
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {submitError && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs font-medium text-red-600 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {submitError}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={textTitle}
                      onChange={(e) => setTextTitle(e.target.value)}
                      placeholder="e.g., Company Overview"
                      className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                      Content
                    </label>
                    <textarea
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                      placeholder="Paste or type your knowledge content here..."
                      rows={5}
                      className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all resize-none placeholder:text-slate-400"
                    />
                    <div className="flex justify-end mt-1">
                      <span
                        className={`text-[10px] font-medium ${textContent.length > MAX_CONTENT_LENGTH ? "text-red-500" : "text-slate-400"}`}
                      >
                        {textContent.length.toLocaleString()} /{" "}
                        {MAX_CONTENT_LENGTH.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4" data-tour="knowledge-options">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5 ml-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Category
                        </label>
                        <Tooltip text="Group your knowledge for better organization and retrieval" />
                      </div>
                      <div className="relative">
                        <select
                          value={textCategory}
                          onChange={(e) => setTextCategory(e.target.value)}
                          className="w-full appearance-none px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                        >
                          <option value="branding">Branding</option>
                          <option value="products">Products</option>
                          <option value="policies">Policies</option>
                          <option value="support">Support</option>
                          <option value="operations">Operations</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 9l-7 7-7-7"
                            ></path>
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5 ml-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Importance
                        </label>
                        <Tooltip text="Set how critical this information is for the AI to know" />
                      </div>
                      <div className="relative">
                        <select
                          value={importanceLevel}
                          onChange={(e) =>
                            setImportanceLevel(parseInt(e.target.value, 10))
                          }
                          className="w-full appearance-none px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                        >
                          <option value={1}>Low Priority</option>
                          <option value={2}>Normal Priority</option>
                          <option value={3}>High Priority</option>
                          <option value={4}>Critical Priority</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 9l-7 7-7-7"
                            ></path>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                      Tags
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2 min-h-[32px]">
                      {tags.map((t, i) => (
                        <span
                          key={`${t}-${i}`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-sky-50 text-sky-700 border border-sky-100"
                        >
                          #{t}
                          <button
                            type="button"
                            onClick={() =>
                              setTags((prev) =>
                                prev.filter((_, idx) => idx !== i)
                              )
                            }
                            className="hover:text-sky-900"
                          >
                            ×
                          </button>
                        </span>
                      ))}
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
                            if (!tags.includes(newTag))
                              setTags((prev) => [...prev, newTag]);
                            setTagInput("");
                          }
                        }}
                        placeholder={
                          tags.length === 0 ? "Type tag & press Enter..." : ""
                        }
                        className="flex-1 min-w-[120px] bg-transparent text-sm focus:outline-none placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    data-tour="save-knowledge-button"
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
                        await loadKnowledge(activeWorkspaceId);
                        resetTextForm();
                        closeActiveTab();
                        // Trigger tour callback after a small delay to ensure modal is closed
                        setTimeout(() => {
                          onKnowledgeBaseCompleted();
                        }, 100);
                      } catch (error: unknown) {
                        setSubmitError(
                          error instanceof Error
                            ? error.message
                            : "Failed to add text knowledge"
                        );
                      } finally {
                        setSubmittingText(false);
                      }
                    }}
                    disabled={
                      submittingText || !textTitle.trim() || !textContent.trim()
                    }
                    className="flex-1 bg-sky-500 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-sky-700 transition-all shadow-lg shadow-sky-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    {submittingText ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                      </span>
                    ) : (
                      "Save Knowledge"
                    )}
                  </button>
                  <button
                    onClick={() => {
                      resetTextForm();
                    }}
                    className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-all active:scale-[0.98]"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            {activeTab === "pdf" && (
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 shadow-sm">
                      <FileDown className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        Upload PDF
                      </h3>
                      <p className="text-xs text-slate-500">
                        Import documents to your library
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      resetPdfForm();
                      closeActiveTab();
                    }}
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-rose-300 hover:bg-rose-50/30 transition-all group">
                  <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <FileDown className="h-8 w-8 text-rose-500" />
                  </div>
                  <h4 className="text-base font-semibold text-slate-900 mb-1">
                    Drop PDF files here
                  </h4>
                  <p className="text-sm text-slate-500 mb-4">
                    or click to browse from your computer
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
                    className={`inline-flex items-center justify-center px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isProcessingPdfs
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : "bg-white border border-slate-200 text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 cursor-pointer"
                    }`}
                  >
                    {isProcessingPdfs ? "Processing..." : "Select Files"}
                  </label>
                </div>

                {pdfError && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs font-medium text-red-600 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {pdfError}
                  </div>
                )}

                {pdfSuccessMessage && (
                  <div className="p-3 bg-green-50 border border-green-100 rounded-xl text-xs font-medium text-green-600">
                    {pdfSuccessMessage}
                  </div>
                )}

                {uploadedFiles.length > 0 && (
                  <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
                        Selected Files
                      </h4>
                      {uploadedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-white flex items-center justify-center text-rose-500 border border-slate-100">
                              <FileDown className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-slate-700 truncate">
                                {file.name}
                              </p>
                              <p className="text-[10px] text-slate-500">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
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
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4 pt-2 border-t border-slate-100">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                          Collection Title
                        </label>
                        <input
                          type="text"
                          value={pdfTitle}
                          onChange={(e) => setPdfTitle(e.target.value)}
                          placeholder="e.g., Q1 Reports"
                          className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all placeholder:text-slate-400"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                            Category
                          </label>
                          <div className="relative">
                            <select
                              value={pdfCategory}
                              onChange={(e) => setPdfCategory(e.target.value)}
                              className="w-full appearance-none px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                            >
                              <option value="branding">Branding</option>
                              <option value="products">Products</option>
                              <option value="policies">Policies</option>
                              <option value="support">Support</option>
                              <option value="operations">Operations</option>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 9l-7 7-7-7"
                                ></path>
                              </svg>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                            Importance
                          </label>
                          <div className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl">
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
                              className="w-full accent-rose-500 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-[10px] font-medium text-slate-400 mt-1.5">
                              <span
                                className={
                                  pdfImportanceLevel === 1
                                    ? "text-rose-600"
                                    : ""
                                }
                              >
                                Low
                              </span>
                              <span
                                className={
                                  pdfImportanceLevel === 2
                                    ? "text-rose-600"
                                    : ""
                                }
                              >
                                Normal
                              </span>
                              <span
                                className={
                                  pdfImportanceLevel === 3
                                    ? "text-rose-600"
                                    : ""
                                }
                              >
                                High
                              </span>
                              <span
                                className={
                                  pdfImportanceLevel === 4
                                    ? "text-rose-600"
                                    : ""
                                }
                              >
                                Critical
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                          Tags
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2 min-h-[32px]">
                          {pdfTags.map((t, i) => (
                            <span
                              key={`${t}-${i}`}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-50 text-rose-700 border border-rose-100"
                            >
                              #{t}
                              <button
                                type="button"
                                onClick={() =>
                                  setPdfTags((prev) =>
                                    prev.filter((_, idx) => idx !== i)
                                  )
                                }
                                className="hover:text-rose-900"
                              >
                                ×
                              </button>
                            </span>
                          ))}
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
                                if (!pdfTags.includes(newTag))
                                  setPdfTags((prev) => [...prev, newTag]);
                                setPdfTagInput("");
                              }
                            }}
                            placeholder={
                              pdfTags.length === 0
                                ? "Type tag & press Enter..."
                                : ""
                            }
                            className="flex-1 min-w-[120px] bg-transparent text-sm focus:outline-none placeholder:text-slate-400"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleProcessPDFs}
                    disabled={uploadedFiles.length === 0 || isProcessingPdfs}
                    className="flex-1 bg-rose-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-rose-700 transition-all shadow-lg shadow-rose-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    {isProcessingPdfs ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />{" "}
                        Uploading...
                      </span>
                    ) : (
                      "Upload Files"
                    )}
                  </button>
                  <button
                    onClick={resetPdfForm}
                    className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-50 hover:text-red-600 hover:border-red-200 transition-all active:scale-[0.98]"
                    title="Clear all files"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      resetPdfForm();
                      closeActiveTab();
                    }}
                    className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-200 transition-all active:scale-[0.98]"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}

            {activeTab === "sheets" && (
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shadow-sm">
                      <FileSpreadsheet className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        Google Sheets
                      </h3>
                      <p className="text-xs text-slate-500">
                        Sync structured data
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setClickedTemplateIndex(null);
                      setShowLinkInput(false);
                      setGoogleSheetLink("");
                      setShowTemplateCards(false);
                      closeActiveTab();
                    }}
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {googleSheets.length > 0 && !showTemplateCards ? (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                    {sheetsError && (
                      <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs font-medium text-red-600 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        {sheetsError}
                      </div>
                    )}

                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3">
                      <div className="bg-white p-1.5 rounded-lg shadow-sm">
                        <span className="text-emerald-500 text-lg">✅</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-emerald-900">
                          Sheet Connected
                        </h4>
                        <p className="text-xs text-emerald-700 mt-0.5">
                          Your workspace is synced with a Google Sheet. View
                          details in the library below.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
                        Active Connection
                      </h4>
                      {sheetsLoading && (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-5 w-5 text-emerald-600 animate-spin mr-2" />
                          <span className="text-sm text-slate-600">
                            Refreshing...
                          </span>
                        </div>
                      )}
                      <div className="space-y-2">
                        {googleSheets.map((sheet) => {
                          const sheetTypeLabel = formatSheetTypeLabel(
                            sheet.sheet_type
                          );
                          const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheet.sheet_id}/edit`;

                          return (
                            <div
                              key={sheet.id}
                              className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-emerald-200 transition-all"
                            >
                              <div className="flex items-center space-x-3 flex-1">
                                <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                  <FileSpreadsheet className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <a
                                      href={sheetUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm font-bold text-slate-900 hover:text-emerald-600 transition-colors truncate"
                                    >
                                      {sheetTypeLabel}
                                    </a>
                                    <span className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-600 rounded-full uppercase tracking-wide">
                                      {sheet.sheet_type || "general"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3 mt-1">
                                    <p className="text-[10px] text-slate-400 font-mono bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                                      {sheet.sheet_id.substring(0, 8)}...
                                    </p>
                                    <p className="text-[10px] text-slate-400">
                                      Updated {formatDateTime(sheet.updated_at)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => handleDeleteSheet(sheet.id)}
                                className="ml-4 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                              >
                                Disconnect
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {sheetsError && googleSheets.length === 0 && (
                      <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs font-medium text-amber-700 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        {sheetsError}
                      </div>
                    )}

                    {hasGoogleSheet && (
                      <div className="p-4 bg-sky-50 border border-sky-100 rounded-xl text-sm text-sky-800 flex items-start gap-3">
                        <Info className="h-5 w-5 text-sky-500 flex-shrink-0" />
                        <p>
                          To connect a different sheet, please disconnect the
                          existing one first.
                        </p>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">
                            Select Template
                          </h4>
                          <p className="text-xs text-slate-500">
                            Choose a structure for your data
                          </p>
                          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                            <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                              How it works
                            </h5>
                            <ol className="space-y-2 text-xs text-slate-600 list-decimal list-inside">
                              <li>
                                Select a template above to open it in Google
                                Sheets
                              </li>
                              <li>
                                Click{" "}
                                <span className="font-mono bg-white px-1 border border-slate-200 rounded">
                                  File
                                </span>{" "}
                                →{" "}
                                <span className="font-mono bg-white px-1 border border-slate-200 rounded">
                                  Make a copy
                                </span>
                              </li>
                              <li>
                                Share with{" "}
                                <span className="font-medium text-emerald-700">
                                  ai.agent.dispatch@gmail.com
                                </span>{" "}
                                (Editor access)
                              </li>
                              <li>Paste the URL of your copy when prompted</li>
                            </ol>
                          </div>
                        </div>
                        {showTemplateCards && (
                          <button
                            onClick={() => setShowTemplateCards(false)}
                            className="text-xs font-medium text-slate-500 hover:text-slate-900"
                          >
                            Cancel
                          </button>
                        )}
                      </div>

                      <div
                        className={`grid grid-cols-1 gap-3 ${hasGoogleSheet ? "opacity-50 pointer-events-none" : ""}`}
                      >
                        {templateCards.map((template, index) => (
                          <button
                            key={index}
                            onClick={() => handleTemplateClick(index)}
                            className="group relative flex items-center p-4 bg-white border border-slate-200 rounded-xl hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/10 transition-all text-left"
                          >
                            <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                              <FileSpreadsheet className="h-5 w-5" />
                            </div>
                            <div>
                              <h5 className="font-semibold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">
                                {template}
                              </h5>
                              <p className="text-xs text-slate-500 mt-0.5">
                                Click to open & copy
                              </p>
                            </div>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <ExternalLink className="h-4 w-4 text-emerald-400" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Link Input Modal */}
      {showLinkInput && clickedTemplateIndex !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md space-y-6 rounded-2xl border border-white/20 bg-white p-6 shadow-2xl ring-1 ring-black/5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shadow-sm">
                  <LinkIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Connect Sheet
                  </h3>
                  <p className="text-xs text-slate-500">
                    Paste your Google Sheet link
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowLinkInput(false);
                  setGoogleSheetLink("");
                  setLinkInputError(null);
                }}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                <p className="text-sm text-slate-600">
                  Paste the link for the{" "}
                  <strong>{templateCards[clickedTemplateIndex]}</strong> sheet
                  you just copied.
                </p>
              </div>

              {linkInputError && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs font-medium text-red-600 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {linkInputError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                  Google Sheets Link
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={googleSheetLink}
                    onChange={(e) => {
                      setGoogleSheetLink(e.target.value);
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
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSubmitLink();
                      }
                    }}
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    className={`w-full px-4 py-3 pr-10 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400 ${
                      linkInputError
                        ? "border-red-200 focus:border-red-500 focus:ring-red-500/20"
                        : "border-slate-200"
                    }`}
                  />
                  {googleSheetLink.trim() &&
                    validateGoogleSheetsLink(googleSheetLink).isValid && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                      </div>
                    )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSubmitLink}
                  disabled={
                    submittingSheet ||
                    !validateGoogleSheetsLink(googleSheetLink).isValid
                  }
                  className="flex-1 bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  {submittingSheet ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Connecting...
                    </span>
                  ) : (
                    "Connect Sheet"
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowLinkInput(false);
                    setGoogleSheetLink("");
                    setLinkInputError(null);
                    setClickedTemplateIndex(null);
                  }}
                  disabled={submittingSheet}
                  className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-all active:scale-[0.98]"
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

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  isError?: boolean;
};

interface ChatPanelProps {
  workspaceId: string | null;
  workspaceName: string | null;
  hasKnowledge: boolean;
  hasGoogleSheet: boolean;
  user?: User | null;
  onTestAgentMessageCompleted?: () => void;
}

function ChatPanel({
  workspaceId,
  workspaceName,
  hasKnowledge,
  hasGoogleSheet,
  user,
  onTestAgentMessageCompleted,
}: ChatPanelProps) {
  const listRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      role: "assistant",
      content: hasGoogleSheet
        ? "Chat is disabled when a Google Sheet is connected."
        : hasKnowledge
          ? "Hi! Ask me anything about your knowledge library."
          : "Add knowledge to enable the chat.",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content: hasGoogleSheet
          ? "Chat is disabled when a Google Sheet is connected."
          : hasKnowledge
            ? "Hi! Ask me anything about your knowledge library."
            : "Add knowledge to enable the chat.",
      },
    ]);
    setInput("");
  }, [workspaceId, hasKnowledge, hasGoogleSheet]);

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].role === "assistant") {
        const content = hasGoogleSheet
          ? "Chat is disabled when a Google Sheet is connected."
          : hasKnowledge
            ? "Hi! Ask me anything about your knowledge library."
            : "Add knowledge to enable the chat.";
        if (prev[0].content === content) {
          return prev;
        }
        return [{ role: "assistant", content }];
      }
      return prev;
    });
  }, [hasKnowledge, hasGoogleSheet]);

  const disabledReason = !workspaceId
    ? "Select a workspace to start chatting."
    : hasGoogleSheet
      ? "Chat is disabled when a Google Sheet is connected."
      : !hasKnowledge
        ? "Add knowledge to enable chat."
        : null;

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending || !workspaceId || !hasKnowledge || hasGoogleSheet) {
      return;
    }

    setSending(true);
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");

    try {
      const response = await chatAPI.sendMessage(workspaceId, {
        message: text,
        user_id: user?.id,
      });

      let content = "";
      try {
        if (response && typeof response.answer === "string") {
          const match = response.answer.match(/content='([\s\S]*?)'/);

          if (match && match[1]) {
            content = match[1]
              .replace(/\\n/g, "\n")
              .replace(/\\t/g, "\t")
              .replace(/\\\\/g, "\\")
              .replace(/\\"/g, '"');
          } else {
            content = response.answer;
          }
        } else if (
          response &&
          response.answer &&
          typeof response.answer === "object" &&
          "content" in response.answer &&
          typeof (response.answer as { content?: unknown }).content === "string"
        ) {
          content = (response.answer as { content: string }).content;
        } else {
          content = JSON.stringify(response);
        }
      } catch (error) {
        console.error("Error extracting assistant content:", error);
        const fallbackAnswer = response?.answer;
        content =
          typeof fallbackAnswer === "string"
            ? fallbackAnswer
            : JSON.stringify(fallbackAnswer ?? "");
      }

      setMessages((prev) => {
        const newMessages: ChatMessage[] = [
          ...prev,
          { role: "assistant" as const, content }
        ];

        // Call callback if message was sent and response received successfully
        // Check if we have more than 1 assistant message (user has sent message and received response)
        if (onTestAgentMessageCompleted) {
          const assistantMessages = newMessages.filter(m => m.role === "assistant" && m.content && !m.isError);
          const userMessages = newMessages.filter(m => m.role === "user").length;
          
          // Only call callback if:
          // 1. User has sent at least one message (userMessages > 0)
          // 2. We now have more than 1 assistant message (initial welcome message + response)
          // 3. The assistant message is not an error
          if (userMessages > 0 && assistantMessages.length > 1) {
            console.log("Agent message received (more than 1 assistant message), triggering tour callback");
            // User has sent a message and received a response, call the callback
            setTimeout(() => {
              onTestAgentMessageCompleted();
            }, 500); // Small delay to ensure state is updated
          }
        }
        
        return newMessages;
      });
    } catch (error: unknown) {
      console.error("Error sending message:", error);
      const errorMessage =
        (error instanceof Error ? error.message : undefined) ||
        "Failed to send message. Please try again.";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ **Connection Error**\n\nI'm having trouble connecting right now. ${errorMessage}\n\nPlease try again in a moment.`,
          isError: true,
        } as ChatMessage,
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (!disabledReason) {
        handleSend();
      }
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex-none border-b border-gray-200 px-6 py-4" data-tour="test-yetti-section">
        <h3 className="text-xl font-semibold text-gray-900">Test Yetti</h3>
        <p className="text-xs text-gray-500">
          {workspaceName
            ? `Workspace: ${workspaceName}`
            : workspaceId
              ? `Workspace ID: ${workspaceId}`
              : "Select a workspace to chat"}
        </p>
      </div>

      {/* Enhanced Messages Area */}
      <div className="flex-1 min-h-0 relative bg-gradient-to-b from-transparent to-slate-50/20">
        <div
          ref={listRef}
          className="h-full overflow-y-auto px-6 py-6 scroll-smooth space-y-4"
        >
          {messages.map((message, index) => (
            <div
              key={`${index}-${message.role}`}
              className={`flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {/* Assistant Avatar */}
              {message.role === "assistant" && (
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-sky-100 to-blue-100 p-1 shadow-sm ring-2 ring-sky-200/50">
                  <Image
                    src="/yetti/logo.png"
                    alt="Yetti"
                    width={24}
                    height={24}
                    className="h-full w-full object-contain"
                  />
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`group relative max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed transition-all duration-200 ${
                  message.role === "user"
                    ? "rounded-br-md bg-gradient-to-br from-sky-500 via-sky-500 to-sky-500 text-white shadow-lg shadow-sky-500/25 hover:shadow-xl hover:shadow-sky-500/30"
                    : message.isError
                      ? "rounded-bl-md border-2 border-red-200 bg-red-50 text-red-900 shadow-sm"
                      : "rounded-bl-md border border-slate-200 bg-white text-slate-800 shadow-md hover:shadow-lg"
                }`}
              >
                {message.role === "assistant" ? (
                  <div className="prose prose-sm max-w-none prose-p:mb-2 prose-p:last:mb-0">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => (
                          <p className="mb-2 last:mb-0">{children}</p>
                        ),
                        ul: ({ children }) => (
                          <ul className="mb-2 list-disc list-inside space-y-1">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="mb-2 list-decimal list-inside space-y-1">
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => (
                          <li className="ml-2">{children}</li>
                        ),
                        h1: ({ children }) => (
                          <h1 className="mb-2 text-base font-bold">
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="mb-2 text-sm font-bold">{children}</h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="mb-2 text-xs font-bold">{children}</h3>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-semibold text-slate-900">
                            {children}
                          </strong>
                        ),
                        em: ({ children }) => (
                          <em className="italic">{children}</em>
                        ),
                        code: ({ children }) => (
                          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-sky-700 border border-slate-200">
                            {children}
                          </code>
                        ),
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="font-medium">{message.content}</div>
                )}
              </div>

              {/* User Avatar Placeholder */}
              {message.role === "user" && (
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 text-white shadow-sm">
                  <span className="text-xs font-bold">You</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Disabled Overlay - Skeleton Loader or Simple Message */}
        {disabledReason && (
          <div className="absolute inset-0 -z-10 bg-white/50 backdrop-blur-sm p-6 space-y-4 overflow-hidden">
            {hasGoogleSheet && workspaceId ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur-md px-6 py-4 rounded-2xl shadow-xl border border-slate-100 flex flex-col items-center gap-2 text-center max-w-xs">
                  <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 mb-1">
                    <FileSpreadsheet className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-semibold text-slate-800">
                    Chat Disabled
                  </p>
                  <p className="text-xs text-slate-500">
                    Chat is not available when a Google Sheet is connected.
                  </p>
                </div>
              </div>
            ) : !hasKnowledge && workspaceId ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur-md px-6 py-4 rounded-2xl shadow-xl border border-slate-100 flex flex-col items-center gap-2 text-center max-w-xs">
                  <div className="h-10 w-10 rounded-full bg-sky-50 flex items-center justify-center text-sky-500 mb-1">
                    <FileText className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-semibold text-slate-800">
                    No knowledge yet
                  </p>
                  <p className="text-xs text-slate-500">
                    Use &quot;Add Knowledge&quot; to get started.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Message Bubbles Skeleton */}
                <div className="flex flex-col gap-4 opacity-50">
                  <div className="flex justify-start">
                    <div className="h-10 w-3/4 rounded-2xl rounded-tl-none bg-slate-100 animate-pulse" />
                  </div>
                  <div className="flex justify-end">
                    <div className="h-16 w-2/3 rounded-2xl rounded-tr-none bg-sky-50 animate-pulse" />
                  </div>
                  <div className="flex justify-start">
                    <div className="h-12 w-1/2 rounded-2xl rounded-tl-none bg-slate-100 animate-pulse" />
                  </div>
                  <div className="flex justify-end">
                    <div className="h-8 w-1/3 rounded-2xl rounded-tr-none bg-sky-50 animate-pulse" />
                  </div>
                </div>

                {/* Loading Indicator */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-xl border border-slate-100 flex items-center gap-3">
                    <Loader2 className="h-5 w-5 text-sky-500 animate-spin" />
                    <span className="text-sm font-medium text-slate-600">
                      {!workspaceId
                        ? "Select a workspace..."
                        : "Loading chat..."}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Enhanced Input Area */}
      <div className="flex-none border-t border-slate-200 bg-gradient-to-br from-slate-50 via-sky-50/20 to-slate-50 px-6 py-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything..."
              rows={1}
              disabled={!!disabledReason}
              className="w-full resize-none rounded-xl border-2 border-slate-200 bg-white px-4 py-3 pr-12 text-sm placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-500/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 transition-all shadow-sm hover:border-slate-300"
              style={{ minHeight: "50px", maxHeight: "120px" }}
            />
          </div>
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || sending || !!disabledReason}
            className="group relative flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 via-sky-500 to-sky-500 text-white shadow-lg shadow-sky-500/30 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-sky-500/40 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-lg"
            title={sending ? "Sending..." : "Send message"}
          >
            {sending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <SendHorizontal className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            )}
            <div className="absolute inset-0 rounded-xl bg-white opacity-0 transition-opacity group-hover:opacity-10"></div>
          </button>
        </div>
      </div>
    </div>
  );
}
