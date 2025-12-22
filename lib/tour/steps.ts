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
      "👋 Welcome to Yetti! Let's get started by creating your first workspace. <strong>Enter a name for your workspace</strong> in the input field below (minimum 3 characters), then click \"Create Workspace & Continue\" when you're ready.",
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
      "🧪 Excellent! Now you can test your AI by asking questions in the Test Yetti section. <strong>Send at least one message</strong> and wait for a response to see how your AI works with the knowledge you just added!",
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
      "🔗 <strong>Integrations</strong> allow you to connect your AI agent to different platforms like Instagram and Telegram. When customers message you on these platforms, your AI will automatically respond using the knowledge you've added. <strong>Connect your preferred channels</strong> to start engaging with your customers! Click Next when you're ready to continue.",
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
      "💳 This is your <strong>Credits</strong> button. Credits are used for every message your AI processes. <strong>One credit is deducted for each message</strong> your AI responds to. You can purchase more credits anytime from the billing page. Click Next to continue.",
    placement: "bottom",
    disableBeacon: true,
    requiresAction: true,
    route: "/dashboard/integrations",
    styles: {
      options: {
        width: 400,
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
      "💎 <strong>Plans & Pricing:</strong> Here you can view and manage your subscription plan. Each plan includes different amounts of Yetti Tokens (credits) that power your AI responses. <strong>Upgrade anytime</strong> to get more credits and unlock premium features. Choose the plan that best fits your business needs!",
    placement: "center",
    disableBeacon: true,
    requiresAction: true,
    route: "/dashboard/plans",
    styles: {
      options: {
        width: 480,
      },
    },
  },

  // Step 5: Thank You Message (shown gracefully after plans explanation)
  {
    stepIndex: 5,
    subStepIndex: 0,
    target: "body",
    content:
      "🎊 <strong>Thank you for completing the Yetti onboarding tour!</strong><br/><br/>You're now ready to build amazing AI experiences. Your workspace is set up, and you know how to add knowledge, connect integrations, and manage your plan.<br/><br/>If you need help anytime, check out our documentation or reach out to support. <strong>Happy building! 🚀</strong>",
    placement: "center",
    disableBeacon: true,
    requiresAction: true,
    route: "/dashboard/plans",
    styles: {
      options: {
        width: 520,
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
