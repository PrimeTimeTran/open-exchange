import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-16 md:py-24">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
          Terms of Service
        </h1>
        <p className="text-lg text-muted-foreground">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="prose prose-gray max-w-none dark:prose-invert md:prose-lg">
        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-semibold">1. Agreement to Terms</h2>
          <p className="mb-4">
            These Terms of Service constitute a legally binding agreement made
            between you, whether personally or on behalf of an entity ("you")
            and Open Exchange ("we," "us" or "our"), concerning your access to
            and use of the Open Exchange website as well as any other media
            form, media channel, mobile website or mobile application related,
            linked, or otherwise connected thereto (collectively, the "Site").
          </p>
          <p>
            You agree that by accessing the Site, you have read, understood, and
            agree to be bound by all of these Terms of Service. If you do not
            agree with all of these Terms of Service, then you are expressly
            prohibited from using the Site and you must discontinue use
            immediately.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-semibold">
            2. Intellectual Property Rights
          </h2>
          <p className="mb-4">
            Unless otherwise indicated, the Site is our proprietary property and
            all source code, databases, functionality, software, website
            designs, audio, video, text, photographs, and graphics on the Site
            (collectively, the "Content") and the trademarks, service marks, and
            logos contained therein (the "Marks") are owned or controlled by us
            or licensed to us, and are protected by copyright and trademark laws
            and various other intellectual property rights and unfair
            competition laws of the United States, foreign jurisdictions, and
            international conventions.
          </p>
          <p>
            The Content and the Marks are provided on the Site "AS IS" for your
            information and personal use only. Except as expressly provided in
            these Terms of Service, no part of the Site and no Content or Marks
            may be copied, reproduced, aggregated, republished, uploaded,
            posted, publicly displayed, encoded, translated, transmitted,
            distributed, sold, licensed, or otherwise exploited for any
            commercial purpose whatsoever, without our express prior written
            permission.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-semibold">
            3. User Representations
          </h2>
          <p className="mb-4">
            By using the Site, you represent and warrant that:
          </p>
          <ul className="mb-4 list-disc pl-6">
            <li className="mb-2">
              All registration information you submit will be true, accurate,
              current, and complete.
            </li>
            <li className="mb-2">
              You will maintain the accuracy of such information and promptly
              update such registration information as necessary.
            </li>
            <li className="mb-2">
              You have the legal capacity and you agree to comply with these
              Terms of Service.
            </li>
            <li className="mb-2">
              You are not a minor in the jurisdiction in which you reside.
            </li>
            <li className="mb-2">
              You will not access the Site through automated or non-human means,
              whether through a bot, script or otherwise.
            </li>
            <li className="mb-2">
              You will not use the Site for any illegal or unauthorized purpose.
            </li>
            <li className="mb-2">
              Your use of the Site will not violate any applicable law or
              regulation.
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-semibold">
            4. Prohibited Activities
          </h2>
          <p className="mb-4">
            You may not access or use the Site for any purpose other than that
            for which we make the Site available. The Site may not be used in
            connection with any commercial endeavors except those that are
            specifically endorsed or approved by us.
          </p>
          <p>As a user of the Site, you agree not to:</p>
          <ul className="mb-4 list-disc pl-6">
            <li className="mb-2">
              Systematically retrieve data or other content from the Site to
              create or compile, directly or indirectly, a collection,
              compilation, database, or directory without written permission
              from us.
            </li>
            <li className="mb-2">
              Make any unauthorized use of the Site, including collecting
              usernames and/or email addresses of users by electronic or other
              means for the purpose of sending unsolicited email, or creating
              user accounts by automated means or under false pretenses.
            </li>
            <li className="mb-2">
              Circumvent, disable, or otherwise interfere with security-related
              features of the Site, including features that prevent or restrict
              the use or copying of any Content or enforce limitations on the
              use of the Site and/or the Content contained therein.
            </li>
            <li className="mb-2">
              Engage in unauthorized framing of or linking to the Site.
            </li>
            <li className="mb-2">
              Trick, defraud, or mislead us and other users, especially in any
              attempt to learn sensitive account information such as user
              passwords.
            </li>
            <li className="mb-2">
              Make improper use of our support services or submit false reports
              of abuse or misconduct.
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-semibold">
            5. Limitation of Liability
          </h2>
          <p className="mb-4">
            In no event will we or our directors, employees, or agents be liable
            to you or any third party for any direct, indirect, consequential,
            exemplary, incidental, special, or punitive damages, including lost
            profit, lost revenue, loss of data, or other damages arising from
            your use of the site, even if we have been advised of the
            possibility of such damages.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-semibold">6. Termination</h2>
          <p className="mb-4">
            These Terms of Service shall remain in full force and effect while
            you use the Site. WITHOUT LIMITING ANY OTHER PROVISION OF THESE
            TERMS OF SERVICE, WE RESERVE THE RIGHT TO, IN OUR SOLE DISCRETION
            AND WITHOUT NOTICE OR LIABILITY, DENY ACCESS TO AND USE OF THE SITE
            (INCLUDING BLOCKING CERTAIN IP ADDRESSES), TO ANY PERSON FOR ANY
            REASON OR FOR NO REASON, INCLUDING WITHOUT LIMITATION FOR BREACH OF
            ANY REPRESENTATION, WARRANTY, OR COVENANT CONTAINED IN THESE TERMS
            OF SERVICE OR OF ANY APPLICABLE LAW OR REGULATION. WE MAY TERMINATE
            YOUR USE OR PARTICIPATION IN THE SITE OR DELETE YOUR ACCOUNT AND ANY
            CONTENT OR INFORMATION THAT YOU POSTED AT ANY TIME, WITHOUT WARNING,
            IN OUR SOLE DISCRETION.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-semibold">7. Governing Law</h2>
          <p className="mb-4">
            These Terms of Service and your use of the Site are governed by and
            construed in accordance with the laws of the State of California
            applicable to agreements made and to be entirely performed within
            the State of California, without regard to its conflict of law
            principles.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-semibold">8. Contact Us</h2>
          <p className="mb-4">
            In order to resolve a complaint regarding the Site or to receive
            further information regarding use of the Site, please contact us at:
          </p>
          <address className="not-italic">
            Open Exchange Inc.
            <br />
            123 Blockchain Blvd
            <br />
            Crypto Valley, CA 94103
            <br />
            United States
            <br />
            Phone: (555) 555-5555
            <br />
            Email: legal@openexchange.com
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
