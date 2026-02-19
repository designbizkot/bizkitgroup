"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

function useTimezone(tz: string) {
  const [time, setTime] = useState("")
  useEffect(() => {
    function update() {
      setTime(
        new Date().toLocaleTimeString("en-US", {
          timeZone: tz,
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      )
    }
    update()
    const interval = setInterval(update, 30000)
    return () => clearInterval(interval)
  }, [tz])
  return time
}

const TIMEZONES = [
  {
    tz: "Australia/Sydney",
    flag: "https://flagcdn.com/w40/au.png",
    alt: "Australia",
  },
  {
    tz: "America/New_York",
    flag: "https://flagcdn.com/w40/us.png",
    alt: "United States",
  },
  {
    tz: "Europe/London",
    flag: "https://flagcdn.com/w40/gb.png",
    alt: "United Kingdom",
  },
]

export function TopBar() {
  const today = new Date()
  const formatted = today.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  })

  return (
    <header className="flex flex-col gap-2 border-b border-border/60 bg-[#CBDCE0] px-6 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="pl-10 text-sm font-medium text-black lg:pl-0">
        {"Today, "}
        {formatted}
      </p>
      <div className="hidden items-center gap-8 sm:flex ">
        {TIMEZONES.map((zone) => (
          <TimezoneDisplay key={zone.tz} {...zone} />
        ))}
      </div>
    </header>
  )
}

function TimezoneDisplay({
  tz,
  flag,
  alt,
}: {
  tz: string
  flag: string
  alt: string
}) {
  const time = useTimezone(tz)

  return (
    <div className="flex items-center gap-2 text-sm">
      <Image
        src={flag}
        alt={alt}
        width={20}
        height={14}
        className="rounded-[2px] object-cover"
        unoptimized
      />
      <span className="font-medium text-black">{time}</span>
    </div>
  )
}
