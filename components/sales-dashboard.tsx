"use client"

import { useState, useMemo, useEffect } from "react"
import {
    Search,
    SlidersHorizontal,
    Plus,
    ChevronLeft,
    ChevronRight,
    X,
    Users,
    UserCheck,
    UserX,
    FileText,
    MessageSquare,
    MoreVertical,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Modal } from "@/components/modal"
import { useRouter } from "next/navigation"
import { SalesKanban } from "@/components/SalesKanban"


/* ── Types ─── */
interface Lead {
    id: string
    name: string
    email: string
    avatar: string
    online: boolean
    company: string
    companyLogo: string
    companyLogoColor: string
    industry: string
    source: string
    status: string
    followUp: string
    created: string
    active: boolean
}

/* ── Color maps ─── */
const INDUSTRY_COLORS: Record<string, string> = {
    Technology: "bg-[#e8f0f2] text-[#0d404b]",
    Finance: "bg-[#e8f0f2] text-[#0d404b]",
    Retail: "bg-[#e8f0f2] text-[#0d404b]",
    Education: "bg-[#e8f0f2] text-[#0d404b]",
    Logistics: "bg-[#e8f0f2] text-[#0d404b]",
    Advertising: "bg-[#e8f0f2] text-[#0d404b]",
}

const SOURCE_COLORS: Record<string, string> = {
    LinkedIn: "bg-[#d0e1e5] text-[#0d404b]",
    Website: "bg-[#d0e1e5] text-[#0d404b]",
    Referral: "bg-[#d0e1e5] text-[#0d404b]",
}

const STATUS_COLORS: Record<string, string> = {
    "New": "bg-[#dbeafe] text-[#1e3a8a]",
    "Reached Out": "bg-[#e0f2fe] text-[#075985]",
    "Replied - Interested": "bg-[#b0ffe1] text-[#176648]",
    "Replied - Not Interested": "bg-[#ffaeae] text-[#661515]",
    "Meeting Set Up": "bg-[#a7d8e3] text-[#0e3f4a]",
    "Proposal Sent": "bg-[#dde9e3] text-[#555b58]",
    "Prepare proposal": "bg-[#fcf0ba] text-[#635721]",
    "On Pause": "bg-[#e6e6e6] text-[#565656]",
    "Closed": "bg-[#d4d4d8] text-[#27272a]",
}


const INDUSTRY_OPTIONS = ["Technology", "Finance", "Retail", "Education", "Logistics", "Advertising"]
const SOURCE_OPTIONS = ["LinkedIn", "Website", "Referral"]
const STATUS_OPTIONS = [
    "New",
    "Reached Out",
    "Replied - Not Interested",
    "Replied - Interested",
    "Meeting Set Up",
    "Proposal Sent",
    "On Pause",
    "Closed",
    "Prepare proposal"
]
const PER_PAGE = 10

/* ── Stat Card ─── */
function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
    return (
        <div className="flex flex-1 flex-col gap-1 rounded-lg border border-[#d0e1e5] bg-card p-4">
            <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">{label}</span>
                <span className="text-muted-foreground">{icon}</span>
            </div>
            <span className="text-2xl font-bold text-foreground">{value}</span>
            <span className="text-xs text-muted-foreground">{sub}</span>
        </div>
    )
}

