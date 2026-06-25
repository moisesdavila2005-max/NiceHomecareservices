'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormStatus {
  type: 'idle' | 'loading' | 'success' | 'error';
  message: string;
}

export function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState<FormStatus>({
    type: 'idle',
    message: ''
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setStatus({ type: 'loading', message: 'Sending your message...' });

    try {
      // Simulate API call - replace with actual endpoint
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setStatus({
        type: 'success',
        message: 'Thank you! Your message has been sent successfully.'
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });

      // Clear success message after 5 seconds
      setTimeout(() => {
        setStatus({ type: 'idle', message: '' });
      }, 5000);
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Something went wrong. Please try again later.'
      });
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">
          Get in Touch
        </h2>
        <p className="text-muted-foreground">
          We&apos;d love to hear from you. Send us a message and we&apos;ll respond as
          soon as possible.
        </p>
      </div>

      {status.type !== 'idle' && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            status.type === 'success'
              ? 'bg-green-50 text-green-900 border border-green-200'
              : status.type === 'error'
                ? 'bg-red-50 text-red-900 border border-red-200'
                : 'bg-blue-50 text-blue-900 border border-blue-200'
          }`}
        >
          {status.type === 'loading' && (
            <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" />
          )}
          {status.type === 'success' && (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          )}
          {status.type === 'error' && (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span className="text-sm font-medium">{status.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-foreground font-semibold">
            Full Name
          </Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
            disabled={status.type === 'loading'}
            className="h-11 border-border bg-background focus:ring-2 focus:ring-primary"
          />
          {errors.name && (
            <p className="text-sm text-red-600 font-medium">{errors.name}</p>
          )}
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-foreground font-semibold">
            Email Address
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={handleChange}
            disabled={status.type === 'loading'}
            className="h-11 border-border bg-background focus:ring-2 focus:ring-primary"
          />
          {errors.email && (
            <p className="text-sm text-red-600 font-medium">{errors.email}</p>
          )}
        </div>

        {/* Subject Field */}
        <div className="space-y-2">
          <Label htmlFor="subject" className="text-foreground font-semibold">
            Subject
          </Label>
          <Input
            id="subject"
            name="subject"
            type="text"
            placeholder="What is this about?"
            value={formData.subject}
            onChange={handleChange}
            disabled={status.type === 'loading'}
            className="h-11 border-border bg-background focus:ring-2 focus:ring-primary"
          />
          {errors.subject && (
            <p className="text-sm text-red-600 font-medium">{errors.subject}</p>
          )}
        </div>

        {/* Message Field */}
        <div className="space-y-2">
          <Label htmlFor="message" className="text-foreground font-semibold">
            Message
          </Label>
          <Textarea
            id="message"
            name="message"
            placeholder="Tell us more about your inquiry..."
            value={formData.message}
            onChange={handleChange}
            disabled={status.type === 'loading'}
            rows={5}
            className="border-border bg-background focus:ring-2 focus:ring-primary resize-none"
          />
          {errors.message && (
            <p className="text-sm text-red-600 font-medium">{errors.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            {formData.message.length} characters
          </p>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={status.type === 'loading'}
          size="lg"
          className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base"
        >
          {status.type === 'loading' ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            'Send Message'
          )}
        </Button>
      </form>

      {/* Additional Info */}
      <div className="mt-8 pt-6 border-t border-border">
        <p className="text-center text-sm text-muted-foreground">
          We typically respond within 24 hours during business days.
        </p>
      </div>
    </div>
  );
}
