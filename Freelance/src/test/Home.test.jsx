import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../Home';

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Home Component', () => {
  test('renderiza el componente Home', async () => {
    renderWithRouter(<Home />);
    
    await waitFor(() => {
      expect(screen.getByText('FreelanceHub')).toBeInTheDocument();
      expect(screen.getByText('Publicaciones de la Comunidad')).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  test('muestra la barra de búsqueda', async () => {
    renderWithRouter(<Home />);
    
    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Buscar publicaciones, proyectos o personas...');
      expect(searchInput).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  test('permite escribir en la barra de búsqueda', async () => {
    renderWithRouter(<Home />);
    
    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Buscar publicaciones, proyectos o personas...');
      fireEvent.change(searchInput, { target: { value: 'test search' } });
      expect(searchInput.value).toBe('test search');
    }, { timeout: 5000 });
  });

  test('muestra el área de crear publicación', async () => {
    renderWithRouter(<Home />);
    
    await waitFor(() => {
      const createPostInput = screen.getByPlaceholderText('¿Qué quieres compartir hoy?');
      expect(createPostInput).toBeInTheDocument();
      expect(screen.getByText('Publicar')).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  test('permite escribir en el área de publicación', async () => {
    renderWithRouter(<Home />);
    
    await waitFor(() => {
      const createPostInput = screen.getByPlaceholderText('¿Qué quieres compartir hoy?');
      fireEvent.change(createPostInput, { target: { value: 'Mi nueva publicación' } });
      expect(createPostInput.value).toBe('Mi nueva publicación');
    }, { timeout: 5000 });
  });

  test('muestra los filtros de publicaciones', async () => {
    renderWithRouter(<Home />);
    
    await waitFor(() => {
      expect(screen.getByText('Recientes')).toBeInTheDocument();
      expect(screen.getByText('Populares')).toBeInTheDocument();
      expect(screen.getByText('Siguiendo')).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  test('muestra el botón de cargar más publicaciones', async () => {
    renderWithRouter(<Home />);
    
    await waitFor(() => {
      expect(screen.getByText('Cargar más publicaciones')).toBeInTheDocument();
    }, { timeout: 5000 });
  });
}); 