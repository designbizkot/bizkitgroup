import { TodoSection } from "@/components/overview/todo-section"
import { NewsSection } from "@/components/overview/news-section"
import { ProjectTimeline } from "@/components/overview/project-timeline"
import { UpcomingEvents } from "@/components/overview/upcoming-events"
import { FollowUpSection } from "@/components/overview/follow-up-section"

export function OverviewDashboard() {
  return (
    <div className="flex flex-col gap-5 xl:flex-row xl:h-screen xl:items-stretch">
      {/* Left + Center columns */}
      <div className="flex flex-1 flex-col gap-5 xl:h-full">
        <div className="flex flex-col items-stretch gap-5 md:h-[420px] md:flex-row">
          {/* To do */}
          <div className="min-h-[350px] flex-1 md:min-h-0">
            <TodoSection />
          </div>
          {/* News */}
          <div className="min-h-[350px] flex-1 md:min-h-0">
            <NewsSection />
          </div>
        </div>

        {/* Project timeline */}
        <div className="flex-1 min-h-0">
          <ProjectTimeline />
        </div>
      </div>

      {/* Right column */}
      <div className="w-full xl:w-96 flex flex-col gap-5 xl:h-full xl:flex-none">
        <UpcomingEvents />
        <div className="flex-1 min-h-0">
          <FollowUpSection />
        </div>
      </div>
    </div>
  )
}

export default function Page() {
  return <OverviewDashboard />
}