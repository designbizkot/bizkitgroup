"use client"

import { useState, useMemo } from "react"
import {
  Search,
  SlidersHorizontal,
  Plus,
  ChevronLeft,
  ChevronRight,
  Linkedin,
  Phone,
  Mail,
  Pencil,
  Trash2,
  X,
  ArrowLeft,
  Building2,
  MapPin,
  CreditCard,
  Globe,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Modal } from "@/components/modal"

interface Client {
  id: string
  name: string
  email: string
  avatar: string
  online: boolean
  company: string
  companyLogo: string
  companyLogoColor: string
  companyWebsite: string
  industry: string
  industryColor: string
  source: string
  sourceColor: string
  city: string
  country: string
  linkedin: string
  phone: string
  active: boolean
  billingName: string
  billingEmail: string
  billingAbn: string
}

const INDUSTRY_COLORS: Record<string, string> = {
  Technology: "bg-[#e8f0f2] text-[#0d404b]",
  Finance: "bg-[#e8f0f2] text-[#0d404b]",
  Healthcare: "bg-[#e8f0f2] text-[#0d404b]",
  Retail: "bg-[#e8f0f2] text-[#0d404b]",
  Education: "bg-[#e8f0f2] text-[#0d404b]",
  Marketing: "bg-[#e8f0f2] text-[#0d404b]",
  Logistics: "bg-[#e8f0f2] text-[#0d404b]",
  Consulting: "bg-[#e8f0f2] text-[#0d404b]",
  Advertising: "bg-[#e8f0f2] text-[#0d404b]",
}

const SOURCE_COLORS: Record<string, string> = {
  LinkedIn: "bg-[#092a32] text-[#fdffff]",
  Website: "bg-[#092a32] text-[#fdffff]",
  Referral: "bg-[#092a32] text-[#fdffff]",
}

const INDUSTRY_OPTIONS = [
  "Technology", "Finance", "Healthcare", "Retail", "Education",
  "Marketing", "Logistics", "Consulting", "Advertising",
]

const SOURCE_OPTIONS = ["LinkedIn", "Website", "Referral"]

const initialClients: Client[] = [
  {
    id: "1",
    name: "Olivia Rhye",
    email: "olivia@untitledui.com",
    avatar: "/placeholder.svg?height=40&width=40&query=professional woman face portrait",
    online: true,
    company: "EdgeTech Solutions Inc.",
    companyLogo: "E",
    companyLogoColor: "bg-[#166a7d]",
    companyWebsite: "https://edgetech.com.au",
    industry: "Technology",
    industryColor: INDUSTRY_COLORS.Technology,
    source: "LinkedIn",
    sourceColor: SOURCE_COLORS.LinkedIn,
    city: "Sydney",
    country: "Australia",
    linkedin: "https://linkedin.com/in/oliviarhye",
    phone: "+61 2 9000 0000",
    active: true,
    billingName: "Olivia Rhye",
    billingEmail: "billing@edgetech.com",
    billingAbn: "51 824 753 556",
  },
]

const ITEMS_PER_PAGE = 9

/* ---- Form field types ---- */
interface FormValues {
  name: string; email: string; company: string; companyWebsite: string
  industry: string; source: string; city: string; country: string
  phone: string; linkedin: string
  billingName: string; billingEmail: string; billingAbn: string
}

interface FormSetters {
  setName: (v: string) => void; setEmail: (v: string) => void
  setCompany: (v: string) => void; setCompanyWebsite: (v: string) => void
  setIndustry: (v: string) => void; setSource: (v: string) => void
  setCity: (v: string) => void; setCountry: (v: string) => void
  setPhone: (v: string) => void; setLinkedin: (v: string) => void
  setBillingName: (v: string) => void; setBillingEmail: (v: string) => void
  setBillingAbn: (v: string) => void
}

