import { ContactForm } from '@/components/contact-form';

export const metadata = {
  title: 'Contact Us',
  description: 'Get in touch with us using our modern contact form'
};

export default function ContactPage() {
  return (
    <div className="w-full min-h-screen bg-background py-12 md:py-24">
      <div className="px-4 sm:px-6 lg:px-8">
        <ContactForm />
      </div>
    </div>
  );
}
