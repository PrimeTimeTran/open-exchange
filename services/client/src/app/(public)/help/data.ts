// --- Types ---
export type Article = {
  id: string;
  title: string;
  category: string;
  content: string;
};

export type Category = {
  id: string;
  title: string;
  icon: string;
  articles: Article[];
};

// --- Dummy Data ---
export const categories: Category[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: 'book-open',
    articles: [
      {
        id: 'create-account',
        title: 'How to create an account',
        category: 'Getting Started',
        content: `
          <h2 class="text-2xl font-bold mb-4">Creating your account</h2>
          <p class="mb-4">Follow these simple steps to start trading on Open Exchange:</p>
          <ol class="list-decimal pl-6 mb-4 space-y-2">
            <li>Click the "Sign Up" button in the top right corner.</li>
            <li>Enter your email address and create a strong password.</li>
            <li>Verify your email address by clicking the link sent to your inbox.</li>
            <li>Complete the identity verification (KYC) process.</li>
          </ol>
          <p>Once verified, you can deposit funds and start trading immediately.</p>
        `,
      },
      {
        id: 'verify-identity',
        title: 'Verifying your identity (KYC)',
        category: 'Getting Started',
        content: `
          <h2 class="text-2xl font-bold mb-4">Identity Verification</h2>
          <p class="mb-4">To comply with financial regulations, we require all users to verify their identity.</p>
          <p class="mb-4">You will need to provide:</p>
          <ul class="list-disc pl-6 mb-4 space-y-2">
            <li>A government-issued ID (Passport, Driver's License, or National ID Card).</li>
            <li>A selfie to verify the ID belongs to you.</li>
            <li>Proof of address (Utility bill or Bank statement dated within the last 3 months).</li>
          </ul>
        `,
      },
    ],
  },
  {
    id: 'account-security',
    title: 'Account & Security',
    icon: 'shield-check',
    articles: [
      {
        id: '2fa-setup',
        title: 'Setting up Two-Factor Authentication (2FA)',
        category: 'Account & Security',
        content: `
          <h2 class="text-2xl font-bold mb-4">Enable 2FA</h2>
          <p class="mb-4">Protect your account by enabling 2FA. We support Google Authenticator and Authy.</p>
          <p>Go to your Profile > Security settings to enable it now.</p>
        `,
      },
      {
        id: 'password-reset',
        title: 'How to reset your password',
        category: 'Account & Security',
        content: `
          <h2 class="text-2xl font-bold mb-4">Resetting your password</h2>
          <p class="mb-4">If you've forgotten your password, click "Forgot Password" on the login screen.</p>
          <p>You will receive an email with instructions to set a new password safely.</p>
        `,
      },
    ],
  },
  {
    id: 'trading',
    title: 'Trading & Markets',
    icon: 'file-text',
    articles: [
      {
        id: 'limit-orders',
        title: 'What is a Limit Order?',
        category: 'Trading & Markets',
        content: `
          <h2 class="text-2xl font-bold mb-4">Limit Orders Explained</h2>
          <p class="mb-4">A limit order is an order to buy or sell a stock at a specific price or better.</p>
          <p>A buy limit order can only be executed at the limit price or lower, and a sell limit order can only be executed at the limit price or higher.</p>
        `,
      },
      {
        id: 'market-orders',
        title: 'What is a Market Order?',
        category: 'Trading & Markets',
        content: `
          <h2 class="text-2xl font-bold mb-4">Market Orders Explained</h2>
          <p class="mb-4">A market order is an order to buy or sell an investment immediately at the best available current price.</p>
        `,
      },
    ],
  },
  {
    id: 'support',
    title: 'Support',
    icon: 'help-circle',
    articles: [
      {
        id: 'contact-support',
        title: 'How to contact support',
        category: 'Support',
        content: `
          <h2 class="text-2xl font-bold mb-4">Contacting Support</h2>
          <p class="mb-4">Our support team is available 24/7 to assist you.</p>
          <p>You can reach us via live chat on the bottom right of the screen or by emailing support@openexchange.com.</p>
        `,
      },
    ],
  },
];
