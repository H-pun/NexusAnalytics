import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Gradient with testimonial */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-b from-[#ffe5d9] via-[#ffb89d] to-[#ff5001] flex-col justify-between p-12 text-white">
        <div>
          <Image src="/logo-full.png" alt="NQR Analytics" width={180} height={50} className="object-contain" />
        </div>

        <div className="space-y-4">
          <blockquote className="text-xl leading-relaxed">
            "This library has saved me countless hours of work and helped me deliver stunning designs to my clients
            faster than ever before."
          </blockquote>
          <div className="font-medium">Sofia Davis</div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex flex-col">
        <div className="flex justify-end p-8">
          <Link href="/login" className="text-[#ff5001] font-medium hover:underline">
            Login
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-8">
          <div className="w-full max-w-sm space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-semibold text-[#ff5001]">Create an account</h1>
              <p className="text-gray-600">Enter your email below to create your account</p>
            </div>

            <div className="space-y-4">
              <Input type="email" placeholder="name@example.com" className="h-11" />
              <Button className="w-full h-11 bg-[#ff5001] hover:bg-[#e64501] text-white">Sign in with Email</Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">OR CONTINUE WITH</span>
                </div>
              </div>

              <Button variant="outline" className="w-full h-11 gap-2 bg-transparent">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </Button>
            </div>

            <p className="text-center text-sm text-gray-600">
              By clicking continue, you agree to our{" "}
              <Link href="/terms" className="underline hover:text-gray-900">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline hover:text-gray-900">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
