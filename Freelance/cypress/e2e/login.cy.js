describe('Login Integration Test', () => {
  beforeEach(() => {
    // Configurar interceptación ANTES de visitar la página
    cy.intercept('GET', 'http://localhost:3000/posts').as('getPosts')
    cy.visit('/')
  })

  it('should login with demo credentials and navigate to home', () => {
    // 1. Verificar que estamos en la página de login
    cy.get('h1').should('contain', 'Iniciar Sesión')
    
    // 2. Ingresar credenciales demo
    cy.get('input[type="email"]').type('demo@test.com')
    cy.get('input[type="password"]').type('demo123')
    
    // 3. Hacer clic en el botón de login
    cy.get('button[type="submit"]').click()
    
    // 4. Verificar mensaje de éxito
    cy.contains('Login exitoso (modo demo)').should('be.visible')
    
    // 5. Esperar la redirección automática
    cy.wait(1000)
    
    // 6. Verificar que estamos en la página home
    cy.url().should('include', '/home')
    
    // 7. Verificar que se cargó el dashboard
    cy.contains('FreelanceHub').should('be.visible')
    cy.contains('Miguel Sánchez').should('be.visible')
    
    // 8. Esperar a que se complete la llamada a la API
    cy.wait('@getPosts').then((interception) => {
      // Aceptar tanto 200 como 304 (ambos son respuestas exitosas)
      expect([200, 304]).to.include(interception.response.statusCode)
    })
  })

  it('should handle login error with invalid credentials', () => {
    // 1. Ingresar credenciales inválidas
    cy.get('input[type="email"]').type('invalid@test.com')
    cy.get('input[type="password"]').type('wrongpassword')
    
    // 2. Hacer clic en login
    cy.get('button[type="submit"]').click()
    
    // 3. Verificar que se muestra algún mensaje de error
    cy.get('.message').should('be.visible')
    
    // 4. Verificar que seguimos en la página de login
    cy.url().should('eq', Cypress.config().baseUrl + '/')
  })

  it('should navigate to register page', () => {
    // 1. Hacer clic en el enlace de registro
    cy.get('a').contains('Regístrate ahora').click()
    
    // 2. Verificar que estamos en la página de registro
    cy.url().should('include', '/register')
    
    // 3. Verificar que se muestra algún contenido de registro
    cy.get('form').should('be.visible')
    
    // 4. Volver a la página de login
    cy.go('back')
    
    // 5. Verificar que estamos de vuelta en login
    cy.url().should('eq', Cypress.config().baseUrl + '/')
    cy.contains('Iniciar Sesión').should('be.visible')
  })
})