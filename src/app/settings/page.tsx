import { Bell, Eye, Settings, Shield, Tv } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Settings' };

const sections = [
  {
    icon: Eye,
    title: 'Display Preferences',
    description: 'Theme, language, and subtitle settings',
    items: ['Dark mode (always on)', 'Subtitle language: Japanese', 'UI language: English'],
  },
  {
    icon: Bell,
    title: 'Notifications',
    description: 'Manage alerts for new episodes and channels',
    items: ['New episode alerts: Off', 'Live channel notifications: Off', 'Weekly digest: Off'],
  },
  {
    icon: Tv,
    title: 'Playback',
    description: 'Player and streaming preferences',
    items: ['Default quality: Auto', 'Autoplay next: On', 'Skip intros: Off'],
  },
  {
    icon: Shield,
    title: 'Legal & Compliance',
    description: 'Content policies and attribution',
    items: [
      'Anime TV only links to officially licensed content.',
      'No content is hosted, proxied, or rebroadcast.',
      'All trademarks belong to their respective owners.',
    ],
  },
];

export default function SettingsPage() {
  return (
    <div className='mx-auto max-w-screen-lg px-4 py-8'>
      <div className='mb-8 flex items-center gap-3'>
        <Settings className='h-6 w-6 text-slate-400' />
        <h1 className='text-2xl font-bold text-white md:text-3xl'>Settings</h1>
      </div>
      <p className='mb-8 text-slate-400'>Phase 1 — settings are informational only. Full preferences coming in Phase 2.</p>

      <div className='space-y-4'>
        {sections.map((section) => (
          <div key={section.title} className='rounded-xl border border-slate-800 bg-slate-900 p-5'>
            <div className='mb-4 flex items-center gap-3'>
              <section.icon className='h-5 w-5 text-cyan-400' />
              <div>
                <h2 className='font-semibold text-white'>{section.title}</h2>
                <p className='text-sm text-slate-500'>{section.description}</p>
              </div>
            </div>
            <ul className='space-y-2'>
              {section.items.map((item) => (
                <li key={item} className='flex items-center justify-between rounded-lg bg-slate-800/50 px-4 py-2.5 text-sm text-slate-300'>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
