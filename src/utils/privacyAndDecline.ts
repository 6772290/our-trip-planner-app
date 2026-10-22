import { PoliteDeclineOption } from '../types/experience';

export const POLITE_DECLINE_TEMPLATES: PoliteDeclineOption[] = [
  {
    id: 'warm_direct',
    titleHe: 'חם וישיר (מתאים לחברים קרובים ומשפחה)',
    titleEn: 'Warm & direct (Close friends & family)',
    textHe: 'המון תודה שחשבתם עלינו והזמנתם! הפעם זה לא יסתדר לנו, אבל נשמח מאוד לתאם ולהיפגש בהזדמנות קרובה. תיהנו המון!',
    textEn: 'Thank you so much for thinking of us and inviting! We won’t be able to make it this time, but we would love to catch up soon. Have a wonderful time!',
    tone: 'warm',
  },
  {
    id: 'brief_friendly',
    titleHe: 'קצר וידידותי',
    titleEn: 'Short & friendly',
    textHe: 'תודה רבה על ההזמנה! לצערי לא אוכל להצטרף הפעם. שיהיה לכם בילוי מוצלח!',
    textEn: 'Thanks a lot for the invite! Unfortunately I won’t be able to join this time. Enjoy yourselves!',
    tone: 'brief',
  },
  {
    id: 'respectful_open',
    titleHe: 'מכבד עם פתח לעתיד',
    titleEn: 'Respectful with future openness',
    textHe: 'תודה על ההצעה. הפעם זה פחות מתאים, אך אשמח שנשמור על קשר ונתאם משהו שמתאים לשנינו בהמשך.',
    textEn: 'Thank you for the proposal. It is not suitable for me this time, but let’s stay in touch and coordinate something that works for both of us down the road.',
    tone: 'respectful',
  },
  {
    id: 'neutral_courteous',
    titleHe: 'ענייני וקורקטי (לקבוצות עבודה או היכרות רחוקה)',
    titleEn: 'Courteous & neutral (Acquaintances & colleagues)',
    textHe: 'תודה רבה על ההזמנה. לא אצליח לקחת חלק הפעם. תודה ושיהיה מפגש מהנה ופורה!',
    textEn: 'Thank you for the invitation. I will not be able to participate this time. Wishing you an enjoyable gathering!',
    tone: 'work_neutral',
  },
];

/**
 * Returns formatted polite decline text customized optionally with the contact name
 */
export function getCustomizedDeclineMessage(
  templateId: string,
  contactName?: string,
  lang: 'he' | 'en' = 'he'
): string {
  const template =
    POLITE_DECLINE_TEMPLATES.find((t) => t.id === templateId) || POLITE_DECLINE_TEMPLATES[0];

  const rawText = lang === 'he' ? template.textHe : template.textEn;

  if (!contactName || contactName.trim() === '') {
    return rawText;
  }

  const trimmedName = contactName.trim();
  if (lang === 'he') {
    return `היי ${trimmedName}, ${rawText}`;
  } else {
    return `Hi ${trimmedName}, ${rawText}`;
  }
}
