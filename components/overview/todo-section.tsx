"use client"

import { useState, useRef, useEffect } from "react"
import { Check, MoreVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import { Modal } from "@/components/modal"

interface TodoItem {
  id: string
  tag: string
  tagColor: string
  title: string
  assignee: string
  assigneeOrg: string
  creatorName: string
  creatorOrg: string
  creatorAvatar: string
  dueDate: string
  done: boolean
}

const TAG_OPTIONS = [
  { label: "BDM", color: "bg-[#166a7d] text-white" },
  { label: "Finance", color: "bg-[#458897] text-white" },
  { label: "Website", color: "bg-[#73a6b1] text-white" },
  { label: "Marketing", color: "bg-[#2a8a9e] text-white" },
  { label: "Design", color: "bg-[#0f5463] text-white" },
]

export function TodoSection() {
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [viewTodo, setViewTodo] = useState<TodoItem | null>(null)
  const [originalTodo, setOriginalTodo] = useState<TodoItem | null>(null)

  const [newTitle, setNewTitle] = useState("")
  const [newAssignee, setNewAssignee] = useState("")
  const [newTag, setNewTag] = useState(TAG_OPTIONS[0])
  const [newDueDate, setNewDueDate] = useState("")


  const titleInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
  const fetchTodos = async () => {
    const res = await fetch("/api/todos")

    if (!res.ok) {
      console.error("Failed to fetch todos")
      return
    }

    const data = await res.json()
    setTodos(data as TodoItem[])
  }

  fetchTodos()
}, [])

  const isFormValid =
    newTitle.trim() !== "" &&
    newAssignee.trim() !== "" &&
    newDueDate !== ""

  const handleSave = async () => {
    if (!isFormValid) return

    const currentEditingId = editingId
    resetForm()

    try {
      if (currentEditingId) {
        await fetch("/api/todos", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: currentEditingId,
            title: newTitle,
            assignee: newAssignee,
            tag: newTag.label,
            tagColor: newTag.color,
            dueDate: newDueDate,
          }),
        })
      } else {
        const newTodo = {
          tag: newTag.label,
          tagColor: newTag.color,
          title: newTitle.trim(),
          assignee: newAssignee.trim(),
          assigneeOrg: "bizkitgroup",
          creatorName: "Premkamol S.",
          creatorOrg: "bizkitgroup",
          creatorAvatar: "/images/avatar.jpg",
          dueDate: newDueDate,
          done: false,

        }

        await fetch("/api/todos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newTodo),
        })
      }

      const res = await fetch("/api/todos")
      const data = await res.json()
      setTodos(data)
      if (data) setTodos(data as TodoItem[])

    } catch (error) {
      console.error("Error saving:", error)
    }
  }

  const toggleTodo = async (id: string) => {
    const selected = todos.find((t) => t.id === id)
    if (!selected) return

    await fetch("/api/todos", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        done: !selected.done,
      }),
    })

    const res = await fetch("/api/todos")
    const data = await res.json()
    if (data) setTodos(data as TodoItem[])
  }

  const handleEdit = (todo: TodoItem) => {
    setEditingId(todo.id)
    setOriginalTodo(todo)
    setNewTitle(todo.title)
    setNewAssignee(todo.assignee)
    setNewDueDate(todo.dueDate)
    setNewTag(
      TAG_OPTIONS.find((t) => t.label === todo.tag) || TAG_OPTIONS[0]
    )
    setIsAdding(true)
  }

  const handleDelete = (id: string) => {
    setDeleteId(id)
  }

  const confirmDelete = async () => {
    if (!deleteId) return

    await fetch("/api/todos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: deleteId }),
    })

    setDeleteId(null)

    const res = await fetch("/api/todos")
    const data = await res.json()
    if (data) setTodos(data as TodoItem[])
  }

  const resetForm = () => {
    setEditingId(null)
    setOriginalTodo(null)
    setNewTitle("")
    setNewAssignee("")
    setNewDueDate("")
    setNewTag(TAG_OPTIONS[0])
    setIsAdding(false)
  }

  const activeCount = todos.filter((t) => !t.done).length

  const hasChanges =
    editingId &&
    originalTodo &&
    (
      newTitle !== originalTodo.title ||
      newAssignee !== originalTodo.assignee ||
      newDueDate !== originalTodo.dueDate ||
      newTag.label !== originalTodo.tag
    )
  return (
    <section className="flex h-full flex-col rounded-xl bg-card p-5">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">To do</h2>
          <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-semibold">
            {activeCount}
          </span>
        </div>

        {todos.length > 0 && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-sm hover:opacity-90 transition"
          >
            +
          </button>
        )}
      </div>

      {/* ADD / EDIT MODAL */}
      <Modal
        open={isAdding}
        onClose={resetForm}
        title={editingId ? "Edit Task" : "New Task"}
      >
        <div className="flex flex-col gap-3">
          <input
            ref={titleInputRef}
            type="text"
            placeholder="Enter task title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm"
          />

          <input
            type="text"
            placeholder="Assignee"
            value={newAssignee}
            onChange={(e) => setNewAssignee(e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm"
          />

          <input
            type="date"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm"
          />

          <select
            value={newTag.label}
            onChange={(e) =>
              setNewTag(
                TAG_OPTIONS.find((t) => t.label === e.target.value)!
              )
            }
            className="w-full rounded-md border px-3 py-2 text-sm"
          >
            {TAG_OPTIONS.map((t) => (
              <option key={t.label}>{t.label}</option>
            ))}
          </select>

          <div className="flex gap-3 pt-2">
            <button
              onClick={resetForm}
              className="flex-1 rounded-md border px-4 py-2"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={
                editingId
                  ? !hasChanges
                  : !isFormValid
              }
              className={cn(
                "flex-1 rounded-md px-4 py-2 text-white transition",
                editingId
                  ? hasChanges
                    ? "bg-primary"
                    : "bg-gray-300 cursor-not-allowed"
                  : isFormValid
                    ? "bg-primary"
                    : "bg-gray-300 cursor-not-allowed"
              )}
            >
              {editingId ? "Update" : "Add Task"}
            </button>
          </div>
        </div>
      </Modal>

      {/* DELETE MODAL */}
      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Task"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm">
            Are you sure you want to delete this task?
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

      {/* CONTENT */}
      <div className="mt-4 flex flex-1 flex-col gap-3 overflow-y-auto">

        {todos.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <h3 className="text-base font-semibold">No tasks yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              You’re all clear for now.
              <br />
              Add a task to stay organized
              <br />
              and on track.
            </p>

            <button
              onClick={() => setIsAdding(true)}
              className="mt-6 rounded-md bg-primary px-6 py-2 text-white"
            >
              + Add task
            </button>
          </div>
        )}
        {todos.map((todo) => (
          <div
            key={todo.id}
            className={cn(
              "relative flex items-center rounded-xl border bg-card p-4 shadow-sm transition hover:shadow-md cursor-pointer",
              todo.done && "bg-[#E8F0F2]"
            )}
            onClick={() => setViewTodo(todo)}
          >
            <div className="absolute left-0 top-0 h-full w-1.5 rounded-l-xl bg-primary" />

            <div className="flex flex-1 items-center gap-4 pl-3">

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "rounded-md px-2 py-0.5 text-[11px] font-semibold",
                      todo.tagColor
                    )}
                  >
                    {todo.tag}
                  </span>

                  <span className="truncate text-sm font-semibold">
                    {todo.title}
                  </span>
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <img
                    src={todo.creatorAvatar}
                    alt={todo.creatorName}
                    className="h-6 w-6 rounded-full object-cover"
                  />
                  <span className="text-xs text-muted-foreground">
                    {todo.creatorName} / {todo.creatorOrg}
                  </span>
                </div>
              </div>

              {/* CHECK */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleTodo(todo.id)
                }}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border-2 transition",
                  todo.done
                    ? "border-primary bg-primary text-white"
                    : "border-primary/30"
                )}
              >
                {todo.done && <Check size={18} strokeWidth={3} />}
              </button>

              {/* 3 DOT */}
              <div
                className="relative"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() =>
                    setOpenMenuId(
                      openMenuId === todo.id ? null : todo.id
                    )
                  }
                  className="text-muted-foreground hover:text-primary"
                >
                  <MoreVertical size={18} />
                </button>

                {openMenuId === todo.id && (
                  <div className="absolute right-0 mt-2 w-28 rounded-md border bg-white shadow-md z-10">
                    <button
                      onClick={() => {
                        handleEdit(todo)
                        setOpenMenuId(null)
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => {
                        handleDelete(todo.id)
                        setOpenMenuId(null)
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-red-500 hover:bg-muted"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* VIEW MODAL */}
      <Modal
        open={!!viewTodo}
        onClose={() => setViewTodo(null)}
        title="Task Details"
      >
        {viewTodo && (
          <div className="flex flex-col gap-4 text-sm">
            <div>
              <p className="font-semibold">Title</p>
              <p>{viewTodo.title}</p>
            </div>

            <div>
              <p className="font-semibold">Assigned to</p>
              <p>
                {viewTodo.assignee} / {viewTodo.assigneeOrg}
              </p>
            </div>

            <div>
              <p className="font-semibold">Due date</p>
              <p>{viewTodo.dueDate}</p>
            </div>

            <div>
              <p className="font-semibold">Created by</p>
              <div className="flex items-center gap-2 mt-1">
                <img
                  src={viewTodo.creatorAvatar}
                  className="h-8 w-8 rounded-full"
                />
                <span>
                  {viewTodo.creatorName} / {viewTodo.creatorOrg}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>

    </section>
  )
}