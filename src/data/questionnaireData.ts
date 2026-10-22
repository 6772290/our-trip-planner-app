export interface QuestionOption {
  id: string;
  label: string;
  description?: string;
  icon?: string;
}

export interface QuestionDef {
  id: string;
  stepNumber: number;
  title: string;
  subtitle: string;
  type: 'multi' | 'single' | 'text';
  isOptional?: boolean;
  options?: QuestionOption[];
  placeholder?: string;
}

export const QUESTIONNAIRE_STEPS: QuestionDef[] = [
  {
    id: 'interests',
    stepNumber: 1,
    title: 'אילו חוויות מעניינות אותך במיוחד?',
    subtitle: 'אפשר לבחור כמה אפשרויות שמשקפות את מה שמרגש אותך בטיול',
    type: 'multi',
    options: [
      {
        id: 'nature',
        label: 'טבע, נופים וטיולים רגליים',
        description: 'אגמים, הרים, שמורות טבע, מפלים ושבילי הליכה מרהיבים',
        icon: 'mountain',
      },
      {
        id: 'culture',
        label: 'ערים, תרבות, מוזיאונים והיסטוריה',
        description: 'סמטאות עתיקות, ארכיטקטורה, אתרי מורשת, מוזיאונים וגלריות',
        icon: 'landmark',
      },
      {
        id: 'food',
        label: 'אוכל, שווקים וחוויות קולינריות',
        description: 'מסעדות מקומיות, שווקי אוכל תוססים, יקבים וסדנאות בישול',
        icon: 'utensils',
      },
      {
        id: 'beach_relax',
        label: 'מנוחה, חופים ופינוקים',
        description: 'בטן-גב מול הים, ספא איכותי, קריאת ספר ושקט אמיתי',
        icon: 'palmtree',
      },
      {
        id: 'attractions',
        label: 'אטרקציות, פארקים ופעילויות',
        description: 'פארקי שעשועים, מגלשות הרים, פארקי חבלים וחוויות אקשן',
        icon: 'ticket',
      },
      {
        id: 'nightlife',
        label: 'הופעות, אירועים וחיי לילה',
        description: 'ברים שכונתיים, הופעות חיות, מועדונים ואירועי תרבות ערב',
        icon: 'music',
      },
    ],
  },
  {
    id: 'pace',
    stepNumber: 2,
    title: 'מהו קצב הטיול המועדף עליך?',
    subtitle: 'בחירה זו תעזור לנו לקבוע את כמות הפעילויות וזמני המנוחה ביום',
    type: 'single',
    options: [
      {
        id: 'relaxed',
        label: 'רגוע ושליו',
        description: 'קימה בנחת, יעד או פעילות אחת ביום, הרבה זמן פנוי לשבת בקפה וליהנות מהרגע.',
        icon: 'coffee',
      },
      {
        id: 'balanced',
        label: 'מאוזן ומגוון',
        description: 'פעילות מעניינת בחלק הראשון של היום, ואחר הצהריים גמיש למנוחה, שיטוט וארוחה טובה.',
        icon: 'compass',
      },
      {
        id: 'intense',
        label: 'עמוס ומלא חוויות',
        description: 'קמים מוקדם, מספיקים כמה שיותר אתרים, רואים עולם ומנצלים כל שעה ביום.',
        icon: 'zap',
      },
    ],
  },
  {
    id: 'budget',
    stepNumber: 3,
    title: 'מהו סגנון התקציב והאירוח המתוכנן?',
    subtitle: 'נעזור לך לכוון ליעדים ומלונות שמתאימים לרמת ההוצאה הנוחה עבורך',
    type: 'single',
    options: [
      {
        id: 'budget',
        label: 'חסכוני ומדויק',
        description: 'טיסות לואו-קוסט, תחבורה ציבורית, הוסטלים איכותיים או מלונות 2-3 כוכבים נקיים.',
        icon: 'wallet',
      },
      {
        id: 'medium',
        label: 'בינוני ומאוזן (ערך מעולה לכסף)',
        description: 'מלונות 3-4 כוכבים במיקום מרכזי, ארוחות במסעדות טובות, רכב שכור נוח בעת הצורך.',
        icon: 'scale',
      },
      {
        id: 'premium',
        label: 'פרימיום ונוחות גבוהה',
        description: 'מלונות 4-5 כוכבים מובילים, מסעדות שף מומלצות, חדרים משודרגים ונוחות מקסימלית.',
        icon: 'sparkles',
      },
      {
        id: 'luxury',
        label: 'יוקרה ללא פשרות',
        description: 'מלונות בוטיק יוקרתיים וריזורטים ברמה בינלאומית, חוויות פרטיות ושירות VIP.',
        icon: 'crown',
      },
    ],
  },
  {
    id: 'dealBreakers',
    stepNumber: 4,
    title: 'אילו דברים חשוב לך להימנע מהם?',
    subtitle: 'קווים אדומים שיכולים להרוס לך את ההנאה מהחופשה',
    type: 'multi',
    options: [
      {
        id: 'long_drives',
        label: 'נסיעות ארוכות ומעברים מרובים בין מלונות',
        description: 'מעדיפים בסיס אחד יציב בלי לבלות שעות ארוכות בכבישים',
        icon: 'car-off',
      },
      {
        id: 'crowds',
        label: 'מקומות המוניים, צפופים ותורים ארוכים',
        description: 'מעדיפים פינות רגועות יותר ופחות מוקדי תיירות המוניים',
        icon: 'users-round',
      },
      {
        id: 'cold_weather',
        label: 'מזג אוויר קר, גשום או אפרורי',
        description: 'רוצים שמש, אור יום נעים וטמפרטורות נוחות לבילוי בחוץ',
        icon: 'cloud-rain',
      },
      {
        id: 'heavy_effort',
        label: 'ספורט אתגרי או מאמץ פיזי כבד',
        description: 'ללא טיפוסים קשים, טרקים מפרכים או פעילויות הדורשות כושר גבוה',
        icon: 'shield-alert',
      },
      {
        id: 'layovers',
        label: 'טיסות עם עצירות ביניים ממושכות (קונקשן)',
        description: 'עדיפות מוחלטת לטיסות ישירות ומהירות בלבד',
        icon: 'plane',
      },
      {
        id: 'kosher_diet',
        label: 'מגבלות כשרות או תזונה ספציפית',
        description: 'צורך בנגישות למסעדות כשרות, צמחוניות, טבעוניות או ללא גלוטן',
        icon: 'heart',
      },
    ],
  },
  {
    id: 'accommodationStyle',
    stepNumber: 5,
    title: 'איזה סוג מקום לינה עושה לך טוב?',
    subtitle: 'איפה הכי כיף לך לפתוח ולסיים את היום בטיול?',
    type: 'single',
    options: [
      {
        id: 'boutique',
        label: 'מלון בוטיק מלא אופי בלב העיר',
        description: 'עיצוב ייחודי, קרבה ברגל לבתי קפה, גלריות וסמטאות ציוריות.',
        icon: 'building-2',
      },
      {
        id: 'nature_cabin',
        label: 'צימר, בקתה או שאלה בחיק הטבע',
        description: 'נוף ירוק מהחלון, שקט מוחלט, מרפסת מול ההרים ואוויר צלול.',
        icon: 'home',
      },
      {
        id: 'resort',
        label: 'ריזורט מפנק עם בריכה וספא',
        description: 'כל הפינוקים במתחם אחד: בריכה, מתקני ספא, ארוחת בוקר עשירה.',
        icon: 'sun',
      },
      {
        id: 'apartment',
        label: 'דירת נופש מרווחת ומאובזרת',
        description: 'מטבח ביתי, סלון משותף, תחושה של מקומיים ונוחות למשפחה או קבוצה.',
        icon: 'key',
      },
    ],
  },
  {
    id: 'specialNotes',
    stepNumber: 6,
    title: 'האם יש יעד מסוים, אילוץ בריאותי או חלום אישי?',
    subtitle: 'שאלה אופציונלית — כאן אפשר לשתף בכל פרט נוסף שיעזור לנו לדייק עבורך',
    type: 'text',
    isOptional: true,
    placeholder: 'למשל: אנחנו עם עגלת תינוק, רוצים יעד עם מים חמים, או חולמים להגיע ליפן יום אחד...',
  },
];
