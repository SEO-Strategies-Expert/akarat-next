export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isRtl = locale === 'ar';

  return (
    <div className={`${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">
          {locale === 'ar' ? 'تواصل معنا' : locale === 'en' ? 'Contact Us' : 'Свяжитесь с нами'}
        </h1>
        <div className="max-w-2xl">
          <form className="space-y-4">
            <input
              type="text"
              placeholder={locale === 'ar' ? 'الاسم' : locale === 'en' ? 'Name' : 'Имя'}
              className="w-full px-4 py-2 border rounded-lg"
            />
            <input
              type="email"
              placeholder={locale === 'ar' ? 'البريد' : locale === 'en' ? 'Email' : 'Email'}
              className="w-full px-4 py-2 border rounded-lg"
            />
            <textarea
              placeholder={locale === 'ar' ? 'الرسالة' : locale === 'en' ? 'Message' : 'Сообщение'}
              className="w-full px-4 py-2 border rounded-lg"
              rows={5}
            />
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold">
              {locale === 'ar' ? 'إرسال' : locale === 'en' ? 'Send' : 'Отправить'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
