import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import App from '../App'

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
    global.fetch = vi.fn()
  })

  it('renderiza el formulario de login', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )

    expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument()
    expect(screen.getByText('Bienvenido de nuevo')).toBeInTheDocument()
    expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument()
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toBeInTheDocument()
  })

  it('permite escribir en los campos', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )

    const emailInput = screen.getByPlaceholderText('usuario@ejemplo.com')
    const passwordInput = screen.getByPlaceholderText('••••••••')

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    expect(emailInput.value).toBe('test@example.com')
    expect(passwordInput.value).toBe('password123')
  })

  it('muestra/oculta la contraseña', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )

    const passwordInput = screen.getByPlaceholderText('••••••••')
    const toggleButtons = screen.getAllByRole('button').filter(btn => btn.textContent === '')

    expect(passwordInput.type).toBe('password')
    fireEvent.click(toggleButtons[0])
    expect(passwordInput.type).toBe('text')
  })

  it('maneja el checkbox recordarme', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )

    const rememberMeCheckbox = screen.getByLabelText('Recordarme')
    expect(rememberMeCheckbox.checked).toBe(false)
    fireEvent.click(rememberMeCheckbox)
    expect(rememberMeCheckbox.checked).toBe(true)
  })

  it('envía el formulario con datos válidos', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Login exitoso' })
    })

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )

    const emailInput = screen.getByPlaceholderText('usuario@ejemplo.com')
    const passwordInput = screen.getByPlaceholderText('••••••••')
    const submitButton = screen.getByRole('button', { name: 'Iniciar sesión' })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/api/login', {
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
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: { mensaje: 'Credenciales inválidas' } })
    })

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )

    const emailInput = screen.getByPlaceholderText('usuario@ejemplo.com')
    const passwordInput = screen.getByPlaceholderText('••••••••')
    const submitButton = screen.getByRole('button', { name: 'Iniciar sesión' })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument()
    })
  })

  it('muestra el enlace de registro', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )

    expect(screen.getByText('¿No tienes cuenta?')).toBeInTheDocument()
    expect(screen.getByText('Regístrate ahora')).toBeInTheDocument()
  })

  it('muestra los botones de redes sociales', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )

    expect(screen.getByText('O continúa con')).toBeInTheDocument()
    expect(screen.getByText('Google')).toBeInTheDocument()
    expect(screen.getByText('GitHub')).toBeInTheDocument()
    expect(screen.getByText('Microsoft')).toBeInTheDocument()
  })
}) 