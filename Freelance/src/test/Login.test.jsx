import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from '../App'
import '@testing-library/jest-dom/vitest'

// Mock de useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    globalThis.fetch = vi.fn()
  })

  it('renderiza el formulario de login', () => {
    render(<App />)

    expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument()
    expect(screen.getByText('Bienvenido de nuevo')).toBeInTheDocument()
    expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument()
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toBeInTheDocument()
  })

  it('permite escribir en los campos', () => {
    render(<App />)

    const emailInput = screen.getByPlaceholderText('usuario@ejemplo.com')
    const passwordInput = screen.getByPlaceholderText('••••••••')

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    expect(emailInput.value).toBe('test@example.com')
    expect(passwordInput.value).toBe('password123')
  })

  it('muestra/oculta la contraseña', () => {
    render(<App />)

    const passwordInput = screen.getByPlaceholderText('••••••••')
    const toggleButton = screen.getByRole('button', { name: '' })

    expect(passwordInput.type).toBe('password')
    fireEvent.click(toggleButton)
    expect(passwordInput.type).toBe('text')
  })

  it('maneja el checkbox recordarme', () => {
    render(<App />)

    const rememberMeCheckbox = screen.getByLabelText('Recordarme')
    expect(rememberMeCheckbox.checked).toBe(false)
    fireEvent.click(rememberMeCheckbox)
    expect(rememberMeCheckbox.checked).toBe(true)
  })

  it('envía el formulario con datos válidos', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Login exitoso' })
    })

    render(<App />)

    const emailInput = screen.getByPlaceholderText('usuario@ejemplo.com')
    const passwordInput = screen.getByPlaceholderText('••••••••')
    const submitButton = screen.getByRole('button', { name: 'Iniciar sesión' })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith('http://localhost:3000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: 'test@example.com', 
          password: 'password123' 
        }),
      })
    })
  })

  it('maneja errores de login', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: { mensaje: 'Credenciales inválidas' } })
    })

    render(<App />)

    const emailInput = screen.getByPlaceholderText('usuario@ejemplo.com')
    const passwordInput = screen.getByPlaceholderText('••••••••')
    const submitButton = screen.getByRole('button', { name: 'Iniciar sesión' })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/Backend Error/)).toBeInTheDocument()
    })
  })

  it('muestra el enlace de registro', () => {
    render(<App />)

    expect(screen.getByText('¿No tienes cuenta?')).toBeInTheDocument()
    expect(screen.getByText('Regístrate ahora')).toBeInTheDocument()
  })

  it('muestra los botones de redes sociales', () => {
    render(<App />)

    expect(screen.getByText('O continúa con')).toBeInTheDocument()
    expect(screen.getByText('Google')).toBeInTheDocument()
    expect(screen.getByText('GitHub')).toBeInTheDocument()
    expect(screen.getByText('Microsoft')).toBeInTheDocument()
  })
}) 