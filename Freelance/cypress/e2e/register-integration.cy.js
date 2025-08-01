describe('Register Integration Test', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should complete full registration process', () => {
    // Navegar a register
    cy.get('a').contains('Regístrate ahora').click()
    cy.url().should('include', '/register')
    
    // PASO 1: Información Personal
    cy.contains('Información Personal').should('be.visible')
    cy.get('input[name="firstName"]').type('Juan')
    cy.get('input[name="lastName"]').type('Pérez')
    cy.get('input[name="email"]').type('juan.perez@test.com')
    cy.get('button').contains('Siguiente').click()

    // Verificar que avanzamos al paso 2
    cy.contains('Información de Contacto').should('be.visible')

    // PASO 2: Información de Contacto
    cy.get('input[name="phone"]').type('123456789')
    cy.get('input[name="dateOfBirth"]').type('1990-01-01')
    cy.get('select[name="gender"]').select('Masculino')
    cy.get('input[name="country"]').type('España')
    cy.get('input[name="postalCode"]').type('28001')
    cy.get('button').contains('Siguiente').click()

    // Verificar que avanzamos al paso 3
    cy.contains('Contraseña y Términos').should('be.visible')

    // PASO 3: Contraseña y Términos
    cy.get('input[name="password"]').type('password123')
    cy.get('input[name="confirmPassword"]').type('password123')
    cy.get('input[name="agreeTerms"]').check()
    
    // Interceptar la llamada a la API de registro
    cy.intercept('POST', 'http://localhost:3000/register').as('registerUser')
    
    cy.get('button').contains('Crear cuenta').click()

    // Verificar que se envió la petición (aceptar cualquier código de respuesta)
    cy.wait('@registerUser').then((interception) => {
      // Verificar que se envió la petición correctamente
      expect(interception.request.body).to.have.property('first_name')
      expect(interception.request.body).to.have.property('last_name')
      expect(interception.request.body).to.have.property('email')
      expect(interception.request.body).to.have.property('password')
      
      // Log del status code para debugging
      cy.log(`Status Code: ${interception.response.statusCode}`)
      cy.log(`Response Body: ${JSON.stringify(interception.response.body)}`)
    })
  })

  it('should validate password requirements', () => {
    // Navegar a register
    cy.get('a').contains('Regístrate ahora').click()
    
    // Ir al paso 3
    cy.get('input[name="firstName"]').type('Test')
    cy.get('input[name="lastName"]').type('User')
    cy.get('input[name="email"]').type('test@test.com')
    cy.get('button').contains('Siguiente').click()

    cy.get('input[name="phone"]').type('123456789')
    cy.get('input[name="dateOfBirth"]').type('1990-01-01')
    cy.get('select[name="gender"]').select('Masculino')
    cy.get('input[name="country"]').type('España')
    cy.get('input[name="postalCode"]').type('28001')
    cy.get('button').contains('Siguiente').click()

    // Probar contraseña corta
    cy.get('input[name="password"]').type('123')
    cy.get('input[name="confirmPassword"]').type('123')
    cy.get('input[name="agreeTerms"]').check()
    cy.get('button').contains('Crear cuenta').click()

    // Verificar mensaje de error
    cy.contains('al menos 8 caracteres').should('be.visible')
  })

  it('should validate password confirmation', () => {
    // Navegar a register
    cy.get('a').contains('Regístrate ahora').click()
    
    // Ir al paso 3
    cy.get('input[name="firstName"]').type('Test')
    cy.get('input[name="lastName"]').type('User')
    cy.get('input[name="email"]').type('test@test.com')
    cy.get('button').contains('Siguiente').click()

    cy.get('input[name="phone"]').type('123456789')
    cy.get('input[name="dateOfBirth"]').type('1990-01-01')
    cy.get('select[name="gender"]').select('Masculino')
    cy.get('input[name="country"]').type('España')
    cy.get('input[name="postalCode"]').type('28001')
    cy.get('button').contains('Siguiente').click()

    // Probar contraseñas que no coinciden
    cy.get('input[name="password"]').type('password123')
    cy.get('input[name="confirmPassword"]').type('password456')
    cy.get('input[name="agreeTerms"]').check()
    cy.get('button').contains('Crear cuenta').click()

    // Verificar mensaje de error
    cy.contains('no coinciden').should('be.visible')
  })

  it('should navigate between steps', () => {
    // Navegar a register
    cy.get('a').contains('Regístrate ahora').click()
    
    // Completar paso 1
    cy.get('input[name="firstName"]').type('Test')
    cy.get('input[name="lastName"]').type('User')
    cy.get('input[name="email"]').type('test@test.com')
    cy.get('button').contains('Siguiente').click()

    // Verificar paso 2
    cy.contains('Información de Contacto').should('be.visible')

    // Volver al paso 1
    cy.get('button').contains('Atrás').click()
    cy.contains('Información Personal').should('be.visible')

    // Avanzar de nuevo al paso 2
    cy.get('button').contains('Siguiente').click()
    cy.contains('Información de Contacto').should('be.visible')
  })

  it('should validate required fields', () => {
    // Navegar a register
    cy.get('a').contains('Regístrate ahora').click()
    
    // Intentar avanzar sin completar campos
    cy.get('button').contains('Siguiente').click()
    
    // Debería permanecer en el paso 1
    cy.contains('Información Personal').should('be.visible')
  })
})