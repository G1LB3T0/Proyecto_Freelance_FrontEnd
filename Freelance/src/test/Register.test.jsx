import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Register from '../Register'

describe('Register Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
    global.alert = vi.fn()
  })

  it('renderiza el formulario de registro', () => {
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

  it('muestra la barra de progreso', () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    )

    const progressBar = document.querySelector('.progress-bar')
    expect(progressBar).toBeInTheDocument()
  })

  it('permite navegar al siguiente paso', () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    )

    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Juan' } })
    fireEvent.change(screen.getByLabelText('Apellido'), { target: { value: 'Pérez' } })
    fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: 'juan@example.com' } })

    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }))

    expect(screen.getByText('Información de Contacto')).toBeInTheDocument()
    expect(screen.getByLabelText('Teléfono')).toBeInTheDocument()
  })

  it('no permite avanzar sin completar campos', () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }))
    expect(screen.getByText('Información Personal')).toBeInTheDocument()
  })

  it('permite navegar entre pasos', () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    )

    // Paso 1
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Juan' } })
    fireEvent.change(screen.getByLabelText('Apellido'), { target: { value: 'Pérez' } })
    fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: 'juan@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }))

    // Paso 2
    fireEvent.change(screen.getByLabelText('Teléfono'), { target: { value: '1234567890' } })
    fireEvent.change(screen.getByLabelText('Fecha de nacimiento'), { target: { value: '1990-01-01' } })
    fireEvent.change(screen.getByLabelText('Género'), { target: { value: 'male' } })
    fireEvent.change(screen.getByLabelText('País'), { target: { value: 'España' } })
    fireEvent.change(screen.getByLabelText('Código Postal'), { target: { value: '28001' } })
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }))

    // Paso 3
    expect(screen.getByText('Contraseña y Términos')).toBeInTheDocument()
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument()

    // Volver
    fireEvent.click(screen.getByRole('button', { name: 'Atrás' }))
    expect(screen.getByText('Información de Contacto')).toBeInTheDocument()
  })

  it('valida que las contraseñas coincidan', () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    )

    // Navegar al paso 3
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Juan' } })
    fireEvent.change(screen.getByLabelText('Apellido'), { target: { value: 'Pérez' } })
    fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: 'juan@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }))

    fireEvent.change(screen.getByLabelText('Teléfono'), { target: { value: '1234567890' } })
    fireEvent.change(screen.getByLabelText('Fecha de nacimiento'), { target: { value: '1990-01-01' } })
    fireEvent.change(screen.getByLabelText('Género'), { target: { value: 'male' } })
    fireEvent.change(screen.getByLabelText('País'), { target: { value: 'España' } })
    fireEvent.change(screen.getByLabelText('Código Postal'), { target: { value: '28001' } })
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }))

    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'password123' } })
    fireEvent.change(screen.getByLabelText('Confirmar contraseña'), { target: { value: 'password456' } })
    fireEvent.click(screen.getByLabelText(/Acepto los/))

    fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(screen.getByText('Las contraseñas no coinciden')).toBeInTheDocument()
  })

  it('envía el formulario con datos válidos', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ email: 'juan@example.com', message: 'Usuario registrado exitosamente' })
    })

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    )

    // Completar todos los pasos
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Juan' } })
    fireEvent.change(screen.getByLabelText('Apellido'), { target: { value: 'Pérez' } })
    fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: 'juan@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }))

    fireEvent.change(screen.getByLabelText('Teléfono'), { target: { value: '1234567890' } })
    fireEvent.change(screen.getByLabelText('Fecha de nacimiento'), { target: { value: '1990-01-01' } })
    fireEvent.change(screen.getByLabelText('Género'), { target: { value: 'male' } })
    fireEvent.change(screen.getByLabelText('País'), { target: { value: 'España' } })
    fireEvent.change(screen.getByLabelText('Código Postal'), { target: { value: '28001' } })
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }))

    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'password123' } })
    fireEvent.change(screen.getByLabelText('Confirmar contraseña'), { target: { value: 'password123' } })
    fireEvent.click(screen.getByLabelText(/Acepto los/))

    fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: 'Juan',
          last_name: 'Pérez',
          email: 'juan@example.com',
          password: 'password123',
          phone: '1234567890',
          date_of_birth: '1990-01-01',
          gender: 'male',
          country: 'España',
          postal_code: '28001'
        }),
      })
    })
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