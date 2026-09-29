interface StatCardProps {
  label: string
  value: string | number
  trend?: {
    value: number
    isPositive: boolean
  }
  icon?: React.ReactNode
  href?: string
  variant?: 'primary' | 'success' | 'warning' | 'danger'
}

export function StatCard({
  label,
  value,
  trend,
  icon,
  href,
  variant = 'primary',
}: StatCardProps) {
  const variantStyles = {
    primary: 'from-blue-50 to-blue-100/50 border-blue-200',
    success: 'from-green-50 to-green-100/50 border-green-200',
    warning: 'from-yellow-50 to-yellow-100/50 border-yellow-200',
    danger: 'from-red-50 to-red-100/50 border-red-200',
  }

  const Content = () => (
    <div className={`relative overflow-hidden rounded-xl p-6 border bg-gradient-to-br ${variantStyles[variant]} card-elevated group cursor-pointer`}>
      {/* Background accent */}
      <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-10" style={{
        background: variant === 'primary' ? '#3b82f6' :
                   variant === 'success' ? '#10b981' :
                   variant === 'warning' ? '#f59e0b' : '#ef4444'
      }} />

      <div className="relative z-10">
        {/* Top section */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">
              {label}
            </p>
            <p className="text-4xl font-black bg-gradient-to-r bg-clip-text text-transparent" style={{
              backgroundImage: variant === 'primary' ? 'linear-gradient(to right, #1e40af, #2563eb)' :
                             variant === 'success' ? 'linear-gradient(to right, #065f46, #10b981)' :
                             variant === 'warning' ? 'linear-gradient(to right, #92400e, #f59e0b)' : 'linear-gradient(to right, #7f1d1d, #ef4444)'
            }}>
              {value}
            </p>
          </div>
          {icon && (
            <div className="p-3 rounded-lg" style={{
              backgroundColor: variant === 'primary' ? '#dbeafe' :
                             variant === 'success' ? '#d1fae5' :
                             variant === 'warning' ? '#fef3c7' : '#fee2e2'
            }}>
              {icon}
            </div>
          )}
        </div>

        {/* Trend indicator */}
        {trend && (
          <div className="flex items-center gap-2">
            <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
              trend.isPositive
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
            <span className="text-xs text-gray-600">vs last month</span>
          </div>
        )}
      </div>
    </div>
  )

  if (href) {
    return (
      <a href={href} className="block">
        <Content />
      </a>
    )
  }

  return <Content />
}
