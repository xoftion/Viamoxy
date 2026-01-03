import Image from "next/image"
import Link from "next/link"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  showText?: boolean
  className?: string
}

export function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  const sizes = {
    sm: { icon: 32, text: "text-lg" },
    md: { icon: 40, text: "text-xl" },
    lg: { icon: 52, text: "text-2xl" },
  }

  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      <div className="relative overflow-hidden rounded-lg bg-black p-0.5">
        <Image
          src="/images/staboost-logo.jpeg"
          alt="STABOOST Logo"
          width={sizes[size].icon}
          height={sizes[size].icon}
          className="rounded-md object-contain"
          priority
        />
      </div>
      {showText && (
        <span
          className={`font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent ${sizes[size].text}`}
        >
          STABOOST
        </span>
      )}
    </Link>
  )
}
