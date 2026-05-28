import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { StatusProgressBar } from '@/components/status-progress-bar'

describe('StatusProgressBar', () => {
  it('shows current status label', () => {
    render(<StatusProgressBar status="Skull Cleaning" />)
    expect(screen.getByText('Skull Cleaning')).toBeInTheDocument()
  })

  it('marks steps before current as complete', () => {
    render(<StatusProgressBar status="Maceration Period" />)
    const steps = screen.getAllByRole('listitem')
    expect(steps[0]).toHaveClass('bg-green-500')
    expect(steps[1]).toHaveClass('bg-green-500')
  })

  it('marks current step as active', () => {
    render(<StatusProgressBar status="Maceration Period" />)
    const steps = screen.getAllByRole('listitem')
    expect(steps[2]).toHaveClass('bg-blue-600')
  })

  it('marks future steps as inactive', () => {
    render(<StatusProgressBar status="Maceration Period" />)
    const steps = screen.getAllByRole('listitem')
    expect(steps[3]).toHaveClass('bg-gray-200')
  })
})
