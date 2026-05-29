'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface Props {
  data: { month: string; revenue: number; collected: number }[]
}

export function RevenueChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${v}`} />
        <Tooltip
          formatter={(value, name) => [
            typeof value === 'number' ? `$${value.toFixed(2)}` : value,
            name === 'revenue' ? 'Billed' : 'Collected',
          ]}
          contentStyle={{ fontSize: 12 }}
        />
        <Legend
          formatter={name => (name === 'revenue' ? 'Billed' : 'Collected')}
          wrapperStyle={{ fontSize: 12 }}
        />
        <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="collected" stroke="#16a34a" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
