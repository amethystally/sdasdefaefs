"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, Users, Heart, Video, UserPlus, Clock } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// Add framer-motion to the project
import("framer-motion")

export default function Home() {
  const [username, setUsername] = useState("")
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [cooldown, setCooldown] = useState(false)
  const [cooldownTime, setCooldownTime] = useState(0)
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null)
  const cooldownIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setIsClient(true)

    // Disable right-clicking
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      return false
    }

    document.addEventListener("contextmenu", handleContextMenu)

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu)
      // Clean up timers
      if (cooldownTimerRef.current) {
        clearTimeout(cooldownTimerRef.current)
      }
      if (cooldownIntervalRef.current) {
        clearInterval(cooldownIntervalRef.current)
      }
    }
  }, [])

  const startCooldown = () => {
    setCooldown(true)
    setCooldownTime(3)

    // Clear any existing timers
    if (cooldownTimerRef.current) {
      clearTimeout(cooldownTimerRef.current)
    }
    if (cooldownIntervalRef.current) {
      clearInterval(cooldownIntervalRef.current)
    }

    // Set up interval to update countdown
    cooldownIntervalRef.current = setInterval(() => {
      setCooldownTime((prev) => {
        if (prev <= 1) {
          if (cooldownIntervalRef.current) {
            clearInterval(cooldownIntervalRef.current)
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // Set up timeout to end cooldown
    cooldownTimerRef.current = setTimeout(() => {
      setCooldown(false)
      setCooldownTime(0)
      if (cooldownIntervalRef.current) {
        clearInterval(cooldownIntervalRef.current)
      }
    }, 3000)
  }

  const checkRegion = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username.trim()) {
      setError("Please enter a TikTok username")
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      // Clean username (remove @ if present)
      const cleanUsername = username.trim().replace(/^@/, "")
      console.log("Checking username:", cleanUsername)

      // Try multiple approaches to fetch the data

      // Approach 1: Direct fetch with CORS mode
      try {
        console.log("Trying direct fetch...")
        const apiUrl = `https://jaefu3p97g.execute-api.us-east-1.amazonaws.com/default/smttab?username=${cleanUsername}`
        console.log("Fetching from URL:", apiUrl)

        const response = await fetch(apiUrl, {
          method: "GET",
          mode: "cors",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`)
        }

        const data = await response.json()
        console.log("Data received:", data)

        // Filter out unwanted fields
        if (data.Website) delete data.Website
        if (data["You can support me on Ko-fi to keep this project alive!"]) {
          delete data["You can support me on Ko-fi to keep this project alive!"]
        }

        setResult(data)
        return // Exit if successful
      } catch (err) {
        console.error("Direct fetch failed:", err)
        // Continue to next approach
      }

      // Approach 2: Try with a CORS proxy
      try {
        console.log("Trying with CORS proxy...")
        const apiUrl = `https://jaefu3p97g.execute-api.us-east-1.amazonaws.com/default/smttab?username=${cleanUsername}`
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`
        console.log("Fetching via proxy:", proxyUrl)

        const response = await fetch(proxyUrl, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`Proxy API responded with status: ${response.status}`)
        }

        const data = await response.json()
        console.log("Data received via proxy:", data)

        // Filter out unwanted fields
        if (data.Website) delete data.Website
        if (data["You can support me on Ko-fi to keep this project alive!"]) {
          delete data["You can support me on Ko-fi to keep this project alive!"]
        }

        setResult(data)
        return // Exit if successful
      } catch (err) {
        console.error("CORS proxy fetch failed:", err)
        // All approaches failed, throw error
        throw new Error("All fetch attempts failed. Please try again later.")
      }
    } catch (err) {
      console.error("Fetch error:", err)
      setError(err instanceof Error ? `${err.message}` : "An unexpected error occurred. Please try again later.")
    } finally {
      setLoading(false)
      startCooldown() // Start cooldown after request completes
    }
  }

  if (!isClient) {
    return null // Prevent hydration errors
  }

  const StatItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
    <div className="flex items-center space-x-2 p-3 rounded-xl bg-black/60 backdrop-blur-md border border-white/10">
      <div className="p-2 bg-black/80 rounded-lg">{icon}</div>
      <div>
        <p className="text-xs text-zinc-400">{label}</p>
        <p className="font-semibold text-white">{value}</p>
      </div>
    </div>
  )

  const ProfileItem = ({ label, value }: { label: string; value: string }) => (
    <div className="py-3 border-b border-white/10 last:border-0">
      <p className="text-xs text-zinc-400">{label}</p>
      <p className="font-semibold text-white">{value}</p>
    </div>
  )

  const isButtonDisabled = loading || cooldown

  return (
    <main
      className="min-h-screen bg-gradient-to-br from-zinc-900 via-black to-zinc-900 text-white overflow-hidden relative"
      style={{ userSelect: "none" }}
    >
      {/* Background gradient mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-800/20 via-zinc-900/40 to-black/60" />

      {/* Vignette effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,_transparent_30%,_black_100%)] opacity-80" />

      {/* Watermark */}
      <div className="absolute top-4 right-4 z-50 text-white/30 font-bold text-lg tracking-wide">hi.monster</div>

      <div className="relative z-10 py-12 px-4 flex justify-center items-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="overflow-hidden border-0 shadow-2xl rounded-2xl bg-black/40 backdrop-blur-md border border-white/10">
            <CardContent className="p-8">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }}>
                <h1 className="text-3xl font-bold text-center mb-1 text-white tracking-tight">TikTok Region Checker</h1>
                <p className="text-zinc-400 text-center mb-8">Enter a TikTok username to check their account region</p>
              </motion.div>

              <form onSubmit={checkRegion} className="space-y-5">
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="TikTok username (without @)"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full h-14 px-5 rounded-xl bg-black/60 border-white/10 text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-white/30 focus:border-white/20 transition-all text-lg"
                    disabled={loading}
                  />
                </div>

                <motion.div
                  whileHover={!isButtonDisabled ? { scale: 1.02 } : {}}
                  whileTap={!isButtonDisabled ? { scale: 0.98 } : {}}
                >
                  <Button
                    type="submit"
                    className={`w-full h-14 rounded-xl transition-all text-lg relative overflow-hidden ${
                      isButtonDisabled
                        ? "bg-zinc-600 text-zinc-300 cursor-not-allowed"
                        : "bg-white hover:bg-zinc-200 text-black font-bold"
                    }`}
                    disabled={isButtonDisabled}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Searching...
                      </>
                    ) : cooldown ? (
                      <>
                        <Clock className="mr-2 h-5 w-5" />
                        Wait {cooldownTime}s
                      </>
                    ) : (
                      "Check Region"
                    )}
                  </Button>
                </motion.div>
              </form>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Alert
                      variant="destructive"
                      className="mt-5 rounded-xl bg-red-900/70 backdrop-blur-sm border-red-800/50 text-white"
                    >
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="font-medium">{error}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}

                {result && !error && (
                  <motion.div
                    className="mt-8 space-y-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    {result.profile && (
                      <div className="space-y-5">
                        <div className="flex items-center space-x-4">
                          {result.profile["Avatar URL"] && (
                            <motion.div
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.2, duration: 0.5 }}
                            >
                              <img
                                src={result.profile["Avatar URL"] || "/placeholder.svg"}
                                alt={`${result.profile.Nickname}'s avatar`}
                                className="w-20 h-20 rounded-full object-cover border-2 border-white/20 shadow-lg"
                                onError={(e) => {
                                  ;(e.target as HTMLImageElement).src = "/diverse-user-avatars.png"
                                }}
                              />
                            </motion.div>
                          )}
                          <div>
                            <h2 className="text-2xl font-bold text-white tracking-tight">{result.profile.Nickname}</h2>
                            <p className="text-zinc-400 text-lg">{result.profile.Username}</p>
                          </div>
                        </div>

                        <div className="p-5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10">
                          <h3 className="text-sm font-bold text-zinc-300 mb-4 uppercase tracking-wider">
                            Profile Information
                          </h3>
                          <div className="space-y-0">
                            {Object.entries(result.profile).map(([key, value]) => {
                              // Skip Avatar URL from this section
                              if (key === "Avatar URL") return null
                              return <ProfileItem key={key} label={key} value={value as string} />
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {result.stats && (
                      <div className="space-y-4">
                        <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Account Statistics</h3>
                        <div className="grid grid-cols-2 gap-3">
                          <StatItem
                            icon={<Users className="h-5 w-5 text-white" />}
                            label="Followers"
                            value={result.stats.Followers}
                          />
                          <StatItem
                            icon={<UserPlus className="h-5 w-5 text-white" />}
                            label="Following"
                            value={result.stats.Following}
                          />
                          <StatItem
                            icon={<Heart className="h-5 w-5 text-white" />}
                            label="Hearts"
                            value={result.stats.Hearts}
                          />
                          <StatItem
                            icon={<Video className="h-5 w-5 text-white" />}
                            label="Videos"
                            value={result.stats.Videos}
                          />
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  )
}
