export interface Testimonial {
  id: string;
  name: string;
  role: string;
  date: string;
  quote: string;
  initials: string;
  avatarBg: string;
  featured?: boolean;
}

export const COMMUNITY_TESTIMONIALS: Testimonial[] = [
  {
    id: 't-1',
    name: 'Laiza',
    role: 'Web Developer',
    date: '1d ago',
    quote: 'Nice!',
    initials: 'LZ',
    avatarBg: 'from-[#2A2D30] to-[#18191B]'
  },
  {
    id: 't-2',
    name: 'J',
    role: 'Maker',
    date: '3d ago',
    quote: 'Ganda nito',
    initials: 'J',
    avatarBg: 'from-[#2A2D30] to-[#18191B]'
  },
  {
    id: 't-3',
    name: 'Rave Fiore',
    role: 'Software Engineer',
    date: 'Jul 19',
    quote: 'Cool concept! Plan ko rin gumawa nito but since you made it open-source, mag contribute na lang ako sa project na to.',
    initials: 'RF',
    avatarBg: 'from-[#2A2D30] to-[#18191B]',
    featured: true
  },
  {
    id: 't-4',
    name: 'Mar Motas',
    role: 'Maker',
    date: 'Jul 13',
    quote: 'Very helpful tools for me as a UI/UX designer!',
    initials: 'MM',
    avatarBg: 'from-[#2A2D30] to-[#18191B]'
  },
  {
    id: 't-5',
    name: 'Mc Phy Cabanes',
    role: 'Maker',
    date: 'Jul 12',
    quote: "Great Concept!!! I really like the architecture of this, I'm excited to see new RAG stuff in this community :)",
    initials: 'MC',
    avatarBg: 'from-[#2A2D30] to-[#18191B]',
    featured: true
  },
  {
    id: 't-6',
    name: 'Renz Paulo Baltazar',
    role: 'Indie Developer',
    date: 'Jul 11',
    quote: 'Solid naman niyan boss Arron Parejas and team!',
    initials: 'RB',
    avatarBg: 'from-[#2A2D30] to-[#18191B]'
  },
  {
    id: 't-7',
    name: 'Makie',
    role: 'Full Stack Developer',
    date: 'Jul 8',
    quote: 'Ganda boss!',
    initials: 'MK',
    avatarBg: 'from-[#2A2D30] to-[#18191B]'
  },
  {
    id: 't-8',
    name: 'Marc Ian Escober',
    role: 'CTO, SOFI AI',
    date: 'Jul 7',
    quote: 'Nice application!',
    initials: 'ME',
    avatarBg: 'from-[#2A2D30] to-[#18191B]'
  },
  {
    id: 't-9',
    name: 'Ralph Pecayo',
    role: 'Aye-Aye Captain',
    date: 'Jul 7',
    quote: 'Top 1 kana. Grats ♥️',
    initials: 'RP',
    avatarBg: 'from-[#2A2D30] to-[#18191B]'
  },
  {
    id: 't-10',
    name: 'Daniel zan Baltazar',
    role: 'Founder, UpaMate',
    date: 'Jul 5',
    quote: 'Nice to see DomoDomo Keep up the great work!',
    initials: 'DB',
    avatarBg: 'from-[#2A2D30] to-[#18191B]',
    featured: true
  },
  {
    id: 't-11',
    name: 'Mark Jay Gooc',
    role: 'Architect (soon)',
    date: 'Jul 5',
    quote: 'nice! sana may option i-download as Progressive Web App (PWA) sa browser',
    initials: 'MG',
    avatarBg: 'from-[#2A2D30] to-[#18191B]'
  },
  {
    id: 't-12',
    name: 'Jem Raymundo',
    role: 'Maker',
    date: 'Jul 5',
    quote: 'Galing neto panalo! 💪',
    initials: 'JR',
    avatarBg: 'from-[#2A2D30] to-[#18191B]'
  },
  {
    id: 't-13',
    name: 'John Rey Asi',
    role: 'App/Web Developer',
    date: 'Jul 4',
    quote: 'aolid bro. akala ko 12 lang, meron pa palang 113 sa baba. recommended!',
    initials: 'JA',
    avatarBg: 'from-[#2A2D30] to-[#18191B]',
    featured: true
  },
  {
    id: 't-14',
    name: 'Norman Bautista',
    role: 'Fullstack Developer',
    date: 'Jul 4',
    quote: 'This is so useful, I hope there are more tools for content creation here, since I cant really do any much in capcut now and most of the features there are paid.',
    initials: 'NB',
    avatarBg: 'from-[#2A2D30] to-[#18191B]',
    featured: true
  },
  {
    id: 't-15',
    name: 'yujimin',
    role: 'Maker',
    date: 'Jul 3',
    quote: "I've been exploring DomoDomo, and it's impressive to see how many AI-powered tools are integrated into a single workspace. The offline-first and local-first approach is a standout feature, especially for users who value privacy and want to work without relying on a constant internet connection. While the app is still evolving and there are a few rough edges, it's clear that the team is actively developing and improving it. The concept has a lot of potential, and I'm excited to see how it grows with future updates. Keep up the great work!",
    initials: 'YM',
    avatarBg: 'from-[#2A2D30] to-[#18191B]',
    featured: true
  },
  {
    id: 't-16',
    name: 'yujimin',
    role: 'Maker',
    date: 'Jul 3',
    quote: 'requesting for larger batch image tool sa next features niyo',
    initials: 'YM',
    avatarBg: 'from-[#2A2D30] to-[#18191B]'
  }
];
