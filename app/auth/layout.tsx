export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-100px)] py-12">
      <div className="w-full max-w-md p-8 space-y-8 border rounded-2xl bg-white/5 backdrop-blur-sm shadow-xl">
        {children}
      </div>
    </div>
  )
}
