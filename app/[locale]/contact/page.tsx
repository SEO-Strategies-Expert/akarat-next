import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const titles = {
    ar: 'تواصل معنا - عقارات إسطنبول',
    en: 'Contact Us - Akarat Istanbul',
    ru: 'Свяжитесь с нами - Акарат Стамбул',
  };
  const descriptions = {
    ar: 'تواصل مع فريقنا للاستفسار عن العقارات والحصول على المساعدة',
    en: 'Contact our team to inquire about properties and get assistance',
    ru: 'Свяжитесь с нашей командой для получения информации о недвижимости и помощи',
  };

  return {
    title: titles[locale as keyof typeof titles] || titles.en,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.en,
  };
}

'use client';

import { useState } from 'react';

export default function ContactPage({ params }: { params: { locale: string } }) {
  const locale = params.locale;
  const isRtl = locale === 'ar';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const messages = {
    ar: {
      title: 'تواصل معنا',
      sending: 'جاري الإرسال...',
      success: 'تم إرسال رسالتك بنجاح!',
      error: 'حدث خطأ أثناء الإرسال. يرجى المحاولة لاحقاً.',
    },
    en: {
      title: 'Contact Us',
      sending: 'Sending...',
      success: 'Your message has been sent successfully!',
      error: 'An error occurred while sending. Please try again later.',
    },
    ru: {
      title: 'Свяжитесь с нами',
      sending: 'Отправка...',
      success: 'Ваше сообщение отправлено успешно!',
      error: 'При отправке произошла ошибка. Пожалуйста, попробуйте позже.',
    },
  };

  const t = messages[locale as keyof typeof messages] || messages.en;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const formData = new FormData(e.currentTarget);
      const name = formData.get('name');
      const email = formData.get('email');
      const message = formData.get('message');

      // Simulate form submission (replace with actual API call)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSubmitMessage(t.success);
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      setSubmitMessage(t.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">{t.title}</h1>
        <div className="max-w-2xl">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder={locale === 'ar' ? 'الاسم' : locale === 'en' ? 'Name' : 'Имя'}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
            <input
              type="email"
              name="email"
              placeholder={locale === 'ar' ? 'البريد' : locale === 'en' ? 'Email' : 'Email'}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
            <textarea
              name="message"
              placeholder={locale === 'ar' ? 'الرسالة' : locale === 'en' ? 'Message' : 'Сообщение'}
              className="w-full px-4 py-2 border rounded-lg"
              rows={5}
              required
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? t.sending : locale === 'ar' ? 'إرسال' : locale === 'en' ? 'Send' : 'Отправить'}
            </button>
          </form>
          {submitMessage && (
            <div
              className={`mt-4 p-4 rounded-lg ${
                submitMessage === t.success
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {submitMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
