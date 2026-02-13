import { TodoSection } from "@/components/overview/todo-section"
import { NewsSection } from "@/components/overview/news-section"
import { ProjectTimeline } from "@/components/overview/project-timeline"
import { UpcomingEvents } from "@/components/overview/upcoming-events"
import { FollowUpSection } from "@/components/overview/follow-up-section"

export default function OverviewDashboard() {
  return (
    <div className="flex flex-col gap-5 xl:flex-row">
      {/* Left + Center columns */}
      <div className="flex flex-1 flex-col gap-5">
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
        <ProjectTimeline />
      </div>

      {/* Right column */}
      <div className="flex w-full flex-col gap-5 md:flex-row xl:w-72 xl:shrink-0 xl:flex-col">
        <div className="flex-1 xl:flex-none">
          <UpcomingEvents />
        </div>
        <div className="flex-1 xl:flex-none">
          <FollowUpSection />
        </div>
      </div>
    </div>
  )
}
