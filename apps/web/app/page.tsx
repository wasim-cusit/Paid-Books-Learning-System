const features = [
  "JWT + RBAC foundation",
  "Dynamic payment providers (Stripe/JazzCash/EasyPaisa)",
  "Secure content access architecture",
  "Cross-role student progress analytics"
];

export default function HomePage() {
  return (
    <main className="container">
      <h1>Paid Books Learning System</h1>
      <p className="muted">Mobile-first monorepo foundation is ready.</p>

      <section className="grid">
        {features.map((feature) => (
          <article className="card" key={feature}>
            <strong>{feature}</strong>
          </article>
        ))}
      </section>
    </main>
  );
}
