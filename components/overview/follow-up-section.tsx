"use client"

import { useState, useRef, useEffect } from "react"
import { Calendar, Plus } from "lucide-react"
import { Modal } from "@/components/modal"

interface FollowUpItem {
  id: string
  company: string
  name: string
  description: string
  lastContact: string
}

interface FollowUpGroup {
  label: string
  items: FollowUpItem[]
}

const initialGroups: FollowUpGroup[] = [
  {
    label: "Today",
    items: [
      {
        id: "1",
        company: "Nexito Co.Ltd",
        name: "Hanna Rodrigues",
        description: "Follow up about pricing confirmation with Nexito",
        lastContact: "1 day ago",
      },
      {
        id: "2",
        company: "Nexito Co.Ltd",
        name: "Hanna Rodrigues",
        description: "Follow up about pricing confirmation with Nexito",
        lastContact: "2 days ago",
      },
    ],
  },
  {
    label: "Tomorrow",
    items: [
      {
        id: "3",
        company: "Nexito Co.Ltd",
        name: "Hanna Rodrigues",
        description: "Follow up about pricing confirmation with Nexito",
        lastContact: "1 day ago",
      },
      {
        id: "4",
        company: "Nexito Co.Ltd",
        name: "Hanna Rodrigues",
        description: "Follow up about pricing confirmation with Nexito",
        lastContact: "1 day ago",
      },
    ],
  },
]

const SCHEDULE_OPTIONS = ["Today", "Tomorrow", "This Week", "Next Week"]

export function FollowUpSection() {
  const [groups, setGroups] = useState<FollowUpGroup[]>(initialGroups)
  const [isAdding, setIsAdding] = useState(false)
  const [newName, setNewName] = useState("")
  const [newCompany, setNewCompany] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [newSchedule, setNewSchedule] = useState(SCHEDULE_OPTIONS[0])
  const nameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isAdding) {
      setTimeout(() => nameInputRef.current?.focus(), 100)
    }
  }, [isAdding])

  const handleAdd = () => {
    if (!newName.trim() || !newCompany.trim()) return

    const newItem: FollowUpItem = {
      id: Date.now().toString(),
      company: newCompany.trim(),
      name: newName.trim(),
      description: newDescription.trim() || "No description",
      lastContact: "Just now",
    }

    setGroups((prev) => {
      const groupLabel = newSchedule
      const existing = prev.find((g) => g.label === groupLabel)
      if (existing) {
        return prev.map((g) =>
          g.label === groupLabel ? { ...g, items: [...g.items, newItem] } : g
        )
      }
      return [...prev, { label: groupLabel, items: [newItem] }]
    })

    resetForm()
  }

  const resetForm = () => {
    setNewName("")
    setNewCompany("")
    setNewDescription("")
    setNewSchedule(SCHEDULE_OPTIONS[0])
    setIsAdding(false)
  }

  return (
    <section className="rounded-2xl bg-[#FDFFFF] p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-black">Follow Up</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1F6F78] text-white hover:opacity-90"
          aria-label="Add follow up"
        >
          <Plus size={16} />
        </button>
      </div>

      <Modal open={isAdding} onClose={resetForm} title="New Follow Up">
  <div className="flex flex-col gap-4">
    <input
      ref={nameInputRef}
      value={newName}
      onChange={(e) => setNewName(e.target.value)}
      placeholder="Name"
      className="rounded-lg border p-3"
    />

    <input
      value={newCompany}
      onChange={(e) => setNewCompany(e.target.value)}
      placeholder="Company"
      className="rounded-lg border p-3"
    />

    <textarea
      value={newDescription}
      onChange={(e) => setNewDescription(e.target.value)}
      placeholder="Description"
      className="rounded-lg border p-3"
    />

    <select
      value={newSchedule}
      onChange={(e) => setNewSchedule(e.target.value)}
      className="rounded-lg border p-3"
    >
      {SCHEDULE_OPTIONS.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>

    <button
      onClick={handleAdd}
      className="rounded-lg bg-[#1F6F78] py-3 text-white"
    >
      Add
    </button>
  </div>
</Modal>

      {/* ===== DESIGN PART ===== */}
      <div className="mt-8 flex flex-col gap-10">
        {groups.map((group) => (
          <div key={group.label}>
            {/* Header Bar */}
            <div className="flex items-center justify-between rounded-xl bg-[#1F6F78] px-5 py-4">
              <span className="text-lg font-semibold text-white">
                {group.label}
              </span>

              <span className="rounded-lg bg-[#A7C7CD] px-3 py-1 text-sm font-semibold text-black">
                {group.items.length}
              </span>
            </div>

            {/* Items */}
            <div className="mt-6">
              {group.items.map((item, index) => (
                <div key={item.id}>
                  <div className="pb-6">
                    <span className="inline-block rounded-lg bg-[#E6ECEF] px-3 py-1 text-sm font-medium text-gray-700">
                      {item.company}
                    </span>

                    <p className="mt-4 text-2xl font-semibold text-black">
                      {item.name}
                    </p>

                    <p className="mt-2 text-lg text-gray-800">
                      {item.description}
                    </p>

                    <p className="mt-3 text-base text-gray-400">
                      Last Contact :
                      <span className="ml-1 font-semibold text-black">
                        {item.lastContact}
                      </span>
                    </p>
                  </div>

                  {index !== group.items.length - 1 && (
                    <div className="border-t border-gray-200" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
