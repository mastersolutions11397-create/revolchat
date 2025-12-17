/**
 * Configuration for onboarding tour steps
 * Defines the sequence, targets, and content for each step in the tour
 */

import { Step } from "react-joyride";

export interface TourStepConfig extends Step {
  stepIndex: number;
  requiresAction?: boolean; // If true, tour won't auto-advance
  route?: string; // Expected route for this step
}

export const TOUR_STEPS: TourStepConfig[] = [
  // Step 1: Create Workspace
  {
    stepIndex: 0,
    target: '[data-tour="create-workspace-button"]',
    content:
      '👋 Welcome to Yetti! Let\'s get started by creating your first workspace. Click the "+ New Workspace" button.',
    placement: "bottom",
    disableBeacon: true,
    requiresAction: true,
    route: "/dashboard",
    styles: {
      options: {
        width: 400,
      },
    },
  },

  // Step 2: Fill Onboarding Modal
  {
    stepIndex: 1,
    target: '[data-tour="onboarding-modal"]',
    content:
      "✨ Great! Now tell us a bit about your workspace. This helps us personalize your experience.",
    placement: "center",
    disableBeacon: true,
    requiresAction: true,
    styles: {
      options: {
        width: 450,
      },
    },
  },

  // Step 3: Navigate to Knowledge Base
  {
    stepIndex: 2,
    target: '[data-tour="knowledge-base-nav"]',
    content:
      '📚 Excellent! Now let\'s add some knowledge to train your AI. Click on "Knowledge Base" in the sidebar.',
    placement: "right",
    disableBeacon: true,
    requiresAction: true,
    route: "/dashboard",
    styles: {
      options: {
        width: 380,
      },
    },
  },

  // Step 3b: Add Knowledge (sub-step shown after navigation)
  {
    stepIndex: 2,
    target: '[data-tour="add-knowledge-button"]',
    content:
      "💡 Here you can add documents, FAQs, and other information to help your AI respond to customer queries. Feel free to add some knowledge now or explore later!",
    placement: "bottom",
    disableBeacon: true,
    route: "/dashboard/knowledge-base",
    styles: {
      options: {
        width: 400,
      },
    },
  },

  // Step 4: Navigate to Integrations
  {
    stepIndex: 3,
    target: '[data-tour="integrations-nav"]',
    content:
      '🔗 Perfect! Next, let\'s connect your channels. Click on "Integrations" to see available platforms.',
    placement: "right",
    disableBeacon: true,
    requiresAction: true,
    route: "/dashboard/knowledge-base",
    styles: {
      options: {
        width: 380,
      },
    },
  },

  // Step 4b: View Integrations (sub-step)
  {
    stepIndex: 3,
    target: '[data-tour="integration-card"]',
    content:
      "📱 Connect Instagram, Telegram, Messenger, and more! These integrations let your AI interact with customers on their favorite platforms.",
    placement: "top",
    disableBeacon: true,
    route: "/dashboard/integrations",
    styles: {
      options: {
        width: 400,
      },
    },
  },

  // Step 5: Navigate to Settings
  {
    stepIndex: 4,
    target: '[data-tour="settings-nav"]',
    content:
      '⚙️ Almost done! Finally, let\'s set your workspace hours. Click on "Settings".',
    placement: "right",
    disableBeacon: true,
    requiresAction: true,
    route: "/dashboard/integrations",
    styles: {
      options: {
        width: 350,
      },
    },
  },

  // Step 5b: Configure Workspace Hours (sub-step)
  {
    stepIndex: 4,
    target: '[data-tour="workspace-hours-section"]',
    content:
      "⏰ Set when your AI is available to respond to customers. You can configure working hours, timezone, and availability settings here.",
    placement: "top",
    disableBeacon: true,
    route: "/dashboard/settings",
    styles: {
      options: {
        width: 400,
      },
    },
  },
];

// Get steps for a specific step index
export function getStepsForIndex(stepIndex: number): TourStepConfig[] {
  return TOUR_STEPS.filter((step) => step.stepIndex === stepIndex);
}

// Get current route-specific step
export function getCurrentStep(
  stepIndex: number,
  route: string
): TourStepConfig | undefined {
  const stepsForIndex = getStepsForIndex(stepIndex);

  // Find the step that matches the current route
  const routeStep = stepsForIndex.find(
    (step) => step.route && route.startsWith(step.route)
  );

  return routeStep || stepsForIndex[0];
}

// Check if current step requires action (can't auto-advance)
export function stepRequiresAction(stepIndex: number): boolean {
  const steps = getStepsForIndex(stepIndex);
  return steps.some((step) => step.requiresAction);
}

// Get the expected route for a step
export function getStepRoute(stepIndex: number): string | undefined {
  const steps = getStepsForIndex(stepIndex);
  return steps[0]?.route;
}

// Total unique steps (not counting sub-steps)
export const TOTAL_TOUR_STEPS = 5;

// Step names for display
export const STEP_NAMES = [
  "Create Workspace",
  "Complete Onboarding",
  "Add Knowledge",
  "Connect Channels",
  "Set Availability",
];
