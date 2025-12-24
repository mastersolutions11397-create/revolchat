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
  onNext?: () => void | Promise<void>; // Action to perform when Next is clicked
}

export const TOUR_STEPS: TourStepConfig[] = [
  // Step 0: Create Workspace - point to input field
  {
    stepIndex: 0,
    subStepIndex: 0,
    target: '[data-tour="workspace-name-input"]',
    content:
      "<strong>Welcome to Yetti.ai 👋</strong><br/><br/>Pick a name for your workspace and let's get started 🚀",
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

  // Step 0a: Onboarding Modal - wait for user to complete questions
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

  // Step 1: Navigate to Knowledge Base
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
    onNext: () => {
      // Navigate to knowledge base by clicking the navigation link
      const navLink = document.querySelector(
        '[data-tour="knowledge-base-nav"]'
      ) as HTMLElement;
      if (navLink) {
        navLink.click();
      }
    },
    styles: {
      options: {
        width: 380,
      },
    },
  },

  // Step 1a: Click Add Knowledge button
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
    onNext: () => {
      // Click the Add Knowledge button
      const addButton = document.querySelector(
        '[data-tour="add-knowledge-button"]'
      ) as HTMLElement;
      if (addButton) {
        addButton.click();
      }
    },
    styles: {
      options: {
        width: 400,
      },
    },
  },

  // Step 1b: Point to Options section (Category/Importance)
  {
    stepIndex: 1,
    subStepIndex: 2,
    target: '[data-tour="knowledge-options"]',
    content:
      "Here you can set the Category and Importance level for your knowledge. Fill in the Title and Content fields, Once you're ready, click the Save button below.",
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

  // Step 1c: Point to Save button (after content is entered)
  {
    stepIndex: 1,
    subStepIndex: 3,
    target: '[data-tour="save-knowledge-button"]',
    content:
      "💾 Once you've filled in the Title and Content, click the Save button to add your knowledge to the library. <strong>Once you're done, click Next</strong> to continue.",
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

  // Step 1.5: Test Agent (shown after knowledge is saved)
  // This is stored as 1.5 in DB but handled as a separate step in frontend
  {
    stepIndex: 1.5,
    subStepIndex: 0,
    target: '[data-tour="test-yetti-section"]',
    content:
      "<strong>Test Your Yetti 🧪</strong><br/><br/>Now ask your Yetti a quick question below.<br/>Send one message and watch it reply ✨<br/><br/><strong>Click Next to close this popup and interact with the chat. When you're ready to continue, the tour will resume.</strong>",
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

  // Step 2: Navigate to Integrations
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
    onNext: () => {
      // Navigate to integrations by clicking the navigation link
      const navLink = document.querySelector(
        '[data-tour="integrations-nav"]'
      ) as HTMLElement;
      if (navLink) {
        navLink.click();
      }
    },
    styles: {
      options: {
        width: 380,
      },
    },
  },

  // Step 2a: Integrations page - explain integrations
  {
    stepIndex: 2,
    subStepIndex: 1,
    target: "body",
    content:
      "<strong>Connect Your Channels 🔗</strong><br/><br/>Pick where you want Yetti to chat for you (like Instagram or Telegram).<br/>Hit Connect and you're live 🚀",
    placement: "center",
    disableBeacon: true,
    requiresAction: true,
    route: "/dashboard/integrations",
    styles: {
      options: {
        width: 450,
      },
    },
  },

  // Step 3: Credits Button in Navbar
  {
    stepIndex: 3,
    subStepIndex: 0,
    target: '[data-tour="credits-button"]',
    content:
      "Yetti uses credits to reply to messages.<br/>Each time your AI sends a response, 1 credit is used.<br/><br/>To help you get started, you receive 100 free credits 🎉<br/>You can track your usage anytime and add more credits from the Billing page — no pressure, no surprises.",
    placement: "bottom",
    disableBeacon: true,
    requiresAction: true,
    route: "/dashboard/integrations",
    styles: {
      options: {
        width: 450,
      },
    },
  },

  // Step 4: Plans Button in Sidebar
  {
    stepIndex: 4,
    subStepIndex: 0,
    target: '[data-tour="plans-nav"]',
    content:
      '💎 Click on "Plans" in the sidebar to see your current plan and upgrade options. This is where you can manage your subscription and choose a plan that fits your needs.',
    placement: "right",
    disableBeacon: true,
    requiresAction: true,
    route: "/dashboard/integrations",
    onNext: () => {
      // Navigate to plans by clicking the navigation link
      const navLink = document.querySelector(
        '[data-tour="plans-nav"]'
      ) as HTMLElement;
      if (navLink) {
        navLink.click();
      }
    },
    styles: {
      options: {
        width: 380,
      },
    },
  },

  // Step 4a: Plans Page - Explain plans
  {
    stepIndex: 4,
    subStepIndex: 1,
    target: "body",
    content:
      "Plans decide how many messages your Yetti can handle and which features you unlock.<br/>Each plan includes credits that power your AI responses.<br/><br/>💡 Most users start with the growth plan and upgrade as they grow.<br/>You can change plans anytime, no pressure, no long-term commitment 😊",
    placement: "center",
    disableBeacon: true,
    requiresAction: true,
    route: "/dashboard/plans",
    styles: {
      options: {
        width: 500,
      },
    },
  },

  // Step 5: Thank You Message (shown gracefully after plans explanation)
  {
    stepIndex: 5,
    subStepIndex: 0,
    target: "body",
    content:
      "<strong>Nice work! your Yetti is ready!</strong><br/><br/>Take a look around and explore the other features we offer.<br/>There's plenty more to discover 🚀",
    placement: "center",
    disableBeacon: true,
    requiresAction: true,
    route: "/dashboard/plans",
    styles: {
      options: {
        width: 500,
      },
    },
  },
];

// Get steps for a specific step index
export function getStepsForIndex(stepIndex: number): TourStepConfig[] {
  return TOUR_STEPS.filter((step) => step.stepIndex === stepIndex);
}

// Check if step index is 1.5 (test agent step)
export function isTestAgentStep(stepIndex: number): boolean {
  return stepIndex === 1.5;
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
      (step) =>
        step.subStepIndex === subStepIndex &&
        step.route &&
        route.startsWith(step.route)
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
// Note: Step 1.5 is counted separately, so we have 0, 1, 1.5, 2, 3, 4, 5 = 7 steps total
export const TOTAL_TOUR_STEPS = 7;

// Step names for display
export const STEP_NAMES = [
  "Create Workspace",
  "Add Knowledge",
  "Test Agent",
  "Connect Channels",
  "Credits",
  "Plans",
  "Thank You",
];
