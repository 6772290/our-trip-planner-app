import {
  ExperiencePlan,
  ExperiencePlanType,
  PlanParticipant,
  PlanLocations,
  PlanDates,
  PlanDietaryRequirements,
  PlanCulinaryPreferences,
  PlanBudget,
  DietaryRestrictionType,
} from '../types/experiencePlan';
import {
  ParsedRequestResult,
  UserProfile,
  ContactPerson,
  ConstraintItem,
} from '../types/experience';
import { extractConstraintsAndWindows } from '../engine/constraintEngine';
import { analyzeContextualLocations, resolveNormalizedCity } from './locationResolver';

/**
 * Creates a complete, unified ExperiencePlan from the parsed result and user context.
 * Guarantees zero data loss when transitioning from the understanding engine to the planning workspace.
 */
export function createPlanFromParsedResult(
  parsed: ParsedRequestResult,
  userProfile?: UserProfile,
  contacts: ContactPerson[] = []
): ExperiencePlan {
  const planType: ExperiencePlanType = parsed.planType || 'local_outing';
  const now = new Date().toISOString();

  // 1. Build Participants
  const participants: PlanParticipant[] = [
    {
      id: userProfile?.id || 'self',
      name: userProfile?.fullName || 'אני',
      role: 'self',
      isConfirmed: true,
      notes: 'משתמש ראשי',
    },
  ];

  if (parsed.audienceType === 'couple' || parsed.participantsMentioned.includes('בת/בן זוג')) {
    const partnerContact = contacts.find((c) => c.relationship.includes('זוג') || c.relationship.includes('אישה') || c.relationship.includes('בעל'));
    participants.push({
      id: partnerContact?.id || 'part_partner',
      name: partnerContact?.name || 'בן/בת זוג',
      role: 'partner',
      isConfirmed: true,
      notes: partnerContact ? 'מתוך אנשי הקשר' : 'צוין בבקשה',
    });
  }

  for (const p of parsed.participantsMentioned) {
    if (p.includes('בן') || p.includes('ילד')) {
      if (!participants.some((x) => x.role === 'child')) {
        participants.push({
          id: `part_child_${Date.now()}`,
          name: p,
          role: 'child',
          isConfirmed: true,
        });
      }
    } else if (p.includes('חבר') || p.includes('קבוצה')) {
      if (!participants.some((x) => x.role === 'friend')) {
        participants.push({
          id: `part_friend_${Date.now()}`,
          name: p,
          role: 'friend',
          isConfirmed: true,
        });
      }
    }
  }

  // 2. Build Locations
  const planLocations: PlanLocations = {
    permanentHome: userProfile?.permanentHomeLocation
      ? {
          value: userProfile.permanentHomeLocation,
          source: 'profile_confirmed',
          certainty: userProfile.isDemo ? 'inferred_provisional' : 'profile_confirmed',
          isConfirmed: !userProfile.isDemo,
        }
      : undefined,
    departureLocation: parsed.locations.activityDepartureLocation
      ? {
          value: parsed.locations.activityDepartureLocation,
          source: 'prompt_explicit',
          certainty: 'explicit',
          isConfirmed: true,
        }
      : undefined,
    destinationLocation: parsed.locations.destinationLocation
      ? {
          value: parsed.locations.destinationLocation,
          source: 'prompt_explicit',
          certainty: 'explicit',
          isConfirmed: true,
        }
      : undefined,
    otherParticipantsLocations: [],
    transportMode: {
      value: parsed.locations.transportMode,
      source: 'inferred',
      certainty: 'explicit',
      isConfirmed: false,
    },
    isFlightRequired: parsed.isFlightImplied,
  };

  // Check for other participant locations in extracted facts
  const otherLocFact = parsed.extractedFacts.find((f) => f.key === 'other_participant_location');
  if (otherLocFact) {
    planLocations.otherParticipantsLocations.push({
      participantNameOrRole: otherLocFact.labelHe.replace('מיקום של ', ''),
      location: otherLocFact.value,
      contextNote: otherLocFact.sourceNoteHe,
    });
  }

  // 3. Build Dates
  let dateMode: PlanDates['mode'] = 'open_flexible';
  if (parsed.timeWindows.length > 1) {
    dateMode = 'alternative_windows';
  } else if (parsed.timeWindows.length === 1 && parsed.timeWindows[0].startDate && parsed.timeWindows[0].endDate) {
    dateMode = 'date_range';
  } else if (parsed.rawText.includes('הערב') || parsed.rawText.includes('היום')) {
    dateMode = 'single_date';
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  const planDates: PlanDates = {
    mode: dateMode,
    specificDate: parsed.rawText.includes('הערב') || parsed.rawText.includes('היום')
      ? {
          value: todayStr,
          source: 'prompt_explicit',
          certainty: 'explicit',
          isConfirmed: true,
        }
      : undefined,
    timeOfDay: parsed.rawText.includes('הערב')
      ? {
          value: 'evening',
          source: 'prompt_explicit',
          certainty: 'explicit',
          isConfirmed: true,
        }
      : undefined,
    timeWindows: parsed.timeWindows,
    naturalDateText: parsed.rawText,
  };

  // 4. Build Dietary Requirements (Separated from cuisines)
  const dietaryRestrictions: DietaryRestrictionType[] = [];
  let allergyNote: string | undefined = undefined;

  // Check from profile preferences if user has confirmed dietary preferences
  if (userProfile?.preferences) {
    for (const pref of userProfile.preferences) {
      if (pref.category === 'dietary') {
        const val = pref.label.toLowerCase();
        if (val.includes('מהדרין')) dietaryRestrictions.push('kosher_mehadrin');
        else if (val.includes('כשר')) dietaryRestrictions.push('kosher');
        else if (val.includes('טבעוני')) dietaryRestrictions.push('vegan');
        else if (val.includes('צמחוני')) dietaryRestrictions.push('vegetarian');
        else if (val.includes('ללא גלוטן') || val.includes('צליאק')) dietaryRestrictions.push('gluten_free');
      }
    }
  }

  // Check from prompt constraints
  for (const c of parsed.constraints) {
    if (c.type === 'dietary_kosher') {
      if (c.subtype === 'kosher_mehadrin' && !dietaryRestrictions.includes('kosher_mehadrin')) {
        dietaryRestrictions.push('kosher_mehadrin');
      } else if (!dietaryRestrictions.includes('kosher') && !dietaryRestrictions.includes('kosher_mehadrin')) {
        dietaryRestrictions.push('kosher');
      }

      if (c.subtype === 'allergy_safety') {
        if (!dietaryRestrictions.includes('allergies')) dietaryRestrictions.push('allergies');
        allergyNote = c.descriptionHe;
      }
    }
  }

  if (dietaryRestrictions.length === 0) {
    dietaryRestrictions.push('none');
  }

  const planDietary: PlanDietaryRequirements = {
    restrictions: Array.from(new Set(dietaryRestrictions)),
    allergyDetails: allergyNote,
    isConfirmed: dietaryRestrictions.length > 0 && !dietaryRestrictions.includes('none'),
  };

  // 5. Build Culinary Cuisines (Separate from dietary)
  const cuisines: string[] = [];
  const textLower = parsed.rawText.toLowerCase();
  if (textLower.includes('סושי')) cuisines.push('סושי / אסייתי');
  if (textLower.includes('איטלקי') || textLower.includes('פיצה')) cuisines.push('איטלקי / פיצה');
  if (textLower.includes('בשר') || textLower.includes('בשרים')) cuisines.push('בשרים');
  if (textLower.includes('חלבי') && !textLower.includes('דגים')) cuisines.push('חלבי');
  if (textLower.includes('דגים')) cuisines.push('דגים');
  if (textLower.includes('יין')) cuisines.push('בר יין');

  const planCulinary: PlanCulinaryPreferences = {
    cuisines,
    atmosphere: parsed.rawText.includes('רגוע') ? 'quiet' : parsed.rawText.includes('רומנטי') ? 'romantic' : undefined,
    isConfirmed: cuisines.length > 0,
  };

  // 6. Build Budget
  const budgetMatch = parsed.rawText.match(/(?:עד\s*)?(\d{2,5})\s*(?:שקל|ש״ח|שח|₪|דולר|\$|אירו|יורו|€)/);
  let budgetAmount: number | undefined = undefined;
  let budgetCurrency: 'ILS' | 'USD' | 'EUR' = 'ILS';
  let budgetFlexibility: PlanBudget['flexibility'] = 'open';

  if (budgetMatch) {
    budgetAmount = parseInt(budgetMatch[1], 10);
    if (parsed.rawText.includes('דולר') || parsed.rawText.includes('$')) budgetCurrency = 'USD';
    else if (parsed.rawText.includes('אירו') || parsed.rawText.includes('יורו') || parsed.rawText.includes('€')) budgetCurrency = 'EUR';

    if (parsed.rawText.includes('אפשר לחרוג') || parsed.rawText.includes('גמיש') || parsed.rawText.includes('עדיף')) {
      budgetFlexibility = 'flexible_for_special';
    } else {
      budgetFlexibility = 'strict';
    }
  }

  const planBudget: PlanBudget = {
    amount: budgetAmount,
    currency: budgetCurrency,
    scope: 'total',
    flexibility: budgetFlexibility,
    isConfirmed: budgetAmount !== undefined,
  };

  // Title generation
  let title = parsed.rawText.slice(0, 35);
  if (parsed.unverifiedArtistSearchRequested) {
    title = `הופעה של ${parsed.unverifiedArtistSearchRequested}`;
  } else if (planType === 'culinary') {
    title = `בילוי קולינרי ${cuisines.join(', ')}`;
  } else if (planType === 'local_outing') {
    title = `בילוי מקומי ${parsed.locations.destinationLocation || ''}`.trim();
  }

  return {
    id: `plan_${Date.now()}`,
    type: planType,
    title,
    createdAt: now,
    updatedAt: now,
    audienceType: parsed.audienceType || 'solo',
    participants,
    locations: planLocations,
    dates: planDates,
    dietary: planDietary,
    culinary: planCulinary,
    budget: planBudget,
    constraints: parsed.constraints,
    vibeAndAtmosphere: parsed.rawText.includes('רגוע') ? ['רגוע'] : [],
    eventDetails: parsed.unverifiedArtistSearchRequested
      ? { artistOrShowName: parsed.unverifiedArtistSearchRequested }
      : undefined,
    vacationDetails: planType.startsWith('vacation')
      ? { needsFlight: parsed.isFlightImplied }
      : undefined,
    status: 'planning',
    rawPromptOrigin: parsed.rawText,
  };
}

/**
 * Natural language update handlers for individual rubrics.
 * Each function extracts details from a localized free-text sentence and updates
 * the EXACT SAME ExperiencePlan model without wiping other rubrics.
 */

export function updateDatesFromNaturalText(
  plan: ExperiencePlan,
  naturalText: string
): { updatedPlan: ExperiencePlan; success: boolean; explanation: string } {
  const text = naturalText.trim();
  if (!text) return { updatedPlan: plan, success: false, explanation: 'לא הוזן טקסט' };

  const { constraints: newConstraints, timeWindows: newWindows } = extractConstraintsAndWindows(text);

  const updatedDates: PlanDates = {
    ...plan.dates,
    naturalDateText: text,
  };

  if (newWindows.length > 1) {
    updatedDates.mode = 'alternative_windows';
    updatedDates.timeWindows = newWindows;
  } else if (newWindows.length === 1) {
    if (newWindows[0].durationDaysMin) {
      updatedDates.durationDaysMin = {
        value: newWindows[0].durationDaysMin,
        source: 'rubric_input',
        certainty: 'explicit',
        isConfirmed: true,
      };
    }
  }

  if (text.includes('הערב') || text.includes('היום')) {
    updatedDates.mode = 'single_date';
    updatedDates.specificDate = {
      value: new Date().toISOString().slice(0, 10),
      source: 'rubric_input',
      certainty: 'explicit',
      isConfirmed: true,
    };
    if (text.includes('הערב')) {
      updatedDates.timeOfDay = {
        value: 'evening',
        source: 'rubric_input',
        certainty: 'explicit',
        isConfirmed: true,
      };
    }
  }

  // Merge Shabbat/date constraints without overwriting unrelated constraints
  const nonDateConstraints = plan.constraints.filter((c) => c.type !== 'timeframe' && c.type !== 'shabbat_holiday');
  const mergedConstraints = [...nonDateConstraints, ...newConstraints];

  return {
    updatedPlan: {
      ...plan,
      dates: updatedDates,
      constraints: mergedConstraints,
      updatedAt: new Date().toISOString(),
    },
    success: true,
    explanation: 'רובריקת התאריכים עודכנה מתוך הטקסט החופשי',
  };
}

export function updateParticipantsFromNaturalText(
  plan: ExperiencePlan,
  naturalText: string
): { updatedPlan: ExperiencePlan; success: boolean; explanation: string } {
  const text = naturalText.trim();
  if (!text) return { updatedPlan: plan, success: false, explanation: 'לא הוזן טקסט' };

  const newParticipants: PlanParticipant[] = [
    plan.participants.find((p) => p.role === 'self') || {
      id: 'self',
      name: 'אני',
      role: 'self',
      isConfirmed: true,
    },
  ];

  if (text.includes('אשתי') || text.includes('בעלי') || text.includes('זוג')) {
    newParticipants.push({
      id: `p_partner_${Date.now()}`,
      name: text.includes('אשתי') ? 'אשתי' : text.includes('בעלי') ? 'בעלי' : 'בן/בת זוג',
      role: 'partner',
      isConfirmed: true,
    });
  }

  if (text.includes('הבן שלי') || text.includes('הבן')) {
    newParticipants.push({
      id: `p_son_${Date.now()}`,
      name: 'הבן שלי',
      role: 'child',
      isConfirmed: true,
    });
  } else if (text.includes('הבת שלי') || text.includes('הבת')) {
    newParticipants.push({
      id: `p_daughter_${Date.now()}`,
      name: 'הבת שלי',
      role: 'child',
      isConfirmed: true,
    });
  }

  if (text.includes('חברים') || text.includes('זוג חברים')) {
    newParticipants.push({
      id: `p_friends_${Date.now()}`,
      name: text.includes('זוג חברים') ? 'זוג חברים' : 'חברים',
      role: 'friend',
      isConfirmed: true,
    });
  }

  return {
    updatedPlan: {
      ...plan,
      participants: newParticipants,
      updatedAt: new Date().toISOString(),
    },
    success: true,
    explanation: `רובריקת המשתתפים עודכנה: ${newParticipants.map((p) => p.name).join(', ')}`,
  };
}

export function updateLocationsFromNaturalText(
  plan: ExperiencePlan,
  naturalText: string
): { updatedPlan: ExperiencePlan; success: boolean; explanation: string } {
  const text = naturalText.trim();
  if (!text) return { updatedPlan: plan, success: false, explanation: 'לא הוזן טקסט' };

  const locAnalysis = analyzeContextualLocations(text);
  const updatedLocations: PlanLocations = { ...plan.locations };

  if (locAnalysis.otherParticipantLocation) {
    const info = locAnalysis.otherParticipantLocation;
    updatedLocations.otherParticipantsLocations = [
      ...updatedLocations.otherParticipantsLocations.filter((o) => o.participantNameOrRole !== info.participantRole),
      {
        participantNameOrRole: info.participantRole,
        location: info.city.canonicalNameHe,
        contextNote: info.contextDescriptionHe,
      },
    ];
  }

  if (locAnalysis.explicitDestinationCity) {
    updatedLocations.destinationLocation = {
      value: locAnalysis.explicitDestinationCity.canonicalNameHe,
      source: 'rubric_input',
      certainty: 'explicit',
      isConfirmed: true,
    };
  }

  if (locAnalysis.explicitDepartureCity) {
    updatedLocations.departureLocation = {
      value: locAnalysis.explicitDepartureCity.canonicalNameHe,
      source: 'rubric_input',
      certainty: 'explicit',
      isConfirmed: true,
    };
  }

  if (locAnalysis.meetingPointCity) {
    updatedLocations.meetingPoint = {
      value: locAnalysis.meetingPointCity.canonicalNameHe,
      source: 'rubric_input',
      certainty: 'explicit',
      isConfirmed: true,
    };
  }

  return {
    updatedPlan: {
      ...plan,
      locations: updatedLocations,
      updatedAt: new Date().toISOString(),
    },
    success: true,
    explanation: 'רובריקת המיקומים עודכנה מתוך הטקסט החופשי',
  };
}

export function updateBudgetFromNaturalText(
  plan: ExperiencePlan,
  naturalText: string
): { updatedPlan: ExperiencePlan; success: boolean; explanation: string } {
  const text = naturalText.trim();
  if (!text) return { updatedPlan: plan, success: false, explanation: 'לא הוזן טקסט' };

  const match = text.match(/(\d{2,6})\s*(?:שקל|ש״ח|שח|₪|דולר|\$|אירו|יורו|€)?/);
  if (!match) {
    return { updatedPlan: plan, success: false, explanation: 'לא זוהה סכום תקציב בטקסט' };
  }

  const amount = parseInt(match[1], 10);
  let currency: 'ILS' | 'USD' | 'EUR' = 'ILS';
  if (text.includes('דולר') || text.includes('$')) currency = 'USD';
  else if (text.includes('אירו') || text.includes('יורו') || text.includes('€')) currency = 'EUR';

  let flexibility: PlanBudget['flexibility'] = 'strict';
  if (text.includes('אפשר לחרוג') || text.includes('עדיף עד') || text.includes('גמיש') || text.includes('משהו מיוחד')) {
    flexibility = 'flexible_for_special';
  }

  const updatedBudget: PlanBudget = {
    amount,
    currency,
    scope: text.includes('לאדם') || text.includes('לנפש') ? 'per_person' : 'total',
    flexibility,
    isConfirmed: true,
    notes: text,
  };

  return {
    updatedPlan: {
      ...plan,
      budget: updatedBudget,
      updatedAt: new Date().toISOString(),
    },
    success: true,
    explanation: `התקציב עודכן: ${amount} ${currency === 'ILS' ? '₪' : currency} (${flexibility === 'flexible_for_special' ? 'גמיש לחריגה' : 'מדויק'})`,
  };
}

export function updatePreferencesFromNaturalText(
  plan: ExperiencePlan,
  naturalText: string
): { updatedPlan: ExperiencePlan; success: boolean; explanation: string } {
  const text = naturalText.trim();
  if (!text) return { updatedPlan: plan, success: false, explanation: 'לא הוזן טקסט' };

  // 1. Dietary updates
  const newDietaryRestrictions: DietaryRestrictionType[] = [...plan.dietary.restrictions.filter((r) => r !== 'none')];
  let newAllergyNote = plan.dietary.allergyDetails;

  if (text.includes('מהדרין')) {
    if (!newDietaryRestrictions.includes('kosher_mehadrin')) newDietaryRestrictions.push('kosher_mehadrin');
  } else if (text.includes('כשר')) {
    if (!newDietaryRestrictions.includes('kosher') && !newDietaryRestrictions.includes('kosher_mehadrin')) {
      newDietaryRestrictions.push('kosher');
    }
  }

  if (text.includes('טבעוני')) {
    if (!newDietaryRestrictions.includes('vegan')) newDietaryRestrictions.push('vegan');
  }
  if (text.includes('צמחוני')) {
    if (!newDietaryRestrictions.includes('vegetarian')) newDietaryRestrictions.push('vegetarian');
  }

  if (text.includes('אלרג') || text.includes('רגישות') || text.includes('צליאק') || text.includes('ללא גלוטן')) {
    if (!newDietaryRestrictions.includes('allergies')) newDietaryRestrictions.push('allergies');
    newAllergyNote = text;
  }

  // 2. Culinary cuisines updates (SEPARATE from kashrut! Choosing sushi DOES NOT erase kosher)
  const newCuisines = [...plan.culinary.cuisines];
  if (text.includes('סושי') && !newCuisines.some((c) => c.includes('סושי'))) newCuisines.push('סושי / אסייתי');
  if (text.includes('איטלקי') && !newCuisines.some((c) => c.includes('איטלקי'))) newCuisines.push('איטלקי');
  if (text.includes('פיצה') && !newCuisines.some((c) => c.includes('פיצה'))) newCuisines.push('פיצה');
  if (text.includes('בשר') && !newCuisines.some((c) => c.includes('בשר'))) newCuisines.push('בשרים');
  if (text.includes('דגים') && !newCuisines.some((c) => c.includes('דגים'))) newCuisines.push('דגים');
  if (text.includes('חלבי') && !newCuisines.some((c) => c.includes('חלבי'))) newCuisines.push('חלבי');

  // 3. Vibe updates
  const newVibe = [...plan.vibeAndAtmosphere];
  if (text.includes('רגוע') || text.includes('שקט') || text.includes('בלי הליכה ארוכה')) {
    if (!newVibe.includes('רגוע ושקט')) newVibe.push('רגוע ושקט');
  }
  if (text.includes('רומנטי')) {
    if (!newVibe.includes('רומנטי')) newVibe.push('רומנטי');
  }
  if (text.includes('תוסס') || text.includes('חי')) {
    if (!newVibe.includes('תוסס')) newVibe.push('תוסס');
  }

  // Add mobility constraint if requested "בלי הליכה ארוכה"
  const newConstraints = [...plan.constraints];
  if (text.includes('בלי הליכה ארוכה') || text.includes('ללא הליכה מרובה')) {
    if (!newConstraints.some((c) => c.type === 'mobility')) {
      newConstraints.push({
        id: `c_mobility_${Date.now()}`,
        type: 'mobility',
        descriptionHe: 'העדפה לפעילות מתונה ללא הליכה ארוכה ומאומצת',
        descriptionEn: 'Gentle activity preference with minimal walking',
        isHardConstraint: false,
        certainty: 'explicit',
        sourceText: text,
      });
    }
  }

  return {
    updatedPlan: {
      ...plan,
      dietary: {
        restrictions: newDietaryRestrictions.length > 0 ? newDietaryRestrictions : ['none'],
        allergyDetails: newAllergyNote,
        isConfirmed: newDietaryRestrictions.length > 0,
      },
      culinary: {
        ...plan.culinary,
        cuisines: newCuisines,
        isConfirmed: newCuisines.length > 0,
      },
      vibeAndAtmosphere: newVibe,
      constraints: newConstraints,
      updatedAt: new Date().toISOString(),
    },
    success: true,
    explanation: 'העדפות התזונה, המטבח והאווירה עודכנו בהצלחה',
  };
}
