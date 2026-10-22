import { ParticipantAnswers, TripRecommendation, ClarifyingQuestion, TripType, PlanningMethod } from '../types/trip';

export interface GroupInsight {
  type: 'harmony' | 'balance' | 'opportunity';
  title: string;
  description: string;
}

export function analyzeGroupAnswers(answersList: ParticipantAnswers[], tripType: TripType): GroupInsight[] {
  if (answersList.length === 0) return [];

  const insights: GroupInsight[] = [];

  // Single participant insights
  if (answersList.length === 1) {
    const a = answersList[0];
    const interestCount = a.interests.length;

    if (interestCount >= 3) {
      insights.push({
        type: 'harmony',
        title: 'תחומי עניין עשירים ומגוונים',
        description: 'בחרת שילוב רחב של חוויות. כדי שהטיול לא ירגיש מפוזר, ההמלצות שלנו יתמקדו ביעדים שמאפשרים מעבר טבעי וקצר בין טבע, אוכל ותרבות.',
      });
    }

    if (a.pace === 'relaxed') {
      insights.push({
        type: 'balance',
        title: 'דגש על קצב רגוע ומנוחה',
        description: 'חשוב לך לא להעמיס. נתמקד במבנה טיול של "כוכב" עם בסיס אחד יציב וזמן פנוי נדיב בכל יום.',
      });
    } else if (a.pace === 'intense') {
      insights.push({
        type: 'balance',
        title: 'קצב דינמי עם הספק גבוה',
        description: 'רצון להספיק כמה שיותר. ההמלצות יכללו מסלולים מגוונים שממצים כל יום במלואו.',
      });
    }

    if (a.dealBreakers.includes('long_drives')) {
      insights.push({
        type: 'opportunity',
        title: 'מינימום נסיעות',
        description: 'סומן הימנעות מנסיעות ארוכות — כל היעדים המומלצים מאופיינים ברדיוס נסיעה קצרצר או רכבות נוחות.',
      });
    }

    return insights;
  }

  // Multi-participant analysis (couple, family, friends)
  const interestFrequencies: Record<string, number> = {};
  answersList.forEach((ans) => {
    ans.interests.forEach((item) => {
      interestFrequencies[item] = (interestFrequencies[item] || 0) + 1;
    });
  });

  const fullAgreementInterests = Object.entries(interestFrequencies)
    .filter(([_, count]) => count === answersList.length)
    .map(([key]) => key);

  const interestNameMap: Record<string, string> = {
    nature: 'טבע ונופים',
    culture: 'תרבות וערים',
    food: 'קולינריה ושווקים',
    beach_relax: 'חופים ומנוחה',
    attractions: 'אטרקציות ופארקים',
    nightlife: 'חיי לילה ומוזיקה',
  };

  if (fullAgreementInterests.length > 0) {
    const names = fullAgreementInterests.map((k) => interestNameMap[k] || k).join(', ');
    insights.push({
      type: 'harmony',
      title: `הסכמה מושלמת על תחומי העניין: ${names}`,
      description: 'כל המשתתפים בחרו באותם עוגנים מרכזיים. זהו בסיס מצוין שסביבו ייבנה שלד הטיול ללא פשרות.',
    });
  } else {
    insights.push({
      type: 'balance',
      title: 'שילוב תחומי עניין שונים בקבוצה',
      description: 'ישנם הבדלים בהעדפות הפעילויות בין המשתתפים. המלצנו על יעדים מגוונים שמאפשרים לשלב בוקר בטבע עם אחר הצהריים עירוני וקולינרי.',
    });
  }

  // Pace check
  const paces = new Set(answersList.map((a) => a.pace));
  if (paces.size > 1) {
    insights.push({
      type: 'balance',
      title: 'איזון בקצב הטיול',
      description: 'חלק מהמשתתפים מעדיפים קצב רגוע יותר ואחרים מחפשים פעילות נמרצת. הפתרון המומלץ: ימי פעילות מרוכזים בבוקר וזמן חופשי לבחירה אישית בצהריים.',
    });
  } else {
    const paceText = answersList[0].pace === 'relaxed' ? 'רגוע' : answersList[0].pace === 'balanced' ? 'מאוזן' : 'עמוס ופעיל';
    insights.push({
      type: 'harmony',
      title: `קצב טיול אחיד (${paceText})`,
      description: 'כולכם מסונכרנים לגבי רמת האנרגיה בטיול, מה שמקל מאוד על חלוקת הימים.',
    });
  }

  // Deal breakers check
  const allDealBreakers = new Set<string>();
  answersList.forEach((a) => a.dealBreakers.forEach((d) => allDealBreakers.add(d)));
  if (allDealBreakers.size > 0) {
    insights.push({
      type: 'opportunity',
      title: `התחשבות ב-${allDealBreakers.size} קווים אדומים משותפים`,
      description: 'ההמלצות מסננות מראש מסלולים שעלולים לעייף או ליצור חיכוכים (כמו נסיעות מייגעות או צפיפות המונית).',
    });
  }

  return insights;
}

