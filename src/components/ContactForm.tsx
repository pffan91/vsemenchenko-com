import { useState, type FormEvent } from 'react';

type Status = 'idle' | 'loading' | 'success' | 'error';

interface FieldErrors {
  name?: string;
  email?: string;
  message?: string;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  function validateField(field: string, value: string): string | undefined {
    if (field === 'name' && !value.trim()) return 'Name is required.';
    if (field === 'email') {
      if (!value.trim()) return 'Email is required.';
      if (!validateEmail(value)) return 'Please enter a valid email.';
    }
    if (field === 'message' && !value.trim()) return 'Message is required.';
    return undefined;
  }

  function handleBlur(field: string, value: string) {
    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const newErrors: FieldErrors = {
      name: validateField('name', name),
      email: validateField('email', email),
      message: validateField('message', message),
    };
    setErrors(newErrors);

    if (Object.values(newErrors).some(Boolean)) return;

    setStatus('loading');
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: import.meta.env.PUBLIC_WEB3FORMS_KEY,
          name,
          email,
          message,
        }),
      });

      if (res.ok) {
        setStatus('success');
        setName('');
        setEmail('');
        setMessage('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-center dark:border-green-800 dark:bg-green-950">
        <p className="text-lg font-semibold text-green-900 dark:text-green-100">
          Message sent!
        </p>
        <p className="mt-2 text-sm text-green-700 dark:text-green-300">
          Thank you for reaching out. I'll get back to you soon.
        </p>
        <button
          onClick={() => setStatus('idle')}
          className="mt-4 text-sm font-medium text-accent-600 hover:text-accent-700 dark:text-accent-400"
        >
          Send another message
        </button>
      </div>
    );
  }

  const inputClass =
    'mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm transition-colors focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100';
  const errorClass = 'mt-1 text-xs text-red-600 dark:text-red-400';

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div>
        <label htmlFor="contact-name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Name
        </label>
        <input
          id="contact-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => handleBlur('name', name)}
          className={inputClass}
          aria-describedby={errors.name ? 'name-error' : undefined}
          aria-invalid={!!errors.name}
        />
        {errors.name && <p id="name-error" className={errorClass}>{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="contact-email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Email
        </label>
        <input
          id="contact-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => handleBlur('email', email)}
          className={inputClass}
          aria-describedby={errors.email ? 'email-error' : undefined}
          aria-invalid={!!errors.email}
        />
        {errors.email && <p id="email-error" className={errorClass}>{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="contact-message" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Message
        </label>
        <textarea
          id="contact-message"
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onBlur={() => handleBlur('message', message)}
          className={inputClass}
          aria-describedby={errors.message ? 'message-error' : undefined}
          aria-invalid={!!errors.message}
        />
        {errors.message && <p id="message-error" className={errorClass}>{errors.message}</p>}
      </div>

      {status === 'error' && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          Something went wrong. Please try again.
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="inline-flex items-center rounded-lg bg-accent-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent-700 disabled:opacity-50"
      >
        {status === 'loading' ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}
