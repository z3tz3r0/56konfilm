import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { WeddingFields } from '@features/contact-section/components/WeddingFields';
import {
  contactFormSchema,
  type ContactFormValues,
} from '@features/contact-section/validation';
import { Form } from '@shared/components/ui/form';
import { Input, inputControlStyles } from '@shared/components/ui/input';
import { Button } from '@shared/components/ui/button';

const selectedDate = new Date(2050, 6, 20);

function WeddingForm({
  lang = 'en',
  date,
  onSubmit = vi.fn(),
}: {
  lang?: 'en' | 'th';
  date?: Date;
  onSubmit?: (values: ContactFormValues) => void;
}) {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    mode: 'onBlur',
    defaultValues: {
      type: 'wedding',
      name: 'Example couple',
      surname: 'Example',
      email: 'example@example.com',
      message: 'Wedding inquiry',
      venue: 'Example venue',
      weddingDate: date,
    },
  });
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <WeddingFields form={form} lang={lang} />
        <button
          type='button'
          onClick={() =>
            form.setError('weddingDate', {
              type: 'required',
              message: 'Choose a wedding date',
            })
          }
        >
          Mark date invalid
        </button>
        <button type='submit'>Submit test form</button>
        <button type='button' onClick={() => form.reset()}>
          Reset test form
        </button>
      </form>
    </Form>
  );
}

