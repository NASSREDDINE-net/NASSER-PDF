export default function SeoContent({ about, steps, faq }) {
  if (!about && !steps && !faq) return null
  return (
    <section className="seo-content">
      {about && (
        <>
          <h2>{about.heading}</h2>
          {about.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </>
      )}

      {steps && (
        <>
          <h2>{steps.heading}</h2>
          <ol>
            {steps.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ol>
        </>
      )}

      {faq && (
        <>
          <h2>أسئلة شائعة</h2>
          {faq.map(({ q, a }, i) => (
            <details key={i}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </>
      )}
    </section>
  )
}
