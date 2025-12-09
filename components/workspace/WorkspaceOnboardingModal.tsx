"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, AlertCircle, ChevronLeft, ChevronRight, Check } from "lucide-react";
import Image from "next/image";

import Modal from "@/components/ui/modal-drop";
import { Button } from "@/components/ui/button";
import {
  yettiOnboardingAPI,
  type YettiQuestion,
  type YettiQuestionOption,
  type YettiOnboardingAnswerValue,
  type YettiOnboardingStatusResponse,
} from "@/lib/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface WorkspaceOnboardingModalProps {
  isOpen: boolean;
  workspaceId: string | null;
  workspaceName?: string;
  onClose: () => void;
  onCompleted: () => void;
  questionnaireIdentifier?: string;
}

type NormalizedQuestionType =
  | "short_text"
  | "long_text"
  | "select"
  | "multi_select"
  | "boolean"
  | "number"
  | "email"
  | "url"
  | "text";

interface NormalizedOption {
  value: string;
  label: string;
}

const DEFAULT_TITLE = "Complete Workspace Onboarding";
const DEFAULT_SUBTITLE =
  "Answer a few questions so we can tailor your Yetti experience.";

const normalizeQuestionType = (
  question: YettiQuestion
): NormalizedQuestionType => {
  const raw =
    question.type ||
    question.field_type ||
    question.input_type ||
    question.answer_type ||
    "short_text";

  const lower = raw.toLowerCase();

  if (
    [
      "short_text",
      "text",
      "input",
      "singleline",
      "single_line",
      "string",
    ].includes(lower)
  ) {
    return "short_text";
  }

  if (["long_text", "textarea", "multiline", "multi_line"].includes(lower)) {
    return "long_text";
  }

  if (["select", "dropdown", "single_select", "choice"].includes(lower)) {
    return "select";
  }

  if (
    ["multi_select", "multi-select", "checkbox", "checkboxes"].includes(lower)
  ) {
    return "multi_select";
  }

  if (["boolean", "toggle", "switch", "yes_no"].includes(lower)) {
    return "boolean";
  }

  if (["number", "numeric"].includes(lower)) {
    return "number";
  }

  if (["email"].includes(lower)) {
    return "email";
  }

  if (["url", "link"].includes(lower)) {
    return "url";
  }

  return "text";
};

const normalizeOptionValue = (
  option: YettiQuestionOption | string
): NormalizedOption => {
  if (typeof option === "string") {
    return {
      value: option,
      label: option,
    };
  }

  const value = option.value ?? option.label ?? option.name ?? option.id ?? "";

  const label =
    option.label ?? option.value ?? option.name ?? option.id ?? value;

  return {
    value: String(value),
    label: String(label || value),
  };
};

const getQuestionLabel = (question: YettiQuestion, index: number) => {
  return (
    question.prompt ||
    question.question ||
    question.title ||
    `Question ${index + 1}`
  );
};

const isQuestionRequired = (question: YettiQuestion) => {
  const value = question.required;
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    return ["true", "1", "yes", "required"].includes(
      value.trim().toLowerCase()
    );
  }
  if (typeof value === "number") {
    return value === 1;
  }
  return false;
};

const isAnswerProvided = (value: YettiOnboardingAnswerValue) => {
  if (value === null || value === undefined) return false;
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  if (typeof value === "string") {
    return value.trim().length > 0;
  }
  return true;
};

