"use client"

import { useState, useEffect, useRef } from "react"
import { Plus, MoreVertical } from "lucide-react"
import { Modal } from "@/components/modal"

interface FollowUpItem {
  id: string
  company: string
  name: string
  description: string
  schedule_at?: string
}

interface FollowUpGroup {
  label: string
  items: FollowUpItem[]
}

export function FollowUpSection() {
  const [groups, setGroups] = useState<FollowUpGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  const [isAdding, setIsAdding] = useState(false)
  const [isViewing, setIsViewing] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const [selectedItem, setSelectedItem] = useState<FollowUpItem | null>(null)

  const [form, setForm] = useState({
    name: "",
    company: "",
    description: "",
    schedule_at: "",
  })

  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchFollowUps()
  }, [])

  useEffect(() => {
    if (isAdding || isEditing) {
      setTimeout(() => nameRef.current?.focus(), 100)
    }
  }, [isAdding, isEditing])

  async function fetchFollowUps() {
    try {
      setLoading(true)
      const res = await fetch("/api/follow-ups")
      if (!res.ok) return setGroups([])
      const data = await res.json()
      if (!data) return setGroups([])
      setGroups(groupBySchedule(data))
    } finally {
      setLoading(false)
    }
  }

  function groupBySchedule(data: FollowUpItem[]): FollowUpGroup[] {
    const result: Record<string, FollowUpItem[]> = {}
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    data.forEach((item) => {
      if (!item.schedule_at) return
      const date = new Date(item.schedule_at)
      date.setHours(0, 0, 0, 0)

      const diff =
        (date.getTime() - today.getTime()) /
        (1000 * 60 * 60 * 24)

      let label = "Next Week"
      if (diff === 0) label = "Today"
      else if (diff === 1) label = "Tomorrow"
      else if (diff > 1 && diff <= 7) label = "This Week"

      if (!result[label]) result[label] = []
      result[label].push(item)
    })

    return Object.keys(result).map((label) => ({
      label,
      items: result[label],
    }))
  }

  const resetForm = () => {
    setForm({
      name: "",
      company: "",
      description: "",
      schedule_at: "",
    })
    setIsAdding(false)
    setIsEditing(false)
    setSelectedItem(null)
  }

  const isValid =
    form.name.trim() !== "" &&
    form.company.trim() !== "" &&
    form.schedule_at !== ""

  const hasChanges =
    selectedItem &&
    (form.name !== selectedItem.name ||
      form.company !== selectedItem.company ||
      form.description !== selectedItem.description ||
      form.schedule_at !==
      (selectedItem.schedule_at
        ? selectedItem.schedule_at.slice(0, 10)
        : ""))

  async function handleAdd() {
    if (!isValid) return

    await fetch("/api/follow-ups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        schedule_at: new Date(
          form.schedule_at
        ).toISOString(),
      }),
    })

    resetForm()
    fetchFollowUps()
  }

  async function handleUpdate() {
    if (!selectedItem || !hasChanges) return

    await fetch("/api/follow-ups", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: selectedItem.id,
        ...form,
        schedule_at: new Date(
          form.schedule_at
        ).toISOString(),
      }),
    })

    resetForm()
    fetchFollowUps()
  }

  async function confirmDelete() {
    if (!deleteId) return
    await fetch("/api/follow-ups", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: deleteId }),
    })
    setDeleteId(null)
    fetchFollowUps()
  }

  const isEmpty = !loading && groups.length === 0

  useEffect(() => {
    const handleClick = () => setOpenMenuId(null)
    window.addEventListener("click", handleClick)
    return () =>
      window.removeEventListener("click", handleClick)
  }, [])

  return (
    <section className="rounded-2xl bg-[#FFFFFF] p-6 flex flex-col h-full">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Follow Up</h2>

        {!isEmpty && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1F6F78] text-white"
          >
            <Plus size={20} />
          </button>
        )}
      </div>

      {/* ADD / EDIT MODAL */}
      <Modal
        open={isAdding || isEditing}
        onClose={resetForm}
        title={isEditing ? "Edit Follow Up" : "New Follow Up"}
      >
        <div className="flex flex-col gap-3">
          <input
            ref={nameRef}
            placeholder="Name"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
            className="rounded-md border px-3 py-2 text-sm"
          />

          <input
            placeholder="Company"
            value={form.company}
            onChange={(e) =>
              setForm({ ...form, company: e.target.value })
            }
            className="rounded-md border px-3 py-2 text-sm"
          />

          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) =>
              setForm({
                ...form,
                description: e.target.value,
              })
            }
            className="rounded-md border px-3 py-2 text-sm"
          />

          <input
            type="date"
            value={form.schedule_at}
            onChange={(e) =>
              setForm({
                ...form,
                schedule_at: e.target.value,
              })
            }
            className="rounded-md border px-3 py-2 text-sm"
          />

          <div className="flex gap-3 pt-2">
            <button
              onClick={resetForm}
              className="flex-1 rounded-md border px-4 py-2"
            >
              Cancel
            </button>

            {isEditing ? (
              <button
                onClick={handleUpdate}
                disabled={!hasChanges || !isValid}
                className={`flex-1 rounded-md px-4 py-2 text-white ${hasChanges && isValid
                  ? "bg-[#1F6F78]"
                  : "bg-gray-300 cursor-not-allowed"
                  }`}
              >
                Update
              </button>
            ) : (
              <button
                onClick={handleAdd}
                disabled={!isValid}
                className={`flex-1 rounded-md px-4 py-2 text-white ${isValid
                  ? "bg-[#1F6F78]"
                  : "bg-gray-300"
                  }`}
              >
                Add
              </button>
            )}
          </div>
        </div>
      </Modal>

      {/* DELETE MODAL */}
      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Follow Up"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm">
            Are you sure you want to delete this follow up?
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => setDeleteId(null)}
              className="flex-1 rounded-md border px-4 py-2"
            >
              Cancel
            </button>

            <button
              onClick={confirmDelete}
              className="flex-1 rounded-md bg-red-500 px-4 py-2 text-white"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>

      {/* VIEW MODAL */}
      <Modal
        open={isViewing}
        onClose={() => setIsViewing(false)}
        title="Follow Up Details"
      >
        {selectedItem && (
          <div className="flex flex-col gap-3 text-sm">
            <p><strong>Name:</strong> {selectedItem.name}</p>
            <p><strong>Company:</strong> {selectedItem.company}</p>
            <p><strong>Description:</strong> {selectedItem.description}</p>
          </div>
        )}
      </Modal>

      {/* LIST */}
      {/* EMPTY STATE */}
      {isEmpty && (
        <div className="flex flex-1 flex-col items-center justify-center text-center gap-4 w-full h-full">
          <p className="text-xl font-semibold">
            No one to follow-up
          </p>

          <p className="text-sm text-gray-500 max-w-xs">
            Add a Client and Lead first then monitor follow-up.
          </p>

          <button
            onClick={() => setIsAdding(true)}
            className="mt-2 rounded-md bg-[#1F6F78] px-5 py-2 text-white flex items-center gap-2"
          >
            <Plus size={20} />
            Add Follow Up
          </button>
        </div>
      )}

      {!isEmpty && (
        <div className="mt-6 flex flex-col gap-10">
          {groups.map((group) => (
            <div key={group.label}>
              <div className="flex items-center justify-between rounded-xl bg-[#1F6F78] px-5 py-3">
                <span className="text-lg font-semibold text-white">
                  {group.label}
                </span>
                <span className="rounded-lg bg-[#A7C7CD] px-3 py-1 text-sm font-semibold">
                  {group.items.length}
                </span>
              </div>

              <div className="mt-6">
                {group.items.map((item, index) => (
                  <div key={item.id}>
                    <div
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectedItem(item)
                        setIsViewing(true)
                      }}
                    >
                      <span className="inline-block rounded-lg bg-[#E6ECEF] px-3 py-1 text-sm">
                        {item.company}
                      </span>

                      <div className="mt-4 flex justify-between items-start">
                        <p className="text-2xl font-semibold">
                          {item.name}
                        </p>

                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="relative z-50"
                        >
                          <button
                            onClick={() =>
                              setOpenMenuId(
                                openMenuId === item.id ? null : item.id
                              )
                            }
                            className="p-1"
                          >
                            <MoreVertical size={18} />
                          </button>

                          {openMenuId === item.id && (
                            <div className="absolute right-0 mt-2 w-28 rounded-md border bg-white shadow-lg z-50">
                              <button
                                onClick={() => {
                                  setSelectedItem(item)
                                  setForm({
                                    name: item.name,
                                    company: item.company,
                                    description: item.description,
                                    schedule_at: item.schedule_at
                                      ? item.schedule_at.slice(0, 10)
                                      : "",
                                  })
                                  setIsEditing(true)
                                  setOpenMenuId(null)
                                }}
                                className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                              >
                                Edit
                              </button>

                              <button
                                onClick={() => {
                                  setDeleteId(item.id)
                                  setOpenMenuId(null)
                                }}
                                className="block w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-gray-100"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <p className="mt-2 text-lg">
                        {item.description}
                      </p>
                    </div>

                    {index !==
                      group.items.length - 1 && (
                        <div className="my-6 border-t border-gray-200" />
                      )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}