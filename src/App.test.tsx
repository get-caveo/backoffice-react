import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the heading', () => {
    render(<App />)
    expect(screen.getByText('Vite + React')).toBeInTheDocument()
  })

  it('renders the counter button', () => {
    render(<App />)
    expect(screen.getByText('Count: 0')).toBeInTheDocument()
  })

  it('increments count when button is clicked', () => {
    render(<App />)
    const button = screen.getByText('Count: 0')
    fireEvent.click(button)
    expect(screen.getByText('Count: 1')).toBeInTheDocument()
  })

  it('decrements count when decrement button is clicked', () => {
    render(<App />)
    const incrementButton = screen.getByText('Count: 0')
    fireEvent.click(incrementButton)
    expect(screen.getByText('Count: 1')).toBeInTheDocument()

    const decrementButton = screen.getByText('Decrement')
    fireEvent.click(decrementButton)
    expect(screen.getByText('Count: 0')).toBeInTheDocument()
  })

  it('resets count when reset button is clicked', () => {
    render(<App />)
    const incrementButton = screen.getByText('Count: 0')
    fireEvent.click(incrementButton)
    fireEvent.click(incrementButton)
    expect(screen.getByText('Count: 2')).toBeInTheDocument()

    const resetButton = screen.getByText('Reset')
    fireEvent.click(resetButton)
    expect(screen.getByText('Count: 0')).toBeInTheDocument()
  })
})
