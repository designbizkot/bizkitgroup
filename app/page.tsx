import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/overview/top-bar"
import { OverviewDashboard } from "@/pages/overview-dashboard"

export default function Home() {
  return (
    <div className="flex h-screen overflow-hidden bg-background font-sans">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />

        <main className="flex-1 overflow-y-auto p-3 sm:p-5">
          <OverviewDashboard />
        </main>
      </div>
    </div>
  )
}
