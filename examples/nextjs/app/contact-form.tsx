'use client';

import { useActionState } from 'react';
import { sendEmailAction, ActionState } from '@/app/actions';

const initialState: ActionState = {};

export default function ContactForm() {
  const [state, formAction, isPending] = useActionState(sendEmailAction, initialState);

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Contact Us</h2>
      
      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="to" className="block text-sm font-medium text-gray-700 mb-1">
            Recipient Email
          </label>
          <input
            id="to"
            name="to"
            type="email"
            required
            placeholder="user@example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
            Subject
          </label>
          <input
            id="subject"
            name="subject"
            type="text"
            required
            placeholder="Hello there"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={4}
            placeholder="Type your message here..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            isPending ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isPending ? 'Sending...' : 'Send Email'}
        </button>

        {state.success && (
          <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md">
            Email sent successfully! ID: {state.id}
          </div>
        )}
        
        {state.error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            Error: {state.error}
          </div>
        )}
      </form>
    </div>
  );
}
