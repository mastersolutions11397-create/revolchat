"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [submitError, setSubmitError] = useState<string | null>(null);
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
      setSubmitError(null);
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

        const extractedQuestionsRaw = Array.isArray(
          (questionnaire as any)?.questions
        )
          ? (questionnaire as any).questions
          : Array.isArray((questionnaire as any)?.questionnaire)
            ? (questionnaire as any).questionnaire
            : Array.isArray(questionnaire)
              ? questionnaire
              : [];

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
      setSubmitError(null);
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

  const handleNext = () => {
    if (currentQuestionIndex < normalizedQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSubmitError(null);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setSubmitError(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!workspaceId) return;

    const missingRequired = normalizedQuestions.filter(
      ({ question, key }) =>
        isQuestionRequired(question) && !isAnswerProvided(answers[key])
    );

    if (missingRequired.length > 0) {
      setSubmitError("Please answer all required questions to continue.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      await yettiOnboardingAPI.submitOnboarding(workspaceId, {
        solved_answers: answers,
      });

      setHasSubmitted(true);
      onCompleted();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to submit onboarding";
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseRequest = () => {
    if (!canDismiss) {
      setSubmitError("Please complete onboarding to continue.");
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
      className="sm:max-w-5xl md:max-w-6xl p-0 overflow-hidden"
    >
      <div className="max-h-[85vh] overflow-y-auto">
        {loading ? (
          <div className="flex h-96 items-center justify-center text-muted-foreground">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading onboarding questions...</span>
            </div>
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          </div>
        ) : normalizedQuestions.length === 0 ? (
          <div className="flex h-96 items-center justify-center text-center text-muted-foreground">
            <p>No onboarding questions are configured yet.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Two-column layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 min-h-[500px]">
              {/* Left side - Yetti Image */}
              <div className="bg-[#0b1220] flex items-center justify-center p-8 md:p-12">
                <div className="text-center space-y-6">
                  <div className="relative w-48 h-48 md:w-64 md:h-64 mx-auto">
                    <Image
                      src="/yetti/15.png"
                      alt="Yetti"
                      width={256}
                      height={256}
                      className="w-full h-full object-contain"
                      priority
                    />
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm text-white/70">
                      Question {currentQuestionIndex + 1} of{" "}
                      {normalizedQuestions.length}
                    </p>
                    <div className="flex gap-1.5 justify-center">
                      {normalizedQuestions.map((_, index) => (
                        <div
                          key={index}
                          className={`h-1.5 rounded-full transition-all ${
                            index === currentQuestionIndex
                              ? "w-8 bg-sky-400"
                              : "w-1.5 bg-white/20"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right side - Question */}
              <div className="flex flex-col p-8 md:p-12">
                {status && !status.is_onboarded && currentQuestionIndex === 0 && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700 mb-6">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>
                        Complete the onboarding to unlock all workspace features.
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex-1 space-y-6">
                  {(() => {
                    const { question, type, options, key } =
                      normalizedQuestions[currentQuestionIndex];
                    const label = getQuestionLabel(question, currentQuestionIndex);
                    const description =
                      question.description || question.helper_text;
                    const value = answers[key];

                    return (
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-2xl font-semibold text-foreground mb-2">
                            {label}
                            {isQuestionRequired(question) && (
                              <span className="ml-1 text-red-500">*</span>
                            )}
                          </h3>
                          {description && (
                            <p className="text-sm text-muted-foreground">
                              {description}
                            </p>
                          )}
                        </div>

                        <div className="space-y-3">
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
                              className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
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
                              className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
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
                              className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
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
                              className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                            />
                          ) : type === "url" ? (
                            <input
                              type="url"
                              value={typeof value === "string" ? value : ""}
                              onChange={(event) =>
                                handleAnswerChange(key, event.target.value)
                              }
                              placeholder={question.placeholder || "https://"}
                              className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                            />
                          ) : type === "select" ? (
                            <select
                              value={typeof value === "string" ? value : ""}
                              onChange={(event) =>
                                handleAnswerChange(key, event.target.value)
                              }
                              className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                            >
                              <option value="" disabled>
                                {question.placeholder || "Select an option"}
                              </option>
                              {options.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          ) : type === "multi_select" ? (
                            <div className="space-y-3 rounded-lg border border-input bg-background p-4">
                              {options.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
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
                                      className="flex items-center gap-3 text-sm text-foreground cursor-pointer hover:bg-accent/50 p-2 rounded transition-colors"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={() =>
                                          handleMultiSelectChange(
                                            key,
                                            option.value
                                          )
                                        }
                                        className="h-4 w-4 rounded border-input text-sky-600 focus:ring-sky-500"
                                      />
                                      <span>{option.label}</span>
                                    </label>
                                  );
                                })
                              )}
                            </div>
                          ) : type === "boolean" ? (
                            <label className="inline-flex items-center gap-3 text-sm text-foreground cursor-pointer p-3 rounded-lg border border-input bg-background hover:bg-accent/50 transition-colors">
                              <input
                                type="checkbox"
                                checked={Boolean(value)}
                                onChange={(event) =>
                                  handleAnswerChange(key, event.target.checked)
                                }
                                className="h-5 w-5 rounded border-input text-sky-600 focus:ring-sky-500"
                              />
                              <span>{question.placeholder || "Yes"}</span>
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
                              className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                            />
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Error message */}
                {submitError && (
                  <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 mt-4">
                    {submitError}
                  </div>
                )}

                {/* Navigation buttons */}
                <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrev}
                    disabled={currentQuestionIndex === 0}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  {currentQuestionIndex < normalizedQuestions.length - 1 ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="flex items-center gap-2"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="flex items-center gap-2"
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
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}

export default WorkspaceOnboardingModal;