/* ── Main Component ─── */
export default function SalesDashboard() {
    const [leads, setLeads] = useState<Lead[]>([])
    const [search, setSearch] = useState("")
    const [activeTab, setActiveTab] = useState<"all" | "active" | "inactive">("all")
    const [timePeriod, setTimePeriod] = useState("Per Day")
    const [viewMode, setViewMode] = useState<"table" | "kanban">("table")
    const [currentPage, setCurrentPage] = useState(1)
    const [isAdding, setIsAdding] = useState(false)
    const [actionMenuId, setActionMenuId] = useState<string | null>(null)
    const [deleteLead, setDeleteLead] = useState<Lead | null>(null)
    const [originalLead, setOriginalLead] = useState<Lead | null>(null)
    const [editingId, setEditingId] = useState<string | null>(null)

    /* Filter state */
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [filterIndustry, setFilterIndustry] = useState("all")
    const [filterSource, setFilterSource] = useState("all")
    const [filterStatus, setFilterStatus] = useState("all")
    const [filterFollowFrom, setFilterFollowFrom] = useState("")
    const [filterFollowTo, setFilterFollowTo] = useState("")
    const [filterCountry, setFilterCountry] = useState("")


    /* Form state */
    const [fName, setFName] = useState("")
    const [fEmail, setFEmail] = useState("")
    const [fCompany, setFCompany] = useState("")
    const [fIndustry, setFIndustry] = useState(INDUSTRY_OPTIONS[0])
    const [fSource, setFSource] = useState(SOURCE_OPTIONS[0])
    const [fStatus, setFStatus] = useState(STATUS_OPTIONS[0])
    const [fFollowUp, setFFollowUp] = useState("")

    const resetForm = () => {
        setFName(""); setFEmail(""); setFCompany("")
        setFIndustry(INDUSTRY_OPTIONS[0]); setFSource(SOURCE_OPTIONS[0])
        setFStatus(STATUS_OPTIONS[0]); setFFollowUp("")
        setIsAdding(false)
    }

    const handleStatusChange = async (id: string, newStatus: string) => {
        await fetch("/api/leads", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, status: newStatus }),
        })

        await fetchLeads()
    }


    const handleAddLead = async () => {
        if (!fName.trim() || !fEmail.trim()) return

        const res = await fetch("/api/leads", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: fName.trim(),
                email: fEmail.trim(),
                company: fCompany.trim(),
                industry: fIndustry,
                source: fSource,
                status: fStatus,
                follow_up: fFollowUp || null,
            }),
        })

        if (!res.ok) {
            console.error("Insert failed")
            return
        }

        await fetchLeads()
        resetForm()
    }

    const handleUpdateLead = async () => {
        if (!editingId) return

        const res = await fetch("/api/leads", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: editingId,
                name: fName.trim(),
                email: fEmail.trim(),
                company: fCompany.trim(),
                industry: fIndustry,
                source: fSource,
                status: fStatus,
                follow_up: fFollowUp || null,
            }),
        })

        if (!res.ok) {
            console.error("Update failed")
            return
        }

        await fetchLeads()
        resetForm()
        setEditingId(null)
    }

    const handleDeleteLead = async (id: string) => {
        const res = await fetch("/api/leads", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        })

        if (!res.ok) {
            console.error("Delete failed")
            return
        }

        await fetchLeads()
    }

    useEffect(() => {
        const handleClick = () => setActionMenuId(null)
        window.addEventListener("click", handleClick)
        return () => {
            window.removeEventListener("click", handleClick)
        }
    }, [])

    /* Filtering */
    const filtered = useMemo(() => {
        let list = [...leads]

        // Tab filter
        if (activeTab === "active") list = list.filter((l) => l.active)
        if (activeTab === "inactive") list = list.filter((l) => !l.active)

        // Search
        if (search) {
            const q = search.toLowerCase()
            list = list.filter(
                (l) =>
                    l.name.toLowerCase().includes(q) ||
                    l.email.toLowerCase().includes(q) ||
                    l.company.toLowerCase().includes(q)
            )
        }

        // Industry
        if (filterIndustry !== "all") {
            list = list.filter((l) => l.industry === filterIndustry)
        }

        // Source
        if (filterSource !== "all") {
            list = list.filter((l) => l.source === filterSource)
        }

        // Status
        if (filterStatus !== "all") {
            list = list.filter((l) => l.status === filterStatus)
        }

        // Follow up date range
        if (filterFollowFrom) {
            list = list.filter((l) => {
                if (!l.followUp) return false
                return new Date(l.followUp) >= new Date(filterFollowFrom)
            })
        }

        if (filterFollowTo) {
            list = list.filter((l) => {
                if (!l.followUp) return false
                return new Date(l.followUp) <= new Date(filterFollowTo)
            })
        }

        if (filterFollowTo) {
            list = list.filter((l) => {
                if (l.followUp === "-") return false
                return new Date(l.followUp) <= new Date(filterFollowTo)
            })
        }

        return list
    }, [
        leads,
        search,
        activeTab,
        filterIndustry,
        filterSource,
        filterStatus,
        filterFollowFrom,
        filterFollowTo,
    ])


    const allCount = leads.length
    const activeCount = leads.filter((l) => l.active).length
    const inactiveCount = leads.filter((l) => !l.active).length

    /* Stats */
    const totalLeads = leads.length
    const reachedOut = leads.filter(
        (l) =>
            l.status !== "New" &&
            l.status !== "On Pause"
    ).length
    const yetToReachOut = leads.filter(
        (l) => l.status === "New"
    ).length
    const awaitingReview = leads.filter(
        (l) => l.status === "Prepare proposal" || l.status === "Proposal Sent"
    ).length
    const repliedCount = leads.filter((l) => l.status.startsWith("Replied")).length
    const replyRate = reachedOut > 0 ? ((repliedCount / reachedOut) * 100).toFixed(1) : "0"

    /* Pagination */
    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
    const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE)

    const pageNumbers = () => {
        const pages: (number | "...")[] = []
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i)
        } else {
            pages.push(1, 2, 3, "...", totalPages - 2, totalPages - 1, totalPages)
        }
        return pages
    }

    /* Styles */
    const inputCls = "w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
    const selectCls = "w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
    const labelCls = "mb-1 block text-xs font-medium text-muted-foreground"

    const isFormChanged = useMemo(() => {
        // กรณี Add ใหม่
        if (!editingId) {
            return (
                fName.trim() !== "" ||
                fEmail.trim() !== "" ||
                fCompany.trim() !== ""
            )
        }

        // กรณี Edit
        if (!originalLead) return false

        return (
            fName !== originalLead.name ||
            fEmail !== originalLead.email ||
            fCompany !== originalLead.company ||
            fIndustry !== originalLead.industry ||
            fSource !== originalLead.source ||
            fStatus !== originalLead.status
        )
    }, [
        fName,
        fEmail,
        fCompany,
        fIndustry,
        fSource,
        fStatus,
        editingId,
        originalLead,
    ])

    useEffect(() => {
        fetchLeads()
    }, [])

    const fetchLeads = async () => {
        const res = await fetch("/api/leads")

        if (!res.ok) {
            console.error("Failed to fetch leads")
            return
        }

        const data = await res.json()

        const formatted = data.map((item: any) => ({
            id: item.id,
            name: item.name,
            email: item.email,
            avatar: "/placeholder.svg",
            online: true,
            company: item.company || "-",
            companyLogo: item.company?.[0]?.toUpperCase() || "?",
            companyLogoColor: "bg-[#166a7d]",
            industry: item.industry,
            source: item.source,
            status: item.status,
            followUp: item.follow_up || "",
            created: new Date(item.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            }),
            active: true,
        }))

        setLeads(formatted)
    }

    return (
        <div>
            {/* Page header */}
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Sale Management</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Track your sales performance</p>
                </div>
                <div className="flex rounded-lg bg-card">
                    {["Per Day", "Per Week", "Per Month", "All Time"].map((p) => (
                        <button
                            key={p}
                            onClick={() => setTimePeriod(p)}
                            className={cn(
                                "px-3 py-1.5 text-xs font-medium transition-colors sm:px-4 sm:text-sm",
                                timePeriod === p ? "rounded-lg bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stat cards */}
            <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                <StatCard icon={<Users size={16} />} label="Total Leads" value={String(totalLeads)} sub="All leads in the system" />
                <StatCard icon={<UserCheck size={16} />} label="Reached Out" value={String(reachedOut)} sub="Leads you've contacted" />
                <StatCard icon={<UserX size={16} />} label="Yet to Reach Out" value={String(yetToReachOut)} sub="New leads waiting" />
                <StatCard icon={<FileText size={16} />} label="Awaiting Proposal Review" value={String(awaitingReview)} sub="Proposals pending review" />
                <StatCard icon={<MessageSquare size={16} />} label="Reply Rate" value={`${replyRate}%`} sub={`${repliedCount} of ${reachedOut} replied`} />
            </div>

            {/* Table card */}
            <div className="rounded-2xl border border-border/50 bg-card shadow-sm">

                {/* Tabs + toolbar */}
                <div className="flex flex-col gap-3 px-5 pt-4 pb-0 md:flex-row md:items-center md:justify-between md:gap-0">
                    <div className="flex">
                        {(["all", "active", "inactive"] as const).map((tab) => {
                            const count = tab === "all" ? allCount : tab === "active" ? activeCount : inactiveCount
                            const label = tab === "all" ? "All" : tab === "active" ? "Active" : "Inactive"
                            return (
                                <button
                                    key={tab}
                                    onClick={() => { setActiveTab(tab); setCurrentPage(1) }}
                                    className={cn("border-b-2 px-4 pb-3 text-sm font-medium transition-colors", activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}
                                >
                                    {label} ({count})
                                </button>
                            )
                        })}
                    </div>



                    <div className="flex flex-wrap items-center gap-2 pb-3 sm:gap-3">
                        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 sm:flex-none">
                            <Search size={16} className="shrink-0 text-muted-foreground" />
                            <input type="text" placeholder="Search..." value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }} className="w-full min-w-0 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none sm:w-56" />
                            {search && (
                                <button onClick={() => setSearch("")} aria-label="Clear search">
                                    <X size={14} className="text-muted-foreground hover:text-foreground" />
                                </button>
                            )}
                        </div>
                        <button
                            onClick={() => setIsFilterOpen(true)}
                            className="relative flex items-center gap-2 rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
                        >
                            <SlidersHorizontal size={16} />
                            <span className="hidden sm:inline">Filters</span>
                        </button>

                        <div className="flex items-center rounded-xl bg-[#F0F0F0] border border-border/60 bg-muted/30 p-1 shadow-sm">
                            <button
                                onClick={() => setViewMode("table")}
                                className={cn(
                                    "relative flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition-all duration-200 sm:text-sm",
                                    viewMode === "table"
                                        ? "bg-card shadow-sm text-foreground text-primary"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                Table
                            </button>

                            <button
                                onClick={() => setViewMode("kanban")}
                                className={cn(
                                    "relative flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition-all duration-200 sm:text-sm",
                                    viewMode === "kanban"
                                        ? "bg-card shadow-sm text-foreground text-primary"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                Kanban
                            </button>
                        </div>

                        <button onClick={() => setIsAdding(true)} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                            <Plus size={16} />
                            <span className="hidden sm:inline">Add Lead</span>
                        </button>
                    </div>
                </div>

                <Modal
                    open={isFilterOpen}
                    onClose={() => setIsFilterOpen(false)}
                    title="Filter Clients"
                >
                    <div className="flex flex-col gap-5">

                        {/* Industry */}
                        <div>
                            <label className={labelCls}>Industry</label>
                            <select
                                value={filterIndustry}
                                onChange={(e) => setFilterIndustry(e.target.value)}
                                className={selectCls}
                            >
                                <option value="">All Industries</option>
                                {INDUSTRY_OPTIONS.map((o) => (
                                    <option key={o} value={o}>{o}</option>
                                ))}
                            </select>
                        </div>

                        {/* Source */}
                        <div>
                            <label className={labelCls}>Source</label>
                            <select
                                value={filterSource}
                                onChange={(e) => setFilterSource(e.target.value)}
                                className={selectCls}
                            >
                                <option value="">All Sources</option>
                                {SOURCE_OPTIONS.map((o) => (
                                    <option key={o} value={o}>{o}</option>
                                ))}
                            </select>
                        </div>

                        {/* Country */}
                        <div>
                            <label className={labelCls}>Country</label>
                            <input
                                type="text"
                                value={filterCountry}
                                onChange={(e) => setFilterCountry(e.target.value)}
                                placeholder="e.g. Australia"
                                className={inputCls}
                            />
                        </div>

                        {/* Status */}
                        <div>
                            <label className={labelCls}>Status</label>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className={selectCls}
                            >
                                <option value="all">All Status</option>
                                {STATUS_OPTIONS.map((o) => (
                                    <option key={o} value={o}>
                                        {o}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => {
                                    setFilterIndustry("")
                                    setFilterSource("")
                                    setFilterCountry("")
                                    setFilterStatus("all")
                                }}
                                className="flex-1 rounded-md border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted"
                            >
                                Reset
                            </button>

                            <button
                                onClick={() => {
                                    setCurrentPage(1)
                                    setIsFilterOpen(false)
                                }}
                                className="flex-1 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                            >
                                Apply
                            </button>
                        </div>

                    </div>
                </Modal>


                {/* Table */}
                {viewMode === "table" ? (
                    <div className="overflow-visible">
                        <table className="w-full border-collapse border-0">
                            <thead className="bg-muted/40">
                                <tr className="text-left">
                                    <th className="py-3 pl-5 pr-2 font-normal"><input type="checkbox" className="h-4 w-4 rounded border-border accent-primary" /></th>
                                    <th className="px-3 py-3 text-xs font-medium text-muted-foreground">Name</th>
                                    <th className="px-3 py-3 text-xs font-medium text-muted-foreground">Company</th>
                                    <th className="px-3 py-3 text-xs font-medium text-muted-foreground">Industry</th>
                                    <th className="px-3 py-3 text-xs font-medium text-muted-foreground">Source</th>
                                    <th className="px-3 py-3 text-xs font-medium text-muted-foreground">Status</th>
                                    <th className="px-3 py-3 text-xs font-medium text-muted-foreground">Follow Up</th>
                                    <th className="px-3 py-3 text-xs font-medium text-muted-foreground">Created</th>
                                    <th className="w-10 py-3 pr-5" />
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.map((lead) => (
                                    <tr key={lead.id} className="transition-all duration-200 hover:bg-muted/40">
                                        <td className="py-4 pl-5 pr-2">
                                            <input type="checkbox" className="h-4 w-4 rounded border-border accent-primary" />
                                        </td>
                                        <td className="px-3 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <img src={lead.avatar} alt={lead.name} className="h-10 w-10 rounded-full object-cover" />
                                                    {lead.online && <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-card bg-[#39ffb3]" />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-foreground">{lead.name}</p>
                                                    <p className="text-xs text-muted-foreground">{lead.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className={cn("flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold text-white", lead.companyLogoColor)}>
                                                    {lead.companyLogo}
                                                </span>
                                                <span className="text-sm text-foreground">{lead.company}</span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-4">
                                            <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", INDUSTRY_COLORS[lead.industry] || "bg-muted text-foreground")}>{lead.industry}</span>
                                        </td>
                                        <td className="px-3 py-4">
                                            <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", SOURCE_COLORS[lead.source] || "bg-muted text-foreground")}>{lead.source}</span>
                                        </td>
                                        <td className="px-3 py-4">
                                            <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", STATUS_COLORS[lead.status] || "bg-muted text-foreground")}>{lead.status}</span>
                                        </td>
                                        <td className="px-3 py-4 text-sm text-foreground">
                                            {lead.followUp
                                                ? new Date(lead.followUp).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric",
                                                })
                                                : "-"}
                                        </td>
                                        <td className="px-3 py-4 text-sm text-foreground">{lead.created}</td>
                                        <td className="relative py-4 pr-5">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActionMenuId(actionMenuId === lead.id ? null : lead.id)
                                                }} className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-0 focus-visible:outline-none"

                                                aria-label="Actions"
                                            >
                                                <MoreVertical size={16} />
                                            </button>
                                            {actionMenuId === lead.id && (
                                                <div className="absolute right-5 top-12 z-10 w-36 rounded-lg bg-card py-1 shadow-lg">
                                                    <button
                                                        onClick={() => {
                                                            const leadToEdit = leads.find((l) => l.id === lead.id)
                                                            if (!leadToEdit) return

                                                            setFName(leadToEdit.name)
                                                            setFEmail(leadToEdit.email)
                                                            setFCompany(leadToEdit.company)
                                                            setFIndustry(leadToEdit.industry)
                                                            setFSource(leadToEdit.source)
                                                            setFStatus(leadToEdit.status)
                                                            setFFollowUp(leadToEdit.followUp || "")

                                                            setEditingId(lead.id)
                                                            setOriginalLead(leadToEdit)
                                                            setIsAdding(true)
                                                            setActionMenuId(null)
                                                        }}
                                                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setDeleteLead(lead)
                                                            setActionMenuId(null)
                                                        }}
                                                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {paginated.length === 0 && (
                                    <tr>
                                        <td colSpan={9} className="py-20 text-center">
                                            <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                                <Users size={24} />
                                                <p className="text-sm font-medium">No leads found</p>
                                                <p className="text-xs">
                                                    Try adjusting your filters or add a new lead
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}


                            </tbody>
                        </table>
                    </div>
                ) : (
                    <SalesKanban
                        leads={filtered}
                        statuses={STATUS_OPTIONS}
                        onStatusChange={handleStatusChange}
                    />
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-1 px-5 py-4">
                        <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted disabled:opacity-30" aria-label="Previous page">
                            <ChevronLeft size={16} />
                        </button>
                        {pageNumbers().map((p, i) =>
                            p === "..." ? (
                                <span key={`e${i}`} className="flex h-8 w-8 items-center justify-center text-sm text-muted-foreground">...</span>
                            ) : (
                                <button key={p} onClick={() => setCurrentPage(p as number)} className={cn("flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors", currentPage === p ? "border border-primary bg-card text-primary" : "text-muted-foreground hover:bg-muted")}>{p}</button>
                            )
                        )}
                        <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted disabled:opacity-30" aria-label="Next page">
                            <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>

            {/* Add Lead Modal */}
            <Modal open={isAdding} onClose={resetForm} title="New Lead" size="lg">
                <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <div className="flex-1">
                                <label className={labelCls}>Full Name *</label>
                                <input type="text" value={fName} onChange={(e) => setFName(e.target.value)} placeholder="e.g. John Doe" className={inputCls} />
                            </div>
                            <div className="flex-1">
                                <label className={labelCls}>Email *</label>
                                <input type="email" value={fEmail} onChange={(e) => setFEmail(e.target.value)} placeholder="e.g. john@company.com" className={inputCls} />
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <div className="flex-1">
                                <label className={labelCls}>Company</label>
                                <input type="text" value={fCompany} onChange={(e) => setFCompany(e.target.value)} placeholder="e.g. Acme Corp" className={inputCls} />
                            </div>
                            <div className="flex-1">
                                <label className={labelCls}>Industry</label>
                                <select value={fIndustry} onChange={(e) => setFIndustry(e.target.value)} className={selectCls}>
                                    {INDUSTRY_OPTIONS.map((o) => (<option key={o} value={o}>{o}</option>))}
                                </select>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <div className="flex-1">
                                <label className={labelCls}>Source</label>
                                <select value={fSource} onChange={(e) => setFSource(e.target.value)} className={selectCls}>
                                    {SOURCE_OPTIONS.map((o) => (<option key={o} value={o}>{o}</option>))}
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className={labelCls}>Status</label>
                                <select value={fStatus} onChange={(e) => setFStatus(e.target.value)} className={selectCls}>
                                    {STATUS_OPTIONS.map((o) => (<option key={o} value={o}>{o}</option>))}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className={labelCls}>Follow Up Date</label>
                            <input type="date" value={fFollowUp} onChange={(e) => setFFollowUp(e.target.value)} className={inputCls} />
                        </div>
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                        <button onClick={resetForm} className="flex-1 rounded-md border border-border bg-card px-4 py-2.5 text-sm font-medium text-card-foreground transition-colors hover:bg-muted">
                            Cancel
                        </button>
                        <button
                            onClick={editingId ? handleUpdateLead : handleAddLead}
                            disabled={
                                !fName.trim() ||
                                !fEmail.trim() ||
                                !isFormChanged
                            }
                            className="flex-1 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-[#D0E1E5] disabled:text-white disabled:opacity-100"
                        >
                            {editingId ? "Update Lead" : "Add Lead"}
                        </button>
                    </div>
                </div>
            </Modal>
            <Modal
                open={!!deleteLead}
                onClose={() => setDeleteLead(null)}
                title="Confirm Delete"
                size="sm"
            >
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Are you sure you want to delete{" "}
                        <span className="font-semibold text-foreground">
                            {deleteLead?.name}
                        </span>
                        ? This action cannot be undone.
                    </p>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setDeleteLead(null)}
                            className="flex-1 rounded-md border border-border px-4 py-2 text-sm"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={() => {
                                if (deleteLead) handleDeleteLead(deleteLead.id)
                                setDeleteLead(null)
                            }}
                            className="flex-1 rounded-md bg-red-600 px-4 py-2 text-sm text-white"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