export function WorkspaceOnboardingModal({
  isOpen,
  workspaceId,
  workspaceName,
  onClose,
  onCompleted,
  questionnaireIdentifier,
}: WorkspaceOnboardingModalProps) {
  const [questions, setQuestions] = useState<YettiQuestion[]>([]);
  const [answers, setAnswers] = useState<
    Record<string, YettiOnboardingAnswerValue>
  >({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<YettiOnboardingStatusResponse | null>(
    null
  );
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    if (!isOpen || !workspaceId) {
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      setQuestions([]);
      setHasSubmitted(false);

      try {
        const questionnairePromise = questionnaireIdentifier
          ? yettiOnboardingAPI.getQuestionnaire(questionnaireIdentifier)
          : yettiOnboardingAPI.getQuestionnaire();

        const [questionnaire, statusResponse] = await Promise.all([
          questionnairePromise,
          yettiOnboardingAPI
            .getOnboardingStatus(workspaceId)
            .catch((err: unknown) => {
              if (
                err instanceof Error &&
                (err.message.includes("404") ||
                  err.message.toLowerCase().includes("not found"))
              ) {
                return null;
              }
              throw err;
            }),
        ]);

        if (cancelled) return;

        const questionnaireTyped = questionnaire as {
          questions?: unknown[];
          questionnaire?: unknown[];
        } | unknown[];

        let extractedQuestionsRaw: unknown[] = [];

        if (Array.isArray((questionnaireTyped as { questions?: unknown[] }).questions)) {
          extractedQuestionsRaw = (questionnaireTyped as { questions: unknown[] }).questions;
        } else if (Array.isArray((questionnaireTyped as { questionnaire?: unknown[] }).questionnaire)) {
          extractedQuestionsRaw = (questionnaireTyped as { questionnaire: unknown[] }).questionnaire;
        } else if (Array.isArray(questionnaire)) {
          extractedQuestionsRaw = questionnaire;
        }

        setQuestions(extractedQuestionsRaw as YettiQuestion[]);
        setStatus(statusResponse);

        if (statusResponse?.solved_answers) {
          setAnswers(statusResponse.solved_answers);
        } else {
          setAnswers({});
        }

        if (statusResponse?.is_onboarded) {
          setHasSubmitted(true);
          onCompleted();
        }
      } catch (err: unknown) {
        if (cancelled) return;
        const message =
          err instanceof Error ? err.message : "Failed to load onboarding";
        setError(message);
        toast.error(message);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [isOpen, workspaceId, questionnaireIdentifier, onCompleted]);

  useEffect(() => {
    if (!isOpen) {
      setQuestions([]);
      setAnswers({});
      setError(null);
      setStatus(null);
      setHasSubmitted(false);
      setSubmitting(false);
      setCurrentQuestionIndex(0);
    }
  }, [isOpen]);

  const canDismiss = hasSubmitted && !submitting;

  const normalizedQuestions = useMemo(() => {
    return questions.map((question, index) => {
      const type = normalizeQuestionType(question);
      const options = Array.isArray(question.options)
        ? question.options.map((option) => normalizeOptionValue(option))
        : [];
      const key = String(
        question.key ??
          (typeof question.id !== "undefined"
            ? question.id
            : `question_${index}`)
      );

      return { question, type, options, key };
    });
  }, [questions]);

  const handleAnswerChange = (
    questionKey: string,
    value: YettiOnboardingAnswerValue
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [questionKey]: value,
    }));
  };

  const handleMultiSelectChange = (
    questionKey: string,
    optionValue: string
  ) => {
    setAnswers((prev) => {
      const existing = Array.isArray(prev[questionKey])
        ? (prev[questionKey] as string[])
        : [];
      const exists = existing.includes(optionValue);
      const next = exists
        ? existing.filter((value) => value !== optionValue)
        : [...existing, optionValue];

      return {
        ...prev,
        [questionKey]: next,
      };
    });
  };

  const handleNext = (event?: React.MouseEvent<HTMLButtonElement>) => {
    event?.preventDefault();
    event?.stopPropagation();
    
    if (currentQuestionIndex >= normalizedQuestions.length - 1) {
      return;
    }

    const currentQuestion = normalizedQuestions[currentQuestionIndex];
    const { question, key } = currentQuestion;

    // Validate current question if it's required
    if (isQuestionRequired(question) && !isAnswerProvided(answers[key])) {
      toast.error("Please answer this required question to continue.");
      return;
    }

    setCurrentQuestionIndex((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    console.log("ANSWERS",answers);
    if (!workspaceId) return;

    const missingRequired = normalizedQuestions.filter(
      ({ question, key }) =>
        isQuestionRequired(question) && !isAnswerProvided(answers[key])
    );

    if (missingRequired.length > 0) {
      toast.error("Please answer all required questions to continue.");
      return;
    }

    setSubmitting(true);

    try {
      await yettiOnboardingAPI.submitOnboarding(workspaceId, {
        solved_answers: answers,
      });

      setHasSubmitted(true);
      onCompleted();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to submit onboarding";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseRequest = () => {
    if (!canDismiss) {
      toast.error("Please complete onboarding to continue.");
      return;
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCloseRequest}
      allowEasyClose={canDismiss}
      showCloseButton={canDismiss}
      title={DEFAULT_TITLE}
      subtitle={
        workspaceName
          ? `${DEFAULT_SUBTITLE} (${workspaceName})`
          : DEFAULT_SUBTITLE
      }
      disablePadding
      className="max-w-2xl p-0 text-white overflow-hidden bg-slate-900 border border-white/10 shadow-2xl shadow-black/50"
    >
      <div className="max-h-[85vh] overflow-y-auto">
        {loading ? (
          <div className="flex h-96 items-center justify-center text-slate-400">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading onboarding questions...</span>
            </div>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-red-400 mb-4">{error}</p>
            <Button onClick={onClose} variant="outline" className="border-white/10 text-white hover:bg-white/5">
              Close
            </Button>
          </div>
        ) : normalizedQuestions.length === 0 ? (
          <div className="flex h-96 items-center justify-center text-center text-slate-400">
            <p>No onboarding questions are configured yet.</p>
          </div>
        ) : (
          <form 
            onSubmit={handleSubmit} 
            onKeyDown={(e) => {
              // Prevent Enter from submitting form unless on last question
              // Allow Enter in textareas for new lines
              if (
                e.key === 'Enter' && 
                currentQuestionIndex < normalizedQuestions.length - 1 &&
                (e.target as HTMLElement).tagName !== 'TEXTAREA'
              ) {
                e.preventDefault();
                handleNext();
              }
            }}
            className="p-8"
          >
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between text-xs font-medium text-slate-400 mb-2">
                <span>Question {currentQuestionIndex + 1} of {normalizedQuestions.length}</span>
                <span>{Math.round(((currentQuestionIndex + 1) / normalizedQuestions.length) * 100)}% Complete</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-sky-500 to-sky-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentQuestionIndex + 1) / normalizedQuestions.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            <div className="min-h-[300px] flex flex-col">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestionIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1"
                >
                  {(() => {
                    const { question, type, options, key } =
                      normalizedQuestions[currentQuestionIndex];
                    const label = getQuestionLabel(question, currentQuestionIndex);
                    const description =
                      question.description || question.helper_text;
                    const value = answers[key];

                    return (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-2">
                            {label}
                            {isQuestionRequired(question) && (
                              <span className="ml-1 text-sky-500">*</span>
                            )}
                          </h3>
                          {description && (
                            <p className="text-slate-400">
                              {description}
                            </p>
                          )}
                        </div>

                        <div className="space-y-4">
                          {type === "short_text" || type === "text" ? (
                            <input
                              type="text"
                              value={
                                typeof value === "string" ||
                                typeof value === "number"
                                  ? String(value)
                                  : ""
                              }
                              onChange={(event) =>
                                handleAnswerChange(key, event.target.value)
                              }
                              placeholder={
                                question.placeholder || "Type your answer"
                              }
                              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all outline-none"
                              autoFocus
                            />
                          ) : type === "long_text" ? (
                            <textarea
                              value={typeof value === "string" ? value : ""}
                              onChange={(event) =>
                                handleAnswerChange(key, event.target.value)
                              }
                              rows={5}
                              placeholder={
                                question.placeholder || "Type your answer"
                              }
                              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all outline-none resize-none"
                              autoFocus
                            />
                          ) : type === "number" ? (
                            <input
                              type="number"
                              value={
                                typeof value === "number"
                                  ? value
                                  : typeof value === "string"
                                    ? value
                                    : ""
                              }
                              onChange={(event) => {
                                const numericValue = event.target.value;
                                handleAnswerChange(
                                  key,
                                  numericValue === "" ? null : Number(numericValue)
                                );
                              }}
                              placeholder={
                                question.placeholder || "Enter a number"
                              }
                              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all outline-none"
                              autoFocus
                            />
                          ) : type === "email" ? (
                            <input
                              type="email"
                              value={typeof value === "string" ? value : ""}
                              onChange={(event) =>
                                handleAnswerChange(key, event.target.value)
                              }
                              placeholder={
                                question.placeholder || "Enter email"
                              }
                              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all outline-none"
                              autoFocus
                            />
                          ) : type === "url" ? (
                            <input
                              type="url"
                              value={typeof value === "string" ? value : ""}
                              onChange={(event) =>
                                handleAnswerChange(key, event.target.value)
                              }
                              placeholder={question.placeholder || "https://"}
                              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all outline-none"
                              autoFocus
                            />
                          ) : type === "select" ? (
                            <select
                              value={typeof value === "string" ? value : ""}
                              onChange={(event) =>
                                handleAnswerChange(key, event.target.value)
                              }
                              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all outline-none appearance-none"
                              autoFocus
                            >
                              <option value="" disabled className="bg-slate-900 text-slate-400">
                                {question.placeholder || "Select an option"}
                              </option>
                              {options.map((option) => (
                                <option key={option.value} value={option.value} className="bg-slate-900 text-white">
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          ) : type === "multi_select" ? (
                            <div className="space-y-3">
                              {options.length === 0 ? (
                                <p className="text-sm text-slate-400">
                                  No options configured.
                                </p>
                              ) : (
                                options.map((option) => {
                                  const existing = Array.isArray(value)
                                    ? value
                                    : [];
                                  const checked = existing.includes(option.value);
                                  return (
                                    <label
                                      key={option.value}
                                      className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                                        checked 
                                          ? "bg-sky-500/10 border-sky-500/50" 
                                          : "bg-white/5 border-white/10 hover:bg-white/10"
                                      }`}
                                    >
                                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                                        checked ? "bg-sky-500 border-sky-500" : "border-slate-500"
                                      }`}>
                                        {checked && <Check className="w-3.5 h-3.5 text-white" />}
                                      </div>
                                      <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={() =>
                                          handleMultiSelectChange(
                                            key,
                                            option.value
                                          )
                                        }
                                        className="hidden"
                                      />
                                      <span className="text-white font-medium">{option.label}</span>
                                    </label>
                                  );
                                })
                              )}
                            </div>
                          ) : type === "boolean" ? (
                            <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                              Boolean(value)
                                ? "bg-sky-500/10 border-sky-500/50" 
                                : "bg-white/5 border-white/10 hover:bg-white/10"
                            }`}>
                              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                                Boolean(value) ? "bg-sky-500 border-sky-500" : "border-slate-500"
                              }`}>
                                {Boolean(value) && <Check className="w-3.5 h-3.5 text-white" />}
                              </div>
                              <input
                                type="checkbox"
                                checked={Boolean(value)}
                                onChange={(event) =>
                                  handleAnswerChange(key, event.target.checked)
                                }
                                className="hidden"
                              />
                              <span className="text-white font-medium">{question.placeholder || "Yes"}</span>
                            </label>
                          ) : (
                            <input
                              type="text"
                              value={typeof value === "string" ? value : ""}
                              onChange={(event) =>
                                handleAnswerChange(key, event.target.value)
                              }
                              placeholder={
                                question.placeholder || "Type your answer"
                              }
                              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all outline-none"
                              autoFocus
                            />
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </motion.div>
              </AnimatePresence>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-white/10">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handlePrev}
                  disabled={currentQuestionIndex === 0}
                  className="flex items-center gap-2 text-slate-400 hover:text-white hover:bg-white/5"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                {currentQuestionIndex < normalizedQuestions.length - 1 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center gap-2 bg-white text-slate-900 hover:bg-slate-200 font-semibold"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-sky-500 hover:from-sky-500 hover:to-sky-500 text-white font-semibold shadow-lg shadow-sky-500/20"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Complete
                        <ChevronRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}

export default WorkspaceOnboardingModal;
