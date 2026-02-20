"use client"

import { useEffect, useState } from "react"
import { MoreVertical, Plus } from "lucide-react"
import { Modal } from "@/components/modal"

interface NewsItem {
  id: string
  image: string
  title: string
  source: string
  date: string
  url: string
}

export function NewsSection() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [error, setError] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [url, setUrl] = useState("")
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchNews = async () => {
    const res = await fetch("/api/news")
    const data = await res.json()

    // ป้องกันไม่ให้ map พัง
    if (Array.isArray(data)) {
      setNewsItems(data)
    } else if (Array.isArray(data.data)) {
      setNewsItems(data.data)
    } else {
      setNewsItems([])
    }
  }


  useEffect(() => {
    fetchNews()
  }, [])

  // ปิดเมนูเมื่อคลิกที่อื่น
  useEffect(() => {
    const handleClick = () => setOpenMenuId(null)
    window.addEventListener("click", handleClick)
    return () => window.removeEventListener("click", handleClick)
  }, [])

  const addNews = async () => {
    if (!url.trim()) {
      setError("Please enter a URL")
      return
    }

    try {
      new URL(url)
    } catch {
      setError("Invalid URL format")
      return
    }

    setError("")

    await fetch("/api/news", {
      method: "POST",
      body: JSON.stringify({ url }),
    })

    setUrl("")
    setIsOpen(false)
    fetchNews()
  }

  const confirmDelete = async () => {
    if (!deleteId) return

    await fetch("/api/news", {
      method: "DELETE",
      body: JSON.stringify({ id: deleteId }),
    })

    setDeleteId(null)
    fetchNews()
  }

  return (
    <section className="flex h-full flex-col rounded-xl bg-card p-5">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-card-foreground">
          News
        </h2>

        {newsItems.length > 0 && (
          <button
            onClick={() => setIsOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white"
          >
            <Plus size={18} />
          </button>
        )}
      </div>

      {newsItems.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <h3 className="text-lg font-semibold text-card-foreground">
            No updates right now
          </h3>

          <p className="mt-2 text-sm text-muted-foreground">
            The latest product, design,
            <br />
            and AI news will appear here.
          </p>

          <button
            onClick={() => setIsOpen(true)}
            className="mt-6 rounded-md bg-primary px-6 py-2 text-white"
          >
            + Add URL to track news
          </button>
        </div>
      ) : (
        <div className="mt-0 flex min-h-0 flex-1 flex-col divide-y divide-border overflow-y-auto">
          {newsItems.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-4 py-4 cursor-pointer"
              onClick={() => window.open(item.url, "_blank")}
            >
              <div className="flex items-start gap-4">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-[72px] w-[100px] rounded-lg object-cover"
                  />
                )}
                <div>
                  <p className="text-sm font-semibold">
                    {item.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.source} · {item.date}
                  </p>
                </div>
              </div>

              {/* 3 DOT MENU */}
              <div
                className="relative"
                onClick={(e) => e.stopPropagation()}
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
                  <div className="absolute right-0 mt-2 w-24 rounded-md border bg-white shadow-lg z-50">
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
          ))}
        </div>
      )}

      {/* ADD NEWS MODAL */}
      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="Add News URL"
      >
        <div className="flex flex-col gap-4">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste news URL here..."
            className="rounded-md border px-3 py-2 text-sm"
          />

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 rounded-md border px-4 py-2"
            >
              Cancel
            </button>

            <button
              onClick={addNews}
              disabled={!url.trim()}
              className={`flex-1 rounded-md px-4 py-2 text-white ${url.trim()
                ? "bg-primary"
                : "bg-gray-300 cursor-not-allowed"
                }`}
            >
              Add
            </button>
          </div>
        </div>
      </Modal>

      {/* DELETE CONFIRM MODAL */}
      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete News"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm">
            Are you sure you want to delete this news?
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

    </section>
  )
}
