import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockGetCurrentUser } = vi.hoisted(() => ({
  mockGetCurrentUser: vi.fn(),
}));

vi.mock('../services/auth.service', () => ({
  getCurrentUser: mockGetCurrentUser,
}));

vi.mock('../components/Sidebar/Sidebar', () => ({
  default: () => <div>Sidebar</div>,
}));

vi.mock('../components/Topbar/Topbar', () => ({
  default: () => <div>Topbar</div>,
}));

import MainLayout from './MainLayout';

describe('MainLayout', () => {
  beforeEach(() => {
    mockGetCurrentUser.mockResolvedValue({
      fullName: '',
      businessName: 'Tienda de prueba',
      businessType: 'Tienda',
      address: '',
      email: 'admin@tienda.com',
      notificationEmail: 'admin@tienda.com',
    });
  });

  it('muestra una advertencia para completar el perfil y redirige a ajustes', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<div>Dashboard</div>} />
            <Route path="/ajustes" element={<div>Ajustes</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText(/completa tu perfil/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /completar perfil/i }));

    expect(await screen.findByText(/ajustes/i)).toBeInTheDocument();
  });
});
