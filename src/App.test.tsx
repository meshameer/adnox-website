import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

async function fillForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Your name'), 'Alex');
  await user.type(screen.getByLabelText('Work email'), 'alex@example.com');
  await user.type(screen.getByLabelText('Restaurant name'), 'Test restaurant');
}

describe('adnex site', () => {
  it('all section navigation targets exist', () => {
    render(<App />);
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      const id = a.getAttribute('href')!.slice(1);
      if (id) expect(document.getElementById(id), `#${id}`).toBeTruthy();
    });
  });

  it('keeps the anchors used by the previous site', () => {
    render(<App />);
    for (const id of ['experience', 'demo', 'hardware', 'pilot']) expect(document.getElementById(id)).toBeTruthy();
  });

  it('shows field errors and does not send an incomplete form', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch');
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: 'Send' }));
    expect(screen.getByText('Please enter your name.')).toBeTruthy();
    expect(screen.getByText('Please enter a valid email address.')).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('posts the enquiry to /api/inquiry and confirms only after the server accepts it', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{"ok":true}', { status: 202 }));
    render(<App />);
    const user = userEvent.setup();
    await fillForm(user);
    await user.click(screen.getByRole('button', { name: 'Send' }));
    await waitFor(() => expect(screen.getByText(/Your message has been sent/)).toBeTruthy());
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/inquiry');
    expect(JSON.parse(String((init as RequestInit).body))).toMatchObject({ name: 'Alex', email: 'alex@example.com', restaurant: 'Test restaurant', locations: '1 location' });
  });

  it('tells the visitor when sending fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 502 }));
    render(<App />);
    const user = userEvent.setup();
    await fillForm(user);
    await user.click(screen.getByRole('button', { name: 'Send' }));
    await waitFor(() => expect(screen.getByText(/could not be sent/)).toBeTruthy());
    expect(screen.queryByText(/has been sent/)).toBeNull();
  });
});
