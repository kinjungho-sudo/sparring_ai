// The data passed here is always a static object defined in this codebase,
// never from user input, so JSON.stringify is safe to use with dangerouslySetInnerHTML.
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
