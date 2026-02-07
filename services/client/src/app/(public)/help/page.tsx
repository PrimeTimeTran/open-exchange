import React from 'react';
import { HelpCenterClient } from './help-center-client';
import { categories } from './data';

export default function HelpCenterPage() {
  return <HelpCenterClient categories={categories} />;
}