export function ClientsTable() {
  const [clients, setClients] = useState<Client[]>(initialClients)
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState<"active" | "inactive">("active")
  const [currentPage, setCurrentPage] = useState(1)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [viewingClient, setViewingClient] = useState<Client | null>(null)

  /* ---- Add modal state ---- */
  const [isAdding, setIsAdding] = useState(false)
  const [newName, setNewName] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newCompany, setNewCompany] = useState("")
  const [newCompanyWebsite, setNewCompanyWebsite] = useState("")
  const [newIndustry, setNewIndustry] = useState(INDUSTRY_OPTIONS[0])
  const [newSource, setNewSource] = useState(SOURCE_OPTIONS[0])
  const [newCity, setNewCity] = useState("")
  const [newCountry, setNewCountry] = useState("")
  const [newPhone, setNewPhone] = useState("")
  const [newLinkedin, setNewLinkedin] = useState("")
  const [newBillingName, setNewBillingName] = useState("")
  const [newBillingEmail, setNewBillingEmail] = useState("")
  const [newBillingAbn, setNewBillingAbn] = useState("")

  /* ---- Edit modal state ---- */
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [editName, setEditName] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [editCompany, setEditCompany] = useState("")
  const [editCompanyWebsite, setEditCompanyWebsite] = useState("")
  const [editIndustry, setEditIndustry] = useState(INDUSTRY_OPTIONS[0])
  const [editSource, setEditSource] = useState(SOURCE_OPTIONS[0])
  const [editCity, setEditCity] = useState("")
  const [editCountry, setEditCountry] = useState("")
  const [editPhone, setEditPhone] = useState("")
  const [editLinkedin, setEditLinkedin] = useState("")
  const [editBillingName, setEditBillingName] = useState("")
  const [editBillingEmail, setEditBillingEmail] = useState("")
  const [editBillingAbn, setEditBillingAbn] = useState("")

  const [deletingClient, setDeletingClient] = useState<Client | null>(null)

  /* ---- Filtering / pagination ---- */
  const filtered = useMemo(() => {
    return clients.filter((c) => {
      const matchesTab = activeTab === "active" ? c.active : !c.active
      const matchesSearch =
        !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.company.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase())
      return matchesTab && matchesSearch
    })
  }, [clients, activeTab, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  )

  const activeCount = clients.filter((c) => c.active).length
  const inactiveCount = clients.filter((c) => !c.active).length

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selected.size === paginated.length) setSelected(new Set())
    else setSelected(new Set(paginated.map((c) => c.id)))
  }

  /* ---- Add ---- */
  const resetAddForm = () => {
    setNewName(""); setNewEmail(""); setNewCompany(""); setNewCompanyWebsite("")
    setNewIndustry(INDUSTRY_OPTIONS[0]); setNewSource(SOURCE_OPTIONS[0])
    setNewCity(""); setNewCountry(""); setNewPhone(""); setNewLinkedin("")
    setNewBillingName(""); setNewBillingEmail(""); setNewBillingAbn("")
    setIsAdding(false)
  }

  const handleAddClient = () => {
    if (!newName.trim() || !newEmail.trim()) return
    const c: Client = {
      id: Date.now().toString(),
      name: newName.trim(),
      email: newEmail.trim(),
      avatar: `/placeholder.svg?height=40&width=40&query=${encodeURIComponent(newName.trim())} portrait`,
      online: true,
      company: newCompany.trim() || "Unknown",
      companyLogo: (newCompany.trim() || "U").charAt(0).toUpperCase(),
      companyLogoColor: "bg-[#166a7d]",
      companyWebsite: newCompanyWebsite.trim(),
      industry: newIndustry,
      industryColor: INDUSTRY_COLORS[newIndustry],
      source: newSource,
      sourceColor: SOURCE_COLORS[newSource],
      city: newCity.trim(),
      country: newCountry.trim(),
      linkedin: newLinkedin.trim() || "#",
      phone: newPhone.trim(),
      active: true,
      billingName: newBillingName.trim(),
      billingEmail: newBillingEmail.trim(),
      billingAbn: newBillingAbn.trim(),
    }
    setClients((prev) => [c, ...prev])
    setCurrentPage(1)
    setActiveTab("active")
    resetAddForm()
  }

  /* ---- Edit ---- */
  const openEditModal = (client: Client) => {
    setEditingClient(client)
    setEditName(client.name); setEditEmail(client.email)
    setEditCompany(client.company); setEditCompanyWebsite(client.companyWebsite)
    setEditIndustry(client.industry); setEditSource(client.source)
    setEditCity(client.city); setEditCountry(client.country)
    setEditPhone(client.phone); setEditLinkedin(client.linkedin)
    setEditBillingName(client.billingName); setEditBillingEmail(client.billingEmail)
    setEditBillingAbn(client.billingAbn)
  }

  const resetEditForm = () => setEditingClient(null)

  const handleEditClient = () => {
    if (!editingClient || !editName.trim() || !editEmail.trim()) return
    setClients((prev) =>
      prev.map((c) =>
        c.id === editingClient.id
          ? {
              ...c,
              name: editName.trim(),
              email: editEmail.trim(),
              company: editCompany.trim() || "Unknown",
              companyLogo: (editCompany.trim() || "U").charAt(0).toUpperCase(),
              companyWebsite: editCompanyWebsite.trim(),
              industry: editIndustry,
              industryColor: INDUSTRY_COLORS[editIndustry],
              source: editSource,
              sourceColor: SOURCE_COLORS[editSource],
              city: editCity.trim(),
              country: editCountry.trim(),
              linkedin: editLinkedin.trim() || "#",
              phone: editPhone.trim(),
              billingName: editBillingName.trim(),
              billingEmail: editBillingEmail.trim(),
              billingAbn: editBillingAbn.trim(),
            }
          : c,
      ),
    )
    resetEditForm()
  }

  /* ---- Delete ---- */
  const handleDeleteClient = () => {
    if (!deletingClient) return
    setClients((prev) => prev.filter((c) => c.id !== deletingClient.id))
    setSelected((prev) => {
      const next = new Set(prev)
      next.delete(deletingClient.id)
      return next
    })
    setDeletingClient(null)
    if (viewingClient?.id === deletingClient.id) setViewingClient(null)
  }

  /* ---- Pagination ---- */
  const renderPageNumbers = () => {
    const pages: (number | string)[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1, 2, 3)
      if (currentPage > 4) pages.push("...")
      if (currentPage > 3 && currentPage < totalPages - 2) pages.push(currentPage)
      if (currentPage < totalPages - 3) pages.push("...")
      pages.push(totalPages - 2, totalPages - 1, totalPages)
    }
    const unique: (number | string)[] = []
    for (const p of pages) {
      if (unique[unique.length - 1] !== p) unique.push(p)
    }
    return unique
  }

  /* ---- Input helpers ---- */
  const inputCls =
    "w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
  const labelCls = "mb-1 block text-xs font-medium text-muted-foreground"
  const selectCls =
    "w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"

  /* ---- Shared form ---- */
  const renderFormFields = (values: FormValues, setters: FormSetters) => (
    <div className="flex flex-col gap-5">
      {/* Contact Information */}
      <div>
        <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Building2 size={15} className="text-primary" />
          Contact Information
        </h4>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <label className={labelCls}>Full Name *</label>
              <input type="text" value={values.name} onChange={(e) => setters.setName(e.target.value)} placeholder="e.g. John Doe" className={inputCls} />
            </div>
            <div className="flex-1">
              <label className={labelCls}>Email *</label>
              <input type="email" value={values.email} onChange={(e) => setters.setEmail(e.target.value)} placeholder="e.g. john@company.com" className={inputCls} />
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <label className={labelCls}>Company</label>
              <input type="text" value={values.company} onChange={(e) => setters.setCompany(e.target.value)} placeholder="e.g. Acme Corp" className={inputCls} />
            </div>
            <div className="flex-1">
              <label className={labelCls}>Company Website</label>
              <input type="url" value={values.companyWebsite} onChange={(e) => setters.setCompanyWebsite(e.target.value)} placeholder="e.g. https://acme.com" className={inputCls} />
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <label className={labelCls}>Phone</label>
              <input type="tel" value={values.phone} onChange={(e) => setters.setPhone(e.target.value)} placeholder="e.g. +61 2 9000 0000" className={inputCls} />
            </div>
            <div className="flex-1">
              <label className={labelCls}>LinkedIn URL</label>
              <input type="url" value={values.linkedin} onChange={(e) => setters.setLinkedin(e.target.value)} placeholder="e.g. https://linkedin.com/in/johndoe" className={inputCls} />
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <label className={labelCls}>Industry</label>
              <select value={values.industry} onChange={(e) => setters.setIndustry(e.target.value)} className={selectCls}>
                {INDUSTRY_OPTIONS.map((o) => (<option key={o} value={o}>{o}</option>))}
              </select>
            </div>
            <div className="flex-1">
              <label className={labelCls}>Source</label>
              <select value={values.source} onChange={(e) => setters.setSource(e.target.value)} className={selectCls}>
                {SOURCE_OPTIONS.map((o) => (<option key={o} value={o}>{o}</option>))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Location */}
      <div>
        <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
          <MapPin size={15} className="text-primary" />
          Location
        </h4>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <label className={labelCls}>City</label>
            <input type="text" value={values.city} onChange={(e) => setters.setCity(e.target.value)} placeholder="e.g. Sydney" className={inputCls} />
          </div>
          <div className="flex-1">
            <label className={labelCls}>Country</label>
            <input type="text" value={values.country} onChange={(e) => setters.setCountry(e.target.value)} placeholder="e.g. Australia" className={inputCls} />
          </div>
        </div>
      </div>

      {/* Billing Details */}
      <div>
        <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
          <CreditCard size={15} className="text-primary" />
          Billing Details
        </h4>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <label className={labelCls}>Billing Name</label>
              <input type="text" value={values.billingName} onChange={(e) => setters.setBillingName(e.target.value)} placeholder="e.g. John Doe" className={inputCls} />
            </div>
            <div className="flex-1">
              <label className={labelCls}>Billing Email</label>
              <input type="email" value={values.billingEmail} onChange={(e) => setters.setBillingEmail(e.target.value)} placeholder="e.g. billing@company.com" className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Business ID / ABN</label>
            <input type="text" value={values.billingAbn} onChange={(e) => setters.setBillingAbn(e.target.value)} placeholder="e.g. 51 824 753 556" className={inputCls} />
          </div>
        </div>
      </div>
    </div>
  )

  /* ---- Build form values/setters for add ---- */
  const addValues: FormValues = {
    name: newName, email: newEmail, company: newCompany, companyWebsite: newCompanyWebsite,
    industry: newIndustry, source: newSource, city: newCity, country: newCountry,
    phone: newPhone, linkedin: newLinkedin,
    billingName: newBillingName, billingEmail: newBillingEmail, billingAbn: newBillingAbn,
  }
  const addSetters: FormSetters = {
    setName: setNewName, setEmail: setNewEmail, setCompany: setNewCompany, setCompanyWebsite: setNewCompanyWebsite,
    setIndustry: setNewIndustry, setSource: setNewSource, setCity: setNewCity, setCountry: setNewCountry,
    setPhone: setNewPhone, setLinkedin: setNewLinkedin,
    setBillingName: setNewBillingName, setBillingEmail: setNewBillingEmail, setBillingAbn: setNewBillingAbn,
  }

  /* ---- Build form values/setters for edit ---- */
  const editValues: FormValues = {
    name: editName, email: editEmail, company: editCompany, companyWebsite: editCompanyWebsite,
    industry: editIndustry, source: editSource, city: editCity, country: editCountry,
    phone: editPhone, linkedin: editLinkedin,
    billingName: editBillingName, billingEmail: editBillingEmail, billingAbn: editBillingAbn,
  }
  const editSetters: FormSetters = {
    setName: setEditName, setEmail: setEditEmail, setCompany: setEditCompany, setCompanyWebsite: setEditCompanyWebsite,
    setIndustry: setEditIndustry, setSource: setEditSource, setCity: setEditCity, setCountry: setEditCountry,
    setPhone: setEditPhone, setLinkedin: setEditLinkedin,
    setBillingName: setEditBillingName, setBillingEmail: setEditBillingEmail, setBillingAbn: setEditBillingAbn,
  }

  /* =============== CLIENT DETAIL VIEW =============== */
  if (viewingClient) {
    return (
      <div>
        <button
          onClick={() => setViewingClient(null)}
          className="mb-5 flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          <ArrowLeft size={16} />
          Back to Client List
        </button>

        <div className="rounded-xl bg-card">
          {/* Header */}
          <div className="flex flex-col gap-4 border-b border-border p-4 sm:flex-row sm:items-start sm:justify-between sm:p-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={viewingClient.avatar || "/placeholder.svg"}
                  alt={viewingClient.name}
                  className="h-16 w-16 rounded-full object-cover"
                />
                {viewingClient.online && (
                  <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-card bg-[#39ffb3]" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">{viewingClient.name}</h2>
                <p className="text-sm text-muted-foreground">{viewingClient.email}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className={cn("inline-block rounded-full px-3 py-0.5 text-xs font-medium", viewingClient.industryColor)}>
                    {viewingClient.industry}
                  </span>
                  <span className={cn("inline-block rounded-full px-3 py-0.5 text-xs font-medium", viewingClient.sourceColor)}>
                    {viewingClient.source}
                  </span>
                  <span className={cn("inline-block rounded-full px-3 py-0.5 text-xs font-medium", viewingClient.active ? "bg-[#d1fae5] text-[#065f46]" : "bg-[#fee2e2] text-[#991b1b]")}>
                    {viewingClient.active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => openEditModal(viewingClient)}
                className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <Pencil size={14} />
                Edit
              </button>
              <button
                onClick={() => setDeletingClient(viewingClient)}
                className="flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </div>

          {/* Detail grid */}
          <div className="grid grid-cols-1 gap-5 p-4 sm:grid-cols-2 sm:p-6">
            {/* Company */}
            <div className="rounded-lg border border-border p-4">
              <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Building2 size={14} />
                Company
              </h4>
              <div className="flex items-center gap-2">
                <span className={cn("flex h-8 w-8 items-center justify-center rounded-md text-xs font-bold text-white", viewingClient.companyLogoColor)}>
                  {viewingClient.companyLogo}
                </span>
                <div>
                  <span className="text-sm font-medium text-foreground">{viewingClient.company}</span>
                  {viewingClient.companyWebsite && (
                    <a
                      href={viewingClient.companyWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <Globe size={11} />
                      {viewingClient.companyWebsite.replace(/^https?:\/\//, "")}
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="rounded-lg border border-border p-4">
              <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <MapPin size={14} />
                Location
              </h4>
              <p className="text-sm font-medium text-foreground">
                {viewingClient.city}{viewingClient.city && viewingClient.country ? ", " : ""}{viewingClient.country}
              </p>
            </div>

            {/* Contact */}
            <div className="rounded-lg border border-border p-4">
              <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Phone size={14} />
                Contact
              </h4>
              <div className="flex flex-col gap-1.5">
                {viewingClient.phone && (
                  <a href={`tel:${viewingClient.phone}`} className="flex items-center gap-2 text-sm text-foreground hover:text-primary">
                    <Phone size={13} className="text-muted-foreground" />
                    {viewingClient.phone}
                  </a>
                )}
                <a href={`mailto:${viewingClient.email}`} className="flex items-center gap-2 text-sm text-foreground hover:text-primary">
                  <Mail size={13} className="text-muted-foreground" />
                  {viewingClient.email}
                </a>
                {viewingClient.linkedin && viewingClient.linkedin !== "#" && (
                  <a href={viewingClient.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-foreground hover:text-primary">
                    <Linkedin size={13} className="text-muted-foreground" />
                    LinkedIn
                  </a>
                )}
              </div>
            </div>

            {/* Billing Details */}
            <div className="rounded-lg border border-border p-4">
              <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <CreditCard size={14} />
                Billing Details
              </h4>
              <div className="flex flex-col gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">Name</p>
                  <p className="text-sm font-medium text-foreground">{viewingClient.billingName || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium text-foreground">{viewingClient.billingEmail || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Business ID / ABN</p>
                  <p className="text-sm font-medium text-foreground">{viewingClient.billingAbn || "-"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit modal from detail view */}
        <Modal open={!!editingClient} onClose={resetEditForm} title="Edit Client" size="lg">
          {editingClient && renderFormFields(editValues, editSetters)}
          <div className="flex items-center gap-3 pt-4">
            <button onClick={resetEditForm} className="flex-1 rounded-md border border-border bg-card px-4 py-2.5 text-sm font-medium text-card-foreground transition-colors hover:bg-muted">Cancel</button>
            <button
              onClick={() => {
                handleEditClient()
                const updated = clients.find((c) => c.id === editingClient?.id)
                if (updated) setViewingClient(updated)
              }}
              disabled={!editName.trim() || !editEmail.trim()}
              className="flex-1 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-[#D0E1E5] disabled:text-white disabled:opacity-100"
            >Save Changes</button>
          </div>
        </Modal>

        {/* Delete modal from detail view */}
        <Modal open={!!deletingClient} onClose={() => setDeletingClient(null)} title="Delete Client">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete <span className="font-semibold text-foreground">{deletingClient?.name}</span>? This action cannot be undone.
          </p>
          <div className="flex items-center gap-3 pt-4">
            <button onClick={() => setDeletingClient(null)} className="flex-1 rounded-md border border-border bg-card px-4 py-2.5 text-sm font-medium text-card-foreground transition-colors hover:bg-muted">Cancel</button>
            <button onClick={handleDeleteClient} className="flex-1 rounded-md bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700">Delete</button>
          </div>
        </Modal>
      </div>
    )
  }

  /* =============== TABLE VIEW =============== */
  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-foreground">
          Client Management{" "}
          <span className="text-base font-normal text-accent">
            {clients.length} {clients.length === 1 ? "user" : "users"}
          </span>
        </h1>
      </div>

      <div className="rounded-xl bg-card">
        <div className="flex flex-col gap-3 border-b border-border px-5 pt-4 pb-0 md:flex-row md:items-center md:justify-between md:gap-0">
          <div className="flex">
            <button
              onClick={() => { setActiveTab("active"); setCurrentPage(1) }}
              className={cn("border-b-2 px-4 pb-3 text-sm font-medium transition-colors", activeTab === "active" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}
            >
              Active ({activeCount})
            </button>
            <button
              onClick={() => { setActiveTab("inactive"); setCurrentPage(1) }}
              className={cn("border-b-2 px-4 pb-3 text-sm font-medium transition-colors", activeTab === "inactive" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}
            >
              Inactive ({inactiveCount})
            </button>
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
            <button className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
              <SlidersHorizontal size={16} />
              <span className="hidden sm:inline">Filters</span>
            </button>
            <button onClick={() => setIsAdding(true)} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
              <Plus size={16} />
              <span className="hidden sm:inline">Add Client</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="w-10 py-3 pl-5 pr-2 text-left">
                  <input type="checkbox" checked={paginated.length > 0 && selected.size === paginated.length} onChange={toggleAll} className="h-4 w-4 rounded border-border accent-primary" />
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Name</th>
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Company</th>
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Industry</th>
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Source</th>
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Location</th>
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Contact</th>
                <th className="px-3 py-3 pr-5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((client) => (
                <tr
                  key={client.id}
                  onClick={() => setViewingClient(client)}
                  className="cursor-pointer border-b border-border transition-colors last:border-b-0 hover:bg-muted/30"
                >
                  <td className="py-4 pl-5 pr-2" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={selected.has(client.id)} onChange={() => toggleSelect(client.id)} className="h-4 w-4 rounded border-border accent-primary" />
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img src={client.avatar || "/placeholder.svg"} alt={client.name} className="h-10 w-10 rounded-full object-cover" />
                        {client.online && <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-card bg-[#39ffb3]" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{client.name}</p>
                        <p className="text-xs text-muted-foreground">{client.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-2">
                      <span className={cn("flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold text-white", client.companyLogoColor)}>{client.companyLogo}</span>
                      <span className="text-sm text-foreground">{client.company}</span>
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <span className={cn("inline-block rounded-full px-3 py-1 text-xs font-medium", client.industryColor)}>{client.industry}</span>
                  </td>
                  <td className="px-3 py-4">
                    <span className={cn("inline-block rounded-full px-3 py-1 text-xs font-medium", client.sourceColor)}>{client.source}</span>
                  </td>
                  <td className="px-3 py-4">
                    <p className="text-sm text-foreground">
                      {client.city}{client.city && client.country ? ", " : ""}{client.country}
                    </p>
                  </td>
                  <td className="px-3 py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <a href={client.linkedin} target="_blank" rel="noopener noreferrer" className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label={`LinkedIn profile of ${client.name}`}>
                        <Linkedin size={16} />
                      </a>
                      <a href={`tel:${client.phone}`} className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label={`Call ${client.name}`}>
                        <Phone size={16} />
                      </a>
                      <a href={`mailto:${client.email}`} className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label={`Email ${client.name}`}>
                        <Mail size={16} />
                      </a>
                    </div>
                  </td>
                  <td className="px-3 py-4 pr-5" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEditModal(client)} className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-[#e8f0f2] hover:text-primary" aria-label={`Edit ${client.name}`}>
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => setDeletingClient(client)} className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600" aria-label={`Delete ${client.name}`}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-sm text-muted-foreground">No clients found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-end gap-1 border-t border-border px-5 py-3">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40" aria-label="Previous page">
              <ChevronLeft size={16} />
            </button>
            {renderPageNumbers().map((page, i) =>
              typeof page === "string" ? (
                <span key={`ellipsis-${i}`} className="flex h-8 w-8 items-center justify-center text-sm text-muted-foreground">...</span>
              ) : (
                <button key={page} onClick={() => setCurrentPage(page)} className={cn("flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors", currentPage === page ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
                  {page}
                </button>
              ),
            )}
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40" aria-label="Next page">
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Add Client Modal */}
      <Modal open={isAdding} onClose={resetAddForm} title="New Client" size="lg">
        {renderFormFields(addValues, addSetters)}
        <div className="flex items-center gap-3 pt-4">
          <button onClick={resetAddForm} className="flex-1 rounded-md border border-border bg-card px-4 py-2.5 text-sm font-medium text-card-foreground transition-colors hover:bg-muted">Cancel</button>
          <button onClick={handleAddClient} disabled={!newName.trim() || !newEmail.trim()} className="flex-1 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-[#D0E1E5] disabled:text-white disabled:opacity-100">Add Client</button>
        </div>
      </Modal>

      {/* Edit Client Modal */}
      <Modal open={!!editingClient} onClose={resetEditForm} title="Edit Client" size="lg">
        {editingClient && renderFormFields(editValues, editSetters)}
        <div className="flex items-center gap-3 pt-4">
          <button onClick={resetEditForm} className="flex-1 rounded-md border border-border bg-card px-4 py-2.5 text-sm font-medium text-card-foreground transition-colors hover:bg-muted">Cancel</button>
          <button onClick={handleEditClient} disabled={!editName.trim() || !editEmail.trim()} className="flex-1 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-[#D0E1E5] disabled:text-white disabled:opacity-100">Save Changes</button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={!!deletingClient} onClose={() => setDeletingClient(null)} title="Delete Client">
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete <span className="font-semibold text-foreground">{deletingClient?.name}</span>? This action cannot be undone.
        </p>
        <div className="flex items-center gap-3 pt-4">
          <button onClick={() => setDeletingClient(null)} className="flex-1 rounded-md border border-border bg-card px-4 py-2.5 text-sm font-medium text-card-foreground transition-colors hover:bg-muted">Cancel</button>
          <button onClick={handleDeleteClient} className="flex-1 rounded-md bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700">Delete</button>
        </div>
      </Modal>
    </div>
  )
}