export function generateRecommendations(
  answersList: ParticipantAnswers[],
  tripType: TripType,
  planningMethod: PlanningMethod,
  userDestination?: string
): TripRecommendation[] {
  // Aggregate interests
  const interestCounts: Record<string, number> = {};
  answersList.forEach((a) => {
    a.interests.forEach((interest) => {
      interestCounts[interest] = (interestCounts[interest] || 0) + 1;
    });
  });

  const hasNature = (interestCounts['nature'] || 0) > 0;
  const hasCulture = (interestCounts['culture'] || 0) > 0;
  const hasFood = (interestCounts['food'] || 0) > 0;
  const hasRelax = (interestCounts['beach_relax'] || 0) > 0;
  const hasAttractions = (interestCounts['attractions'] || 0) > 0;
  const hasNightlife = (interestCounts['nightlife'] || 0) > 0;

  // Determine dominant budget & pace
  const primaryPace = answersList[0]?.pace || 'balanced';
  const paceLabel = primaryPace === 'relaxed' ? 'רגוע ומרווח' : primaryPace === 'intense' ? 'קצב נמרץ ומלא' : 'מאוזן וגמיש';

  const primaryBudget = answersList[0]?.budget || 'medium';
  const budgetLabel =
    primaryBudget === 'budget'
      ? 'חסכוני וערכי'
      : primaryBudget === 'premium'
      ? 'פרימיום איכותי'
      : primaryBudget === 'luxury'
      ? 'יוקרה מפנקת'
      : 'בינוני ומאוזן';

  // If user provided a specific destination
  if (userDestination && userDestination.trim().length > 0) {
    const dest = userDestination.trim();
    return [
      {
        id: 'rec_dest_1',
        title: `${dest} - המסלול הקלאסי והמאוזן`,
        subtitle: `התאמה מלאה ליעד שבחרת: שילוב מוקדי החובה עם פינות נסתרות`,
        tagline: 'חוויה מקיפה המשלבת את מיטב המאפיינים של היעד',
        category: 'מסלול כוכב מומלץ',
        matchScore: 96,
        whyItFits: [
          `מבוסס ישירות על היעד שביקשת (${dest}).`,
          `מותאם בדיוק לקצב ה-${paceLabel} שבחרתם, ללא לחץ מיותר.`,
          `שם דגש על ${hasFood ? 'קולינריה מקומית' : 'אתרי עניין בולטים'} ועל זמני שהות נוחים.`,
          'כולל לינה מרוכזת אחת כדי למנוע אריזות ומעברים מרובים.',
        ],
        highlights: [
          'סיור רגלי מודרך באזור ההיסטורי והשווקים התוססים',
          'יום טיול פנורמי מחוץ למרכז בנופים פתוחים',
          'ערב טעימות במסעדה מקומית אותנטית שאינה תיירותית',
          'חצי יום חופשי לחלוטין לשיטוט ספונטני וקניות',
        ],
        bestFor: tripType === 'family' ? 'משפחות שמחפשות ראש שקט' : 'זוגות ומטיילים שאוהבים עומק',
        suggestedDuration: '5-7 ימים',
        estimatedBudgetLabel: budgetLabel,
        paceLabel,
        themeColor: 'amber',
      },
      {
        id: 'rec_dest_2',
        title: `${dest} - הפוגה רגועה וקולינריה מעודנת`,
        subtitle: 'התמקדות בהנאות הקטנות, מלון בוטיק מובחר ואווירה מקומית',
        tagline: 'פחות ריצות, יותר חוויות עמוקות ומנוחה איכותית',
        category: 'חווית עומק ורוגע',
        matchScore: 92,
        whyItFits: [
          'מאפשר ליהנות מהיעד בקצב נינוח ומבלי להרגיש צורך לסמן וי על כל מוזיאון.',
          'מענה מעולה להימנעות מנסיעות ממושכות ותורים צפופים.',
          'שילוב בתי קפה שכונתיים, שווקי בוקר ואירוח ברמה גבוהה.',
        ],
        highlights: [
          'לינה ברובע ציורי ונגיש עם אופי ייחודי',
          'סדנת טעימות או בישול פרטית עם שף מקומי',
          'זמן נינוח בפארקים ירוקים וגדות המים',
          'חיי לילה רגועים של יין, מוזיקה אקוסטית ושיחות נעימות',
        ],
        bestFor: 'מי שמעריך אוכל טוב, עיצוב וקצב פחות עמוס',
        suggestedDuration: '4-6 ימים',
        estimatedBudgetLabel: budgetLabel,
        paceLabel: 'רגוע ושליו',
        themeColor: 'emerald',
      },
      {
        id: 'rec_dest_3',
        title: `${dest} וסביבתו - טבע ואטרקציות במרחק נגיעה`,
        subtitle: 'שילוב המרכז האורבני עם טבע עוצר נשימה בנסיעה קצרה',
        tagline: 'הטוב מכל העולמות: עיר ונופים פתוחים',
        category: 'שילוב עיר וטבע',
        matchScore: 89,
        whyItFits: [
          'מעניק מענה לצורך במרחבים פתוחים לצד היתרונות של עיר גדולה.',
          'מתאים מאוד למי שאוהב לגוון את סוגי החוויות במהלך אותו הטיול.',
          'מסלולי יום קלים שאינם דורשים מאמץ פיזי כבד.',
        ],
        highlights: [
          'נסיעת רכבת קצרה או רכב ליום טיול בעיירות נוף ואגמים סמוכים',
          'נקודות תצפית פנורמיות עוצרות נשימה',
          'ארוחות צהריים כפריות בטבע',
          'חזרה לעיר בכל ערב לבילוי וארוחה מפנקת',
        ],
        bestFor: 'קבוצות ומשפחות שמחפשות גיוון ועניין לכולם',
        suggestedDuration: '6-8 ימים',
        estimatedBudgetLabel: budgetLabel,
        paceLabel: 'מאוזן ומגוון',
        themeColor: 'sky',
      },
    ];
  }

  // General recommendation sets based on user inputs
  const recommendations: TripRecommendation[] = [];

  // Rec 1: Nature & Scenic Comfort (e.g. Dolomites & Trentino / Slovenia)
  if (hasNature || (!hasCulture && !hasFood)) {
    recommendations.push({
      id: 'rec_nature_dolomites',
      title: 'הרי הדולומיטים ואגמי צפון איטליה',
      subtitle: 'טבע אלפיני דרמטי, אגמים צלולים ועיירות ציוריות עם קולינריה מעולה',
      tagline: 'שילוב אידיאלי של מרחבים ירוקים, לינה בבקתות עץ אלפיניות ואוכל משובח',
      category: 'טבע, נופים ורוגע',
      matchScore: hasNature && hasFood ? 97 : 93,
      whyItFits: [
        'מענה מדויק לבקשה לטבע ונופים עוצרי נשימה שמרחיבים את הלב.',
        'נסיעות קצרות בין מוקדי עניין ואפשרויות רבות לטיולי כוכב מרווחים.',
        'משלב את הקולינריה האיטלקית הנהדרת עם אוויר הרים צלול ומלונות ספא מפנקים.',
        'מתאים למסלולי הליכה קלים ונגישים ברכבלים ללא צורך במאמץ פיזי מפרך.',
      ],
      highlights: [
        'אגם בראיס (Braies) ואגם קארצה עם מי טורקיז מהפנטים',
        'עלייה ברכבל אל רמת אלפה די סיוסי (Alpe di Siusi) הפתוחה',
        'ערב טעימות יין וגבינות בטירה מקומית בחבל טרנטינו',
        'שקט אמיתי ומרפסות עץ המשקיפות לפסגות המשוננות',
      ],
      bestFor: tripType === 'family' ? 'משפחות שרוצות טבע בלי לחץ' : 'זוגות וחברים שרוצים לנשום אוויר צלול',
      suggestedDuration: '6-8 ימים',
      estimatedBudgetLabel: budgetLabel,
      paceLabel,
      themeColor: 'emerald',
    });
  }

  // Rec 2: Culture, Food & Charming Towns (e.g. Tuscany & Florence / Porto & Douro)
  if (hasCulture || hasFood || recommendations.length < 2) {
    recommendations.push({
      id: 'rec_tuscany_culture',
      title: 'טוסקנה ועמק קיאנטי, איטליה',
      subtitle: 'גבעות מוריקות, יקבים משפחתיים, סמטאות אבן ושווקי אוכל עשירים',
      tagline: 'המסע הקולינרי והתרבותי המושלם בקצב החיים הים-תיכוני הנינוח',
      category: 'קולינריה, אמנות וכפרים',
      matchScore: hasFood && hasCulture ? 98 : 91,
      whyItFits: [
        'קליעה מושלמת לחובבי אוכל טוב, יין איכותי ושווקים מקומיים.',
        'עיירות עתיקות שמספקות תרבות והיסטוריה מרתקת ללא צורך לרוץ.',
        'לינה באחוזה כפרית (Agriturismo) מרווחת המאפשרת התנתקות אמיתית.',
        'מרחקי נסיעה קצרים בין כפר לכפר וקצב אישי גמיש לחלוטין.',
      ],
      highlights: [
        'סיור שווקים וטעימות שמן זית, כמהין ופסטה טרייה בסן ג׳ימיניאנו',
        'שקיעה מרהיבה עם כוס יין מול כרמי עמק האורצ׳יה',
        'יום תרבות נינוח בפירנצה או סיינה עם ביקור בגלריות נבחרות',
        'זמן איכות ליד בריכת האחוזה אחר הצהריים',
      ],
      bestFor: tripType === 'couple' ? 'חופשה רומנטית בלתי נשכחת' : 'חברים ומשפחות שמקדשים אוכל ואווירה',
      suggestedDuration: '5-7 ימים',
      estimatedBudgetLabel: budgetLabel,
      paceLabel: primaryPace === 'intense' ? 'מאוזן ומגוון' : 'רגוע ושליו',
      themeColor: 'amber',
    });
  }

  // Rec 3: Coast, Relax & Pure Indulgence (e.g. Crete Boutique / French Riviera)
  if (hasRelax || recommendations.length < 3) {
    recommendations.push({
      id: 'rec_crete_coastal',
      title: 'חופים שלווים ומלונות בוטיק בכרתים המערבית',
      subtitle: 'מפרצי טורקיז נסתרים, טברנות אותנטיות על המים ומנוחה אמיתית',
      tagline: 'פינוק ים-תיכוני אמיתי ללא עומס התיירות ההמוני',
      category: 'חופים, שלווה ופינוקים',
      matchScore: hasRelax ? 96 : 88,
      whyItFits: [
        'מענה מלא לרצון במנוחה, שמש נעימה וטעינת מצברים.',
        'טיסה ישירה קצרה ונוחה ללא עצירות ביניים מתישות.',
        'מלונות בוטיק וריזורטים עם בריכות אינסוף ושירות אישי חם.',
        'אוכל יווני טרי ובריא המבוסס על שמן זית מקומי, דגים וירקות.',
      ],
      highlights: [
        'שייט פרטי למפרץ בלואוס ומים צלולים לשחייה ושנורקלינג',
        'שיטוט ערב בסמטאות הנמל הוונציאני של חאניה',
        'ארוחת ערב רגועה בטברנה מקומית מול השקיעה',
        'יום ספא ומנוחה מוחלטת בריזורט מול הים',
      ],
      bestFor: 'מי שזקוק לחופשת מנוחה ופינוק אמיתית ללא לחץ',
      suggestedDuration: '4-6 ימים',
      estimatedBudgetLabel: budgetLabel,
      paceLabel: 'רגוע ושליו',
      themeColor: 'sky',
    });
  }

  // Rec 4: Family attractions / Central Europe if family or attractions were selected
  if ((hasAttractions || tripType === 'family') && recommendations.length < 4) {
    recommendations.push({
      id: 'rec_black_forest',
      title: 'היער השחור ודרך האגדות, גרמניה וצרפת',
      subtitle: 'פארקי שעשועים עולמיים, מרחצאות חמים, אגמים ומגלשות הרים',
      tagline: 'גן עדן למשפחות וקבוצות שמשלב אקשן, טבע ואטרקציות ברמה הגבוהה ביותר',
      category: 'אטרקציות, משפחה וטבע',
      matchScore: 95,
      whyItFits: [
        'מתאים במיוחד למשפחות ולקבוצות שמחפשות פעילויות סוחפות לכל הגילאים.',
        'תשתיות תיירות מעולות, כרטיס אטרקציות מקומי מוזל וסדר מופתי.',
        'שילוב מאוזן בין ימי כיף בפארקים מובילים לבין ימי טבע רגועים באגמים.',
      ],
      highlights: [
        'יום מלא ב"פארק אירופה" הנחשב לאחד הטובים בעולם',
        'רכבל ומגלשות הרים בטודנאו ביער השחור',
        'שייט בסירות פדלים באגם טיטיזה וארוחה על קו המים',
        'ביקור בעיירה הציורית קולמר (חבל אלזס הסמוך)',
      ],
      bestFor: 'משפחות וצעירים ברוחם שאוהבים לחוות ולזוז',
      suggestedDuration: '7-9 ימים',
      estimatedBudgetLabel: budgetLabel,
      paceLabel: 'מאוזן ומגוון',
      themeColor: 'indigo',
    });
  }

  return recommendations.slice(0, 3);
}

