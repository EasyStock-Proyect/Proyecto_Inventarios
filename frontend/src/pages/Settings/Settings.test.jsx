import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

const { mockSetUser, mockUser } = vi.hoisted(() => ({
  mockSetUser: vi.fn(),
  mockUser: {
    fullName: 'María García López',
    businessName: 'Tienda La Esperanza',
    businessType: 'Tienda',
    email: 'admin@tienda.com',
    address: 'Cra. 7 #45-23, Bogotá',
    profileImage: '',
  },
}));

vi.mock('react-router-dom', () => ({
  useOutletContext: () => ({
    user: mockUser,
    setUser: mockSetUser,
  }),
}));

vi.mock('../../api/api', () => ({
  default: {
    put: vi.fn(),
  },
}));

import api from '../../api/api';
import Settings from './Settings';

describe('Settings page', () => {
  it('permite editar el nombre del negocio y guardar cambios', async () => {
    api.put.mockResolvedValue({
      data: {
        ...mockUser,
        businessName: 'Mi nueva tienda',
      },
    });

    render(<Settings />);

    const businessInput = screen.getByLabelText(/nombre del negocio/i);
    fireEvent.change(businessInput, { target: { value: 'Mi nueva tienda' } });

    const saveButton = screen.getByRole('button', { name: /guardar cambios/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith('/auth/me', expect.objectContaining({
        businessName: 'Mi nueva tienda',
      }));
    });

    expect(mockSetUser).toHaveBeenCalled();
    expect(businessInput.value).toBe('Mi nueva tienda');
  });
});
