import ContactForm from './contact-form';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Forward Email Next.js Example</h1>
        <p className="text-gray-600">Demonstrating Server Actions with forwardemail-js</p>
      </div>
      
      <ContactForm />
    </main>
  );
}
