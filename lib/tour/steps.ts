/**
 * Configuration for onboarding tour steps
 * Defines the sequence, targets, and content for each step in the tour
 */

import { Step } from "react-joyride";

export interface TourStepConfig extends Step {
  stepIndex: number;
  subStepIndex?: number; // For tracking sub-steps within a main step
  requiresAction?: boolean; // If true, tour won't auto-advance
  route?: string; // Expected route for this step
}

export const TOUR_STEPS: TourStepConfig[] = [
  // Step 1: Create Workspace - point to input field
  {
    stepIndex: 0,
    subStepIndex: 0,
    target: '[data-tour="workspace-name-input"]',
    content:
      '👋 Welcome to Yetti! Let\'s get started by creating your first workspace. <strong>Enter a name for your workspace</strong> in the input field below (minimum 3 characters), then click "Create Workspace & Continue" when you\'re ready.',
    placement: "top",
    disableBeacon: true,
    requiresAction: true,
    route: "/dashboard",
    styles: {
      options: {
        width: 400,
      },
    },
  },

  // Step 1a: Onboarding Modal - wait for user to complete questions
  {
    stepIndex: 0,
    subStepIndex: 1,
    target: '[data-tour="onboarding-modal"]',
    content:
      "✨ Great! Now tell us a bit about your workspace by <strong>answering the onboarding questions</strong>. This helps us personalize your experience. <strong>Complete all the questions</strong> and click <strong>Submit</strong> when you're done.",
    placement: "center",
    disableBeacon: true,
    requiresAction: true,
    route: "/dashboard",
    styles: {
      options: {
        width: 450,
      },
    },
  },

  // Step 2: Navigate to Knowledge Base
  {
    stepIndex: 1,
    subStepIndex: 0,
    target: '[data-tour="knowledge-base-nav"]',
    content:
      '📚 Great! Now let\'s add some knowledge to train your AI. Click on "Knowledge Base" in the sidebar.',
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

  // Step 2a: Click Add Knowledge button
  {
    stepIndex: 1,
    subStepIndex: 1,
    target: '[data-tour="add-knowledge-button"]',
    content:
      '💡 Perfect! Now click the "+ Add Knowledge" button to add your first knowledge item.',
    placement: "bottom",
    disableBeacon: true,
    requiresAction: true,
    route: "/dashboard/knowledge-base",
    styles: {
      options: {
        width: 400,
      },
    },
  },

  // Step 2b: Point to Options section (Category/Importance)
  {
    stepIndex: 1,
    subStepIndex: 2,
    target: '[data-tour="knowledge-options"]',
    content:
      "⚙️ Here you can set the Category and Importance level for your knowledge. Fill in the Title and Content fields above, then configure these options. Once you're ready, click the Save button below.",
    placement: "top",
    disableBeacon: true,
    requiresAction: true,
    route: "/dashboard/knowledge-base",
    styles: {
      options: {
        width: 400,
      },
    },
  },

  // Step 2c: Point to Save button (after content is entered)
  {
    stepIndex: 1,
    subStepIndex: 3,
    target: '[data-tour="save-knowledge-button"]',
    content:
      "💾 Once you've filled in the Title and Content, click the Save button to add your knowledge to the library.",
    placement: "top",
    disableBeacon: true,
    requiresAction: true,
    route: "/dashboard/knowledge-base",
    styles: {
      options: {
        width: 400,
      },
    },
  },

  // Step 2d: Point to Test Yetti section (shown after saving)
  {
    stepIndex: 1,
    subStepIndex: 4,
    target: '[data-tour="test-yetti-section"]',
    content:
      "🧪 Excellent! Now you can test your AI by asking questions in the Test Yetti section. Try asking something based on the knowledge you just added! When you're ready, click Next to continue.",
    placement: "left",
    disableBeacon: true,
    requiresAction: true,
    route: "/dashboard/knowledge-base",
    styles: {
      options: {
        width: 400,
      },
    },
  },

  // Step 3: Navigate to Integrations
  {
    stepIndex: 2,
    subStepIndex: 0,
    target: '[data-tour="integrations-nav"]',
    content:
      '🔗 Great job! Now let\'s explore integrations. Click on "Integrations" in the sidebar to see available platforms.',
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

  // Step 3a: Integrations page opened (auto-advance after 3 seconds)
  {
    stepIndex: 2,
    subStepIndex: 1,
    target: '[data-tour="integrations-page"]',
    content:
      "📱 Here you can connect Instagram, Telegram, and other platforms. You don't need to connect anything right now - just know this is where you'll manage your integrations! The tour will continue automatically in a few seconds.",
    placement: "top",
    disableBeacon: true,
    requiresAction: false,
    route: "/dashboard/integrations",
    styles: {
      options: {
        width: 400,
      },
    },
  },

  // Step 4: Navigate to Settings
  {
    stepIndex: 3,
    subStepIndex: 0,
    target: '[data-tour="settings-nav"]',
    content:
      '⚙️ Almost done! Finally, let\'s set your workspace hours. Click on "Settings" in the sidebar.',
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

  // Step 4a: Configure Workspace Hours and Save
  {
    stepIndex: 3,
    subStepIndex: 1,
    target: '[data-tour="workspace-hours-section"]',
    content:
      "⏰ Set when your AI is available to respond to customers. Configure your working hours, timezone, and availability settings, then click the Save button below.",
    placement: "top",
    disableBeacon: true,
    requiresAction: true,
    route: "/dashboard/settings",
    styles: {
      options: {
        width: 400,
      },
    },
  },

  // Step 4b: Point to Save button for workspace hours
  {
    stepIndex: 3,
    subStepIndex: 2,
    target: '[data-tour="save-workspace-hours-button"]',
    content:
      "💾 Once you've configured your workspace hours, click Save to apply your settings and complete the tour!",
    placement: "top",
    disableBeacon: true,
    requiresAction: true,
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

// Get current route-specific step with sub-step support
export function getCurrentStep(
  stepIndex: number,
  route: string,
  subStepIndex?: number
): TourStepConfig | undefined {
  const stepsForIndex = getStepsForIndex(stepIndex);

  // If subStepIndex is provided, try to find that specific sub-step
  if (subStepIndex !== undefined) {
    const subStep = stepsForIndex.find(
      (step) => step.subStepIndex === subStepIndex && step.route && route.startsWith(step.route)
    );
    if (subStep) return subStep;
  }

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
export const TOTAL_TOUR_STEPS = 4;

// Step names for display
export const STEP_NAMES = [
  "Create Workspace",
  "Add Knowledge",
  "Connect Channels",
  "Set Availability",
];
