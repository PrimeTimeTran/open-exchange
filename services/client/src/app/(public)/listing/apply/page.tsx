'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Rocket,
  UploadCloud,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select'; // Assuming this exists or using native
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

export default function ListingApplicationPage() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    projectName: '',
    companyName: '',
    legalName: '',
    jurisdiction: '',
    incorporationDate: '',
    projectWebsite: '',
    tokenSymbol: '',
    assetClass: 'crypto',
    tokenContractAddress: '',
    blockchain: '',
    primaryContactName: '',
    email: '',
    telegramHandle: '',
    discordHandle: '',
    description: '',
    whitepaperUrl: '',
    auditReportUrl: '',
    agreedToTerms: false,
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, agreedToTerms: checked }));
  };

  const handleNext = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setIsSuccess(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-background px-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="mb-2 text-3xl font-bold tracking-tight">
            Application Received!
          </h2>
          <p className="mb-8 text-muted-foreground">
            Thank you for applying to list on Open Exchange. Our team will
            review your project and get back to you at{' '}
            <span className="font-medium text-foreground">
              {formData.email}
            </span>{' '}
            within 3-5 business days.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/">
              <Button variant="outline">Return Home</Button>
            </Link>
            <Link href="/listing">
              <Button>Back to Listings</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 md:py-24">
      <div className="container mx-auto max-w-3xl px-4">
        <Link
          href="/listing"
          className="mb-8 inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Listing Info
        </Link>

        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Listing Application
          </h1>
          <p className="mt-2 text-muted-foreground">
            Complete the form below to apply for token listing.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="absolute left-0 top-0 h-full bg-primary transition-all duration-500 ease-in-out"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
          <div className="mt-4 flex justify-between text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <span className={cn(step >= 1 && 'text-primary')}>
              1. Project Details
            </span>
            <span className={cn(step >= 2 && 'text-primary')}>
              2. Technical Info
            </span>
            <span className={cn(step >= 3 && 'text-primary')}>
              3. Contact & Review
            </span>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm md:p-10">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Project Details */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label
                        htmlFor="projectName"
                        className="mb-2 block text-sm font-medium"
                      >
                        Project Name <span className="text-destructive">*</span>
                      </label>
                      <Input
                        id="projectName"
                        name="projectName"
                        placeholder="e.g. Bitcoin"
                        value={formData.projectName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="companyName"
                        className="mb-2 block text-sm font-medium"
                      >
                        Company Name
                      </label>
                      <Input
                        id="companyName"
                        name="companyName"
                        placeholder="e.g. Satoshi Nakamoto LLC"
                        value={formData.companyName}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label
                        htmlFor="legalName"
                        className="mb-2 block text-sm font-medium"
                      >
                        Legal Entity Name
                      </label>
                      <Input
                        id="legalName"
                        name="legalName"
                        placeholder="Full Legal Name"
                        value={formData.legalName}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="jurisdiction"
                        className="mb-2 block text-sm font-medium"
                      >
                        Jurisdiction
                      </label>
                      <Input
                        id="jurisdiction"
                        name="jurisdiction"
                        placeholder="e.g. Singapore"
                        value={formData.jurisdiction}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="incorporationDate"
                      className="mb-2 block text-sm font-medium"
                    >
                      Date of Incorporation
                    </label>
                    <Input
                      id="incorporationDate"
                      name="incorporationDate"
                      type="date"
                      value={formData.incorporationDate}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="projectWebsite"
                      className="mb-2 block text-sm font-medium"
                    >
                      Website URL <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="projectWebsite"
                      name="projectWebsite"
                      type="url"
                      placeholder="https://bitcoin.org"
                      value={formData.projectWebsite}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="description"
                      className="mb-2 block text-sm font-medium"
                    >
                      Project Description{' '}
                      <span className="text-destructive">*</span>
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Briefly describe your project, its mission, and utility..."
                      value={formData.description}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="whitepaperUrl"
                      className="mb-2 block text-sm font-medium"
                    >
                      Whitepaper URL
                    </label>
                    <Input
                      id="whitepaperUrl"
                      name="whitepaperUrl"
                      type="url"
                      placeholder="https://..."
                      value={formData.whitepaperUrl}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="button" onClick={handleNext}>
                    Next Step
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Technical Info */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label
                        htmlFor="tokenSymbol"
                        className="mb-2 block text-sm font-medium"
                      >
                        Token Symbol <span className="text-destructive">*</span>
                      </label>
                      <Input
                        id="tokenSymbol"
                        name="tokenSymbol"
                        placeholder="e.g. BTC"
                        value={formData.tokenSymbol}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="assetClass"
                        className="mb-2 block text-sm font-medium"
                      >
                        Asset Class <span className="text-destructive">*</span>
                      </label>
                      <select
                        id="assetClass"
                        name="assetClass"
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={formData.assetClass}
                        onChange={handleChange}
                        required
                      >
                        <option value="crypto">Cryptocurrency</option>
                        <option value="token">Token</option>
                        <option value="stablecoin">Stablecoin</option>
                        <option value="nft">NFT</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="blockchain"
                      className="mb-2 block text-sm font-medium"
                    >
                      Blockchain Network{' '}
                      <span className="text-destructive">*</span>
                    </label>
                    <select // Using native select for simplicity, can be replaced with custom Select
                      id="blockchain"
                      name="blockchain"
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.blockchain}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Network</option>
                      <option value="ethereum">Ethereum (ERC-20)</option>
                      <option value="bsc">BNB Chain (BEP-20)</option>
                      <option value="solana">Solana</option>
                      <option value="polygon">Polygon</option>
                      <option value="avalanche">Avalanche</option>
                      <option value="arbitrum">Arbitrum</option>
                      <option value="optimism">Optimism</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="tokenContractAddress"
                      className="mb-2 block text-sm font-medium"
                    >
                      Contract Address{' '}
                      <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="tokenContractAddress"
                      name="tokenContractAddress"
                      placeholder="0x..."
                      value={formData.tokenContractAddress}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="auditReportUrl"
                      className="mb-2 block text-sm font-medium"
                    >
                      Audit Report URL
                    </label>
                    <Input
                      id="auditReportUrl"
                      name="auditReportUrl"
                      type="url"
                      placeholder="https://..."
                      value={formData.auditReportUrl}
                      onChange={handleChange}
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Link to a security audit from a reputable firm (Certik,
                      Hacken, etc.)
                    </p>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button type="button" variant="outline" onClick={handleBack}>
                    Back
                  </Button>
                  <Button type="button" onClick={handleNext}>
                    Next Step
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Contact & Review */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label
                        htmlFor="primaryContactName"
                        className="mb-2 block text-sm font-medium"
                      >
                        Primary Contact Name
                      </label>
                      <Input
                        id="primaryContactName"
                        name="primaryContactName"
                        placeholder="Full Name"
                        value={formData.primaryContactName}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="mb-2 block text-sm font-medium"
                      >
                        Contact Email{' '}
                        <span className="text-destructive">*</span>
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="listing@yourproject.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label
                        htmlFor="telegramHandle"
                        className="mb-2 block text-sm font-medium"
                      >
                        Telegram Handle
                      </label>
                      <Input
                        id="telegramHandle"
                        name="telegramHandle"
                        placeholder="@username"
                        value={formData.telegramHandle}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="discordHandle"
                        className="mb-2 block text-sm font-medium"
                      >
                        Discord Handle
                      </label>
                      <Input
                        id="discordHandle"
                        name="discordHandle"
                        placeholder="username#1234"
                        value={formData.discordHandle}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="mt-8 rounded-lg bg-muted p-4">
                    <h3 className="mb-2 font-semibold">Summary</h3>
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                      <div>
                        <dt className="text-xs text-muted-foreground">
                          Project Name
                        </dt>
                        <dd className="text-sm font-medium">
                          {formData.projectName}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">
                          Symbol
                        </dt>
                        <dd className="text-sm font-medium">
                          {formData.tokenSymbol}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">
                          Network
                        </dt>
                        <dd className="text-sm font-medium capitalize">
                          {formData.blockchain || '-'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">
                          Contract
                        </dt>
                        <dd
                          className="text-sm font-medium truncate"
                          title={formData.tokenContractAddress}
                        >
                          {formData.tokenContractAddress || '-'}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="flex items-start space-x-2 pt-4">
                    <Checkbox
                      id="terms"
                      checked={formData.agreedToTerms}
                      onChange={(e) => handleCheckboxChange(e.target.checked)}
                    />
                    <label
                      htmlFor="terms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I certify that I am an official representative of the
                      project and that the information provided is accurate.
                    </label>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button type="button" variant="outline" onClick={handleBack}>
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !formData.agreedToTerms}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Application <Rocket className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
