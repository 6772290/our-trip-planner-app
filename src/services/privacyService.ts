import { UserProfile, ContactPerson, PreferenceItem, PreferenceShareScope } from '../types/experience';

/**
 * Privacy Service:
 * Centralized authority for filtering, isolating, and sanitizing user data across audiences.
 * 
 * Rules:
 * 1. 'private' preferences are NEVER shared under any circumstances.
 * 2. 'partner_only' preferences are ONLY shared when targetAudience is 'partner'.
 * 3. 'group' preferences are shared with partner and group, but not public.
 * 4. 'public' preferences can be shared anywhere.
 * 5. Estimates (provenance === 'estimate' or 'partner_estimate') are preserved as estimates, never converted to verified facts.
 * 6. Contact private affinity ('interestInActivitiesTogether') and 'privateNotes' are strictly stripped when sanitizing for sharing.
 */

export function prepareSharedPreferences(
  profile: UserProfile,
  targetAudience: 'partner' | 'group' | 'public'
): PreferenceItem[] {
  if (!profile || !profile.preferences) {
    return [];
  }

  return profile.preferences.filter((pref) => {
    // 1. Private is NEVER shared
    if (pref.scope === 'private') {
      return false;
    }

    // 2. Partner only is only for partner
    if (pref.scope === 'partner_only') {
      return targetAudience === 'partner';
    }

    // 3. Group preferences are shared with partner and group
    if (pref.scope === 'group') {
      return targetAudience === 'partner' || targetAudience === 'group';
    }

    // 4. Public preferences can be shared with anyone
    if (pref.scope === 'public') {
      return true;
    }

    return false;
  });
}

export interface SharedContactView {
  id: string;
  name: string;
  relationship: string;
  permanentHome?: string;
  estimatedPreferences: string[];
  confirmedPreferences?: string[];
}

/**
 * Sanitizes a contact person for sharing with other travelers or group members.
 * Strips out strictly private internal affinity ratings and private notes.
 */
export function sanitizeContactForSharing(contact: ContactPerson): SharedContactView {
  return {
    id: contact.id,
    name: contact.name,
    relationship: contact.relationship,
    permanentHome: contact.permanentHome,
    estimatedPreferences: [...(contact.estimatedPreferences || [])],
    confirmedPreferences: contact.confirmedPreferences ? [...contact.confirmedPreferences] : [],
  };
}
