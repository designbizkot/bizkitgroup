interface NewsItem {
  id: string
  image: string
  title: string
  source: string
  date: string
}

const newsItems: NewsItem[] = [
  {
    id: "1",
    image: "/images/news-ai-ux.jpg",
    title: "AI-Driven UX Becomes Standard in Product Design",
    source: "TechCrunch",
    date: "15 Feb, 2025",
  },
  {
    id: "2",
    image: "/images/news-typography.jpg",
    title: "Minimal UI with Bold Typography Dominates 2026",
    source: "TechCrunch",
    date: "15 Feb, 2025",
  },
  {
    id: "3",
    image: "/images/news-ai-trends.jpg",
    title: "New AI Trends for 2026 and you can't miss this",
    source: "TechCrunch",
    date: "15 Feb, 2025",
  },
  {
    id: "4",
    image: "/images/news-ai-trends.jpg",
    title: "New AI Trends for 2026 and you can't miss this",
    source: "TechCrunch",
    date: "15 Feb, 2025",
  },
]

export function NewsSection() {
  return (
    <section className="flex h-full flex-col rounded-xl bg-card p-5">
      <h2 className="text-lg font-semibold text-card-foreground">News</h2>

      <div className="mt-4 flex min-h-0 flex-1 flex-col divide-y divide-border overflow-y-auto">
        {newsItems.map((item) => (
          <div key={item.id} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
            <img
              src={item.image}
              alt={item.title}
              className="h-[72px] w-[100px] shrink-0 rounded-lg object-cover"
            />
            <div className="flex flex-col justify-center gap-1.5 pt-0.5">
              <p className="text-sm font-semibold leading-snug text-card-foreground">
                {item.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {item.source}
                <span className="mx-1.5">{"·"}</span>
                {item.date}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
