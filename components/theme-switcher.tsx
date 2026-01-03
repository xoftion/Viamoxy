"use client"

import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sun, Moon, Monitor, Sunset, CloudSun, Check } from "lucide-react"

const themes = [
  { value: "light", label: "Light", icon: Sun, description: "Clean & bright" },
  { value: "dark", label: "Dark", icon: Moon, description: "Easy on the eyes" },
  { value: "dim", label: "Dim", icon: Sunset, description: "Soft & relaxed" },
  { value: "sunlight", label: "Sunlight", icon: CloudSun, description: "High contrast" },
  { value: "system", label: "Auto", icon: Monitor, description: "Match device" },
] as const

export function ThemeSwitcher() {
  const { theme, setTheme, resolvedTheme } = useTheme()

  const currentTheme = themes.find((t) => t.value === theme) || themes[0]
  const CurrentIcon = currentTheme.icon

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-card hover:bg-accent border-border">
          <CurrentIcon size={16} />
          <span>{currentTheme.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        {themes.map((t) => {
          const Icon = t.icon
          const isActive = theme === t.value
          return (
            <DropdownMenuItem
              key={t.value}
              onClick={() => setTheme(t.value)}
              className={`flex items-center justify-between cursor-pointer py-2.5 ${isActive ? "bg-accent" : ""}`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-md ${isActive ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  <Icon size={16} />
                </div>
                <div>
                  <div className="font-medium">{t.label}</div>
                  <div className="text-xs text-muted-foreground">{t.description}</div>
                </div>
              </div>
              {isActive && <Check size={16} className="text-primary" />}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
