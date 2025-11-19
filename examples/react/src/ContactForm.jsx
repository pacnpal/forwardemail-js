import React, { useState } from 'react';

export default function ContactForm() {
  const [status, setStatus] = useState('idle'); // idle, loading, success, error

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('loading');

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
      const response = await fetch('http://localhost:3001/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to send');
      
      setStatus('success');
      e.target.reset();
    } catch (err) {
      setStatus('error');
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="to" type="email" placeholder="Recipient" required />
      <input name="subject" placeholder="Subject" required />
      <textarea name="message" placeholder="Message" required />
      
      <button disabled={status === 'loading'}>
        {status === 'loading' ? 'Sending...' : 'Send'}
      </button>

      {status === 'success' && <p>Sent!</p>}
      {status === 'error' && <p>Error sending email.</p>}
    </form>
  );
}
