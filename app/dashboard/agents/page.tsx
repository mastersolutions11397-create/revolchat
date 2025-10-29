"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import { ActivityLogger } from "@/lib/utils/activityLogger";
import Link from "next/link";

export default function KnowledgePage() {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const [activeTab, setActiveTab] = useState<"text" | "pdf" | "sheets" | null>(
    null
  );
  const [textContent, setTextContent] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [sheetsConnected, setSheetsConnected] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles((prev) => [...prev, ...files]);
    setIsUploading(true);

    // Simulate upload process
    setTimeout(() => {
      setIsUploading(false);
    }, 2000);
  };

  const handleProcessPDFs = async () => {
    if (uploadedFiles.length > 0 && currentWorkspace?.id) {
      try {
        // Simulate PDF processing
        console.log("Processing PDFs:", uploadedFiles);
        
        // Log activity
        await ActivityLogger.logKnowledgeUpdate(
          currentWorkspace.id,
          "pdf",
          `Processed ${uploadedFiles.length} PDF file(s)`
        );
        
        // Refresh dashboard activities
        if ((window as any).refreshDashboardActivities) {
          (window as any).refreshDashboardActivities();
        }
        
        // Clear files
        setUploadedFiles([]);
        setActiveTab(null);
      } catch (error) {
        console.error("Error processing PDFs:", error);
      }
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
        </div>
      </div>

      {/* Knowledge Source Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Text Input Option */}
        <div
          onClick={() => setActiveTab(activeTab === "text" ? null : "text")}
          className="yeti-card rounded-2xl p-8 yeti-shadow hover:shadow-xl transition-all cursor-pointer group"
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
          onClick={() => setActiveTab(activeTab === "pdf" ? null : "pdf")}
          className="yeti-card rounded-2xl p-8 yeti-shadow hover:shadow-xl transition-all cursor-pointer group"
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
          onClick={() => setActiveTab(activeTab === "sheets" ? null : "sheets")}
          className="yeti-card rounded-2xl p-8 yeti-shadow hover:shadow-xl transition-all cursor-pointer group"
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
                <p className="text-sm text-gray-500 mt-2">
                  {textContent.length} characters
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleTextSubmit}
                  disabled={!textContent.trim()}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add to Knowledge Base
                </button>
                <button
                  onClick={() => setTextContent("")}
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
                />
                <label
                  htmlFor="pdf-upload"
                  className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-red-700 hover:to-pink-700 transition-all cursor-pointer inline-block"
                >
                  {isUploading ? "Uploading..." : "Choose PDF Files"}
                </label>
              </div>

              {uploadedFiles.length > 0 && (
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
                        onClick={() =>
                          setUploadedFiles((prev) =>
                            prev.filter((_, i) => i !== index)
                          )
                        }
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={handleProcessPDFs}
                  disabled={uploadedFiles.length === 0 || isUploading}
                  className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-red-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? "Processing..." : "Process PDFs"}
                </button>
                <button
                  onClick={() => setUploadedFiles([])}
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
                  onClick={() => setActiveTab(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              {!sheetsConnected ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl text-white">📊</span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Connect Your Google Sheets
                  </h4>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Connect your Google Sheets to automatically sync data and
                    keep your knowledge base up to date.
                  </p>

                  <button
                    onClick={handleGoogleSheetsConnect}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all"
                  >
                    Connect Google Sheets
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                    <span className="text-green-500 text-xl">✅</span>
                    <span className="text-green-700 font-medium">
                      Google Sheets Connected Successfully
                    </span>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-gray-900">
                      Available Sheets
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="text-green-500">📊</span>
                          <span className="text-sm font-medium text-gray-900">
                            Knowledge Base Data
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          Last synced: 2 minutes ago
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="text-green-500">📊</span>
                          <span className="text-sm font-medium text-gray-900">
                            FAQ Database
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          Last synced: 1 hour ago
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all">
                      Sync Now
                    </button>
                    <button
                      onClick={() => setSheetsConnected(false)}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                    >
                      Disconnect
                    </button>
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
            <div className="text-3xl font-bold text-blue-600 mb-2">0</div>
            <div className="text-sm text-gray-600">Text Documents</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">0</div>
            <div className="text-sm text-gray-600">PDF Files</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">0</div>
            <div className="text-sm text-gray-600">Connected Sheets</div>
          </div>
        </div>
      </div>
    </div>
  );
}
