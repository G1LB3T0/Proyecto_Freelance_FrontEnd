import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Register from '../Register'

// Mock de useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('Register Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  it('renderiza el formulario de registro correctamente', () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    )
    
    expect(screen.getByText('Crear Cuenta')).toBeInTheDocument()
    expect(screen.getByText('Información Personal')).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre')).toBeInTheDocument()
    expect(screen.getByLabelText('Apellido')).toBeInTheDocument()
    expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument()
  })

  it('permite escribir en los campos del primer paso', () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    )
    
    const firstNameInput = screen.getByLabelText('Nombre')
    const lastNameInput = screen.getByLabelText('Apellido')
    const emailInput = screen.getByLabelText('Correo electrónico')

    fireEvent.change(firstNameInput, { target: { value: 'Juan' } })
    fireEvent.change(lastNameInput, { target: { value: 'Pérez' } })
    fireEvent.change(emailInput, { target: { value: 'juan@example.com' } })

    expect(firstNameInput.value).toBe('Juan')
    expect(lastNameInput.value).toBe('Pérez')
    expect(emailInput.value).toBe('juan@example.com')
  })

  it('avanza al siguiente paso cuando se completa el primer paso', () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    )
    
    const firstNameInput = screen.getByLabelText('Nombre')
    const lastNameInput = screen.getByLabelText('Apellido')
    const emailInput = screen.getByLabelText('Correo electrónico')
    const nextButton = screen.getByRole('button', { name: 'Siguiente' })

    fireEvent.change(firstNameInput, { target: { value: 'Juan' } })
    fireEvent.change(lastNameInput, { target: { value: 'Pérez' } })
    fireEvent.change(emailInput, { target: { value: 'juan@example.com' } })
    fireEvent.click(nextButton)

    expect(screen.getByText('Información de Contacto')).toBeInTheDocument()
  })

  it('no avanza al siguiente paso si faltan campos requeridos', () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    )
    
    const firstNameInput = screen.getByLabelText('Nombre')
    const nextButton = screen.getByRole('button', { name: 'Siguiente' })

    fireEvent.change(firstNameInput, { target: { value: 'Juan' } })
    fireEvent.click(nextButton)

    // Debe permanecer en el primer paso
    expect(screen.getByText('Información Personal')).toBeInTheDocument()
  })

  it('muestra el enlace de login', () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    )
    
    expect(screen.getByText('¿Ya tienes cuenta?')).toBeInTheDocument()
    expect(screen.getByText('Iniciar sesión')).toBeInTheDocument()
  })

  it('muestra los botones de redes sociales', () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    )
    
    expect(screen.getByText('O regístrate con')).toBeInTheDocument()
    expect(screen.getByText('Google')).toBeInTheDocument()
    expect(screen.getByText('GitHub')).toBeInTheDocument()
    expect(screen.getByText('Microsoft')).toBeInTheDocument()
  })
}) 