import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-16 md:py-24">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
          Privacy Policy
        </h1>
        <p className="text-lg text-muted-foreground">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="prose prose-gray max-w-none dark:prose-invert md:prose-lg">
        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-semibold">1. Introduction</h2>
          <p className="mb-4">
            Welcome to Open Exchange ("we," "our," or "us"). We are committed to
            protecting your personal information and your right to privacy. If
            you have any questions or concerns about our policy or our practices
            with regards to your personal information, please contact us.
          </p>
          <p>
            When you visit our website and use our services, you trust us with
            your personal information. We take your privacy very seriously. In
            this privacy policy, we seek to explain to you in the clearest way
            possible what information we collect, how we use it, and what rights
            you have in relation to it.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-semibold">
            2. Information We Collect
          </h2>
          <p className="mb-4">
            We collect personal information that you voluntarily provide to us
            when registering at the Services, expressing an interest in
            obtaining information about us or our products and services, when
            participating in activities on the Services or otherwise contacting
            us.
          </p>
          <ul className="mb-4 list-disc pl-6">
            <li className="mb-2">
              <strong>Personal Information Provided by You:</strong> We collect
              names; phone numbers; email addresses; passwords; and other
              similar information.
            </li>
            <li className="mb-2">
              <strong>Payment Data:</strong> We collect data necessary to
              process your payment if you make purchases, such as your payment
              instrument number (such as a credit card number), and the security
              code associated with your payment instrument.
            </li>
            <li className="mb-2">
              <strong>Social Media Login Data:</strong> We provide you with the
              option to register using social media account details, like your
              Google, Facebook, or other social media account.
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-semibold">
            3. How We Use Your Information
          </h2>
          <p className="mb-4">
            We use personal information collected via our Services for a variety
            of business purposes described below. We process your personal
            information for these purposes in reliance on our legitimate
            business interests, in order to enter into or perform a contract
            with you, with your consent, and/or for compliance with our legal
            obligations.
          </p>
          <ul className="mb-4 list-disc pl-6">
            <li className="mb-2">
              To facilitate account creation and logon process.
            </li>
            <li className="mb-2">
              To send you marketing and promotional communications.
            </li>
            <li className="mb-2">To fulfill and manage your orders.</li>
            <li className="mb-2">To protect our Services.</li>
            <li className="mb-2">
              To enforce our terms, conditions, and policies.
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-semibold">
            4. Sharing Your Information
          </h2>
          <p className="mb-4">
            We only share information with your consent, to comply with laws, to
            provide you with services, to protect your rights, or to fulfill
            business obligations. We may process or share data based on the
            following legal basis:
          </p>
          <ul className="mb-4 list-disc pl-6">
            <li className="mb-2">
              <strong>Consent:</strong> We may process your data if you have
              given us specific consent to use your personal information in a
              specific purpose.
            </li>
            <li className="mb-2">
              <strong>Legitimate Interests:</strong> We may process your data
              when it is reasonably necessary to achieve our legitimate business
              interests.
            </li>
            <li className="mb-2">
              <strong>Performance of a Contract:</strong> Where we have entered
              into a contract with you, we may process your personal information
              to fulfill the terms of our contract.
            </li>
            <li className="mb-2">
              <strong>Legal Obligations:</strong> We may disclose your
              information where we are legally required to do so in order to
              comply with applicable law, governmental requests, a judicial
              proceeding, court order, or legal process.
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-semibold">
            5. Security of Your Information
          </h2>
          <p>
            We use administrative, technical, and physical security measures to
            help protect your personal information. While we have taken
            reasonable steps to secure the personal information you provide to
            us, please be aware that despite our efforts, no security measures
            are perfect or impenetrable, and no method of data transmission can
            be guaranteed against any interception or other type of misuse.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-semibold">6. Contact Us</h2>
          <p className="mb-4">
            If you have questions or comments about this policy, you may email
            us at support@openexchange.com or by post to:
          </p>
          <address className="not-italic">
            Open Exchange Inc.
            <br />
            123 Blockchain Blvd
            <br />
            Crypto Valley, CA 94103
            <br />
            United States
          </address>
        </section>
      </div>

      <div className="mt-12 flex justify-center">
        <Link href="/">
          <Button variant="outline">Return to Home</Button>
        </Link>
      </div>
    </div>
  );
}