export function generateClarifyingQuestions(
  answersList: ParticipantAnswers[],
  tripType: TripType
): ClarifyingQuestion[] {
  const ans = answersList[0];
  const questions: ClarifyingQuestion[] = [];

  // Question 1: Trade-off between depth vs. variety
  questions.push({
    id: 'clarify_star_vs_roadtrip',
    question: 'איך עדיף לתכנן את מקומות הלינה בטיול שלכם?',
    explanation: 'עוזר לקבוע האם נבחר מלון אחד מרכזי שממנו יוצאים מדי יום (כוכב), או נעבור בין 2-3 מקומות לינה.',
    options: [
      {
        label: 'מלון אחד מרכזי לאורך כל הטיול (טיול כוכב)',
        impactDescription: 'פורקים מזוודות פעם אחת בלבד, מקסימום שקט נפשי ויציבות.',
      },
      {
        label: 'מעבר בין 2 מקומות לינה שונים (שילוב עיר וכפר)',
        impactDescription: 'מאפשר לחוות שני סגנונות שונים של היעד ללא יותר מדי אריזות.',
      },
      {
        label: 'טיול מתגלגל עם לינה במקומות שונים',
        impactDescription: 'כיסוי של שטח רחב יותר והספק מקסימלי של אתרים.',
      },
    ],
  });

  // Question 2: Nature vs. Urban immersion
  questions.push({
    id: 'clarify_nature_vs_city',
    question: 'מה יותר חשוב לכם ברגע האמת — טבע פתוח או אווירה עירונית?',
    explanation: 'גם אם בחרתם בשניהם, מה הדבר שאם תפספסו תרגישו שהטיול לא מיצה את עצמו?',
    options: [
      {
        label: 'טבע, נופים ומרחבים ירוקים הם הלב של הטיול',
        impactDescription: 'נקצה 70% מהזמן לשמורות טבע, אגמים ומסלולים נעימים.',
      },
      {
        label: 'סמטאות, שווקים, בתי קפה ותרבות עירונית',
        impactDescription: 'נתמקד במרכזים חיים, מסעדות מקומיות וגלריות מעוררות השראה.',
      },
      {
        label: 'חלוקה שווה ומדויקת חצי-חצי',
        impactDescription: 'בוקר בטבע ובצהריים מעבר אל עיירה או עיר ציורית.',
      },
    ],
  });

  // Question 3: Spontaneity vs Structured schedule
  questions.push({
    id: 'clarify_structure',
    question: 'איך הייתם מעדיפים לתכנן את סדר היום?',
    explanation: 'יעזור לנו לחלק את הזמן בהמלצות המפורטות שנוסיף בהמשך.',
    options: [
      {
        label: 'תוכנית עוגנים בסיסית, והרבה זמן ספונטני לפי החשק',
        impactDescription: 'מזמינים רק כרטיס או ארוחה אחת ביום, ומשאירים חופש מלא.',
      },
      {
        label: 'מסלול מפורט ומסודר מראש כדי לא לבזבז זמן',
        impactDescription: 'המלצות מדויקות לפי שעות, כולל הזמנת מקומות מראש לאתרים המבוקשים.',
      },
    ],
  });

  return questions;
}