describe('WeddingFields', () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('uses the same input geometry, colors, and focus/error styles as Venue', () => {
    render(<WeddingForm />);
    const trigger = screen.getByLabelText('Wedding Date');
    const venue = screen.getByLabelText('Venue');
    for (const className of inputControlStyles.split(/\s+/)) {
      expect(trigger).toHaveClass(className);
      expect(venue).toHaveClass(className);
    }
    expect(trigger).toHaveClass('font-normal', 'dark:rounded-md');
    for (const className of [
      'border-2',
      'border-primary',
      'text-primary',
      'dark:rounded-full',
    ]) {
      expect(trigger).not.toHaveClass(className);
    }
    expect(trigger).toHaveAttribute('type', 'button');
    expect(trigger).toHaveTextContent('Pick a date');
    fireEvent.click(screen.getByRole('button', { name: 'Mark date invalid' }));
    expect(trigger).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Choose a wedding date')).toHaveAttribute(
      'id',
      trigger.getAttribute('aria-describedby')?.split(' ').at(-1)
    );
  });

  it.each(['en', 'th'] as const)(
    'keeps selected-date formatting in %s',
    (lang) => {
      render(<WeddingForm lang={lang} date={selectedDate} />);
      const trigger = screen.getByLabelText(
        lang === 'th' ? 'วันแต่งงาน' : 'Wedding Date'
      );
      expect(trigger).toHaveTextContent(
        new Intl.DateTimeFormat(lang === 'th' ? 'th-TH' : 'en-US', {
          dateStyle: 'medium',
        }).format(selectedDate)
      );
      expect(trigger).not.toHaveClass('text-muted-foreground');
    }
  );

  it('opens the existing calendar without submitting and preserves date selection and keyboard dismissal', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2050, 6, 20, 12));
    const onSubmit = vi.fn();
    render(<WeddingForm date={selectedDate} onSubmit={onSubmit} />);
    const trigger = screen.getByLabelText('Wedding Date');
    trigger.focus();
    expect(trigger).toHaveFocus();
    fireEvent.click(trigger);
    const dialog = await screen.findByRole('dialog');
    expect(onSubmit).not.toHaveBeenCalled();
    expect(
      dialog.querySelector(
        `button[data-day="${new Date(2050, 6, 19).toLocaleDateString()}"]`
      )
    ).toBeDisabled();
    const nextDate = new Date(2050, 6, 21);
    const day = dialog.querySelector<HTMLButtonElement>(
      `button[data-day="${nextDate.toLocaleDateString()}"]`
    );
    expect(day).not.toBeNull();
    fireEvent.click(day!);
    expect(trigger).toHaveTextContent(
      new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(nextDate)
    );
    fireEvent.keyDown(dialog, { key: 'Escape' });
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    );
    fireEvent.click(screen.getByRole('button', { name: 'Submit test form' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0].weddingDate).toEqual(nextDate);
  });

  it('preserves existing Input file styles and secondary/default Button variants', () => {
    render(
      <>
        <Input type='file' aria-label='File input' />
        <Button variant='secondary'>Secondary action</Button>
        <Button>Default action</Button>
      </>
    );
    expect(screen.getByLabelText('File input')).toHaveClass(
      'file:text-foreground',
      'file:inline-flex',
      'file:h-7',
      'file:border-0',
      'file:bg-transparent',
      'file:text-sm',
      'file:font-medium'
    );
    expect(
      screen.getByRole('button', { name: 'Secondary action' })
    ).toHaveClass(
      'border-2',
      'border-primary',
      'text-primary',
      'dark:rounded-full',
      'px-6',
      'py-3'
    );
    expect(screen.getByRole('button', { name: 'Default action' })).toHaveClass(
      'bg-primary',
      'text-primary-foreground',
      'dark:rounded-full',
      'px-6',
      'py-3'
    );
  });

  it('clears the blur error immediately after selecting a date and validates deselection without submitting', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2050, 6, 20, 12));
    const onSubmit = vi.fn();
    render(<WeddingForm onSubmit={onSubmit} />);
    const trigger = screen.getByLabelText('Wedding Date');
    trigger.focus();
    fireEvent.click(trigger);
    const dialog = await screen.findByRole('dialog');
    fireEvent.blur(trigger);
    await screen.findByText('Please select your wedding date.');
    expect(trigger).toHaveAttribute('aria-invalid', 'true');

    const nextDate = new Date(2050, 6, 21);
    const getDay = (date: Date) => {
      const day = dialog.querySelector<HTMLButtonElement>(
        `button[data-day="${date.toLocaleDateString()}"]`
      );
      expect(day).not.toBeNull();
      return day!;
    };
    fireEvent.click(getDay(nextDate));
    await waitFor(() =>
      expect(trigger).toHaveAttribute('aria-invalid', 'false')
    );
    expect(
      screen.queryByText('Please select your wedding date.')
    ).not.toBeInTheDocument();
    expect(trigger).toHaveTextContent('Jul 21, 2050');
    expect(onSubmit).not.toHaveBeenCalled();
    expect(dialog).toBeInTheDocument();

    fireEvent.click(getDay(nextDate));
    await screen.findByText('Please select your wedding date.');
    expect(trigger).toHaveTextContent('Pick a date');
    expect(trigger).toHaveAttribute('aria-invalid', 'true');

    const replacementDate = new Date(2050, 6, 22);
    fireEvent.click(getDay(replacementDate));
    await waitFor(() =>
      expect(trigger).toHaveAttribute('aria-invalid', 'false')
    );
    expect(trigger).toHaveTextContent('Jul 22, 2050');
    fireEvent.keyDown(dialog, { key: 'Escape' });
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    );
    fireEvent.click(screen.getByRole('button', { name: 'Submit test form' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(onSubmit.mock.calls[0][0].weddingDate).toEqual(replacementDate);

    fireEvent.click(screen.getByRole('button', { name: 'Reset test form' }));
    expect(trigger).toHaveTextContent('Pick a date');
    expect(trigger).toHaveAttribute('aria-invalid', 'false');
    expect(
      screen.queryByText('Please select your wedding date.')
    ).not.toBeInTheDocument();
  });

  it('blocks submission without a wedding date and shows a friendly required message', async () => {
    const onSubmit = vi.fn();
    render(<WeddingForm onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole('button', { name: 'Submit test form' }));
    await screen.findByText('Please select your wedding date.');
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Wedding Date')).toHaveAttribute(
      'aria-invalid',
      'true'
    );
    expect(
      screen.queryByText(/expected date|received undefined/)
    ).not.toBeInTheDocument();
  });
});
