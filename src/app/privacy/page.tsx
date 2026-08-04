export const metadata = { title: "Privacy Policy — Industry Ecosystem Brain" };

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-bold">Privacy Policy</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: July 2026</p>

        <section className="mt-6 space-y-4 text-slate-700">
          <p>
            Industry Ecosystem Brain (“IndusBrain”, “we”) processes personal data in line with
            the Nigeria Data Protection Act 2023 (NDPA/NDPR) and, where applicable, the EU
            General Data Protection Regulation (GDPR).
          </p>

          <h2 className="text-lg font-semibold text-slate-900">What we collect</h2>
          <ul className="list-disc space-y-1 pl-6">
            <li>Account data: email address and a securely hashed password.</li>
            <li>
              Quote requests: name, email, company, and your project description, used to
              prepare and send your quote and invoice.
            </li>
            <li>
              Usage data: blueprint requests are logged with the request text, matched
              industry, generation source, IP address and timestamp, for security auditing and
              abuse prevention.
            </li>
          </ul>

          <h2 className="text-lg font-semibold text-slate-900">How we use it</h2>
          <ul className="list-disc space-y-1 pl-6">
            <li>To generate and deliver your blueprints and manage your credits.</li>
            <li>To respond to quote requests and issue invoices (manual bank transfer).</li>
            <li>To secure the service (rate limiting, audit logging).</li>
          </ul>
          <p>
            Requests for industries outside our curated database are processed by OpenAI to
            generate the blueprint. Only the project request text is shared — never your name,
            email or payment details.
          </p>

          <h2 className="text-lg font-semibold text-slate-900">Your rights</h2>
          <p>
            You may request access to, correction of, or deletion of your personal data at any
            time. Contact us and we will act on your request within 30 days. We do not sell
            personal data.
          </p>

          <h2 className="text-lg font-semibold text-slate-900">Retention & security</h2>
          <p>
            Data is retained only as long as needed for the purposes above. Passwords are
            stored using salted scrypt hashing; sessions expire automatically; admin functions
            are access-controlled and all blueprint activity is auditable.
          </p>
        </section>

        <a href="/" className="mt-8 inline-block text-blue-600 hover:underline">
          ← Back to IndusBrain
        </a>
      </div>
    </main>
  );
}
