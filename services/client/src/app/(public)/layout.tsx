import React from 'react';
import { cookies } from 'next/headers';
import { getDictionary } from '@/translation/getDictionary';
import { getLocaleFromCookies } from '@/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: {
      default: dictionary.projectName,
      // template: `%s - ${dictionary.projectName}`,
    },
    robots: {
      follow: true,
      index: true,
    },
  };
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}
