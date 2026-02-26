import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Community Guidelines - Koreans in USA',
  description: 'Community guidelines and rules for Koreans in USA',
};

export default function GuidelinesPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Community Guidelines</h1>

      <div className="prose dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold">Welcome</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Koreans in USA is a community platform for Koreans living in the United States.
            We aim to create a welcoming, supportive space where members can share
            information, ask questions, and connect with each other.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Be Respectful</h2>
          <ul className="list-disc space-y-2 pl-5 text-gray-600 dark:text-gray-400">
            <li>Treat all community members with respect and kindness</li>
            <li>No hate speech, discrimination, or personal attacks</li>
            <li>Disagree respectfully - focus on ideas, not people</li>
            <li>Be patient with those who are still learning English or Korean</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Post Quality</h2>
          <ul className="list-disc space-y-2 pl-5 text-gray-600 dark:text-gray-400">
            <li>Write clear, descriptive titles for your posts</li>
            <li>Use the correct post type (Q&A, Tips, or General)</li>
            <li>Select the appropriate region for location-specific content</li>
            <li>Search before posting to avoid duplicates</li>
            <li>Share your own experience and knowledge when answering questions</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Prohibited Content</h2>
          <ul className="list-disc space-y-2 pl-5 text-gray-600 dark:text-gray-400">
            <li>Spam, self-promotion, or advertising without context</li>
            <li>Illegal activities or advice that violates US or Korean law</li>
            <li>Personal information of others without consent</li>
            <li>Misleading or false information, especially about immigration</li>
            <li>NSFW or inappropriate content</li>
            <li>Scams, fraud, or deceptive business practices</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Reporting & Moderation</h2>
          <ul className="list-disc space-y-2 pl-5 text-gray-600 dark:text-gray-400">
            <li>Use the Report button to flag content that violates these guidelines</li>
            <li>Posts with 10+ reports are automatically hidden for review</li>
            <li>Moderators review reported content and may hide or remove it</li>
            <li>Repeated violations may result in account restrictions</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Privacy & Safety</h2>
          <ul className="list-disc space-y-2 pl-5 text-gray-600 dark:text-gray-400">
            <li>Never share sensitive personal information publicly (SSN, visa details, etc.)</li>
            <li>Be cautious with financial advice - always verify with professionals</li>
            <li>Report suspicious users or potential scams immediately</li>
          </ul>
        </section>

        <section className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            These guidelines may be updated from time to time. By using this platform,
            you agree to follow these guidelines. Thank you for being part of our community!
          </p>
        </section>
      </div>
    </main>
  );
}
