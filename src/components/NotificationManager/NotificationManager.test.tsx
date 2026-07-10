import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationManager, notify } from './NotificationManager';

describe('NotificationManager', () => {
    it('renders the notification container without alerts initially', () => {
        render(<NotificationManager />);

        expect(screen.getByTestId('notification-container')).toBeInTheDocument();
        expect(screen.queryByTestId('success-toast')).not.toBeInTheDocument();
        expect(screen.queryByTestId('modal-overlay')).not.toBeInTheDocument();
    });

    it('shows a success toast and removes it after 3 seconds', async () => {
        render(<NotificationManager />);

        notify.success('Saved successfully');

        expect(await screen.findByText('Saved successfully')).toBeInTheDocument();
        expect(screen.getByTestId('success-toast')).toBeInTheDocument();


        await waitFor(() => {
            expect(screen.queryByTestId('success-toast')).not.toBeInTheDocument();
        }, { timeout: 3000 });
    });

    it('shows an error modal and closes it when OK is clicked', async () => {
        const user = userEvent.setup();
        render(<NotificationManager />);

        notify.error('Network error', ['Try again', 'Contact support']);

        expect(await screen.findByTestId('modal-overlay')).toBeInTheDocument();
        expect(screen.getByText('Network error')).toBeInTheDocument();
        expect(screen.getByText('Try again')).toBeInTheDocument();
        expect(screen.getByText('Contact support')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'OK' }));

        await waitFor(() => {
            expect(screen.queryByTestId('modal-overlay')).not.toBeInTheDocument();
        });
    });
});
