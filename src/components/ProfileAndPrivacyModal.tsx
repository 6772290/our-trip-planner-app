import React, { useState } from 'react';
import {
  UserProfile,
  ContactPerson,
  PreferenceItem,
  ProvenanceType,
  PROVENANCE_DETAILS,
} from '../types/experience';
import {
  POLITE_DECLINE_TEMPLATES,
  getCustomizedDeclineMessage,
} from '../utils/privacyAndDecline';
import { useLanguage } from '../i18n/LanguageContext';
import {
  X,
  ShieldCheck,
  Lock,
  User,
  Users,
  BellOff,
  Copy,
  Check,
  MapPin,
  Sparkles,
  Info,
  ChevronDown,
} from 'lucide-react';

interface ProfileAndPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  contacts: ContactPerson[];
  onUpdateProfile: (updated: UserProfile) => void;
  onUpdateContacts: (updated: ContactPerson[]) => void;
}

export const ProfileAndPrivacyModal: React.FC<ProfileAndPrivacyModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  contacts,
  onUpdateProfile,
  onUpdateContacts,
}) => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'provenance' | 'contacts' | 'decline' | 'locations'>(
    'provenance'
  );

  // Decline generator state
  const [selectedContactForDecline, setSelectedContactForDecline] = useState<string>(
    contacts[0]?.name || ''
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('warm_direct');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleToggleProvenance = (prefId: string) => {
    const updatedPrefs = userProfile.preferences.map((p) => {
      if (p.id === prefId) {
        // Cycle or promote inferred -> confirmed
        const next: ProvenanceType =
          p.provenance === 'inferred' ? 'confirmed' : p.provenance === 'estimate' ? 'confirmed' : 'confirmed';
        return { ...p, provenance: next };
      }
      return p;
    });
    onUpdateProfile({ ...userProfile, preferences: updatedPrefs });
  };

  const handleUpdateContactAffinity = (
    contactId: string,
    affinity: 'yes' | 'maybe' | 'prefer_not'
  ) => {
    const updated = contacts.map((c) =>
      c.id === contactId ? { ...c, interestInActivitiesTogether: affinity } : c
    );
    onUpdateContacts(updated);
  };

  const handleCopyDeclineMessage = () => {
    const msg = getCustomizedDeclineMessage(
      selectedTemplateId,
      selectedContactForDecline,
      language === 'en' ? 'en' : 'he'
    );
    navigator.clipboard.writeText(msg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-800 text-white flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">
                {language === 'he'
                  ? 'מרכז העדפות, פרטיות ואימות נתונים'
                  : 'Preferences, Privacy & Data Provenance Center'}
              </h2>
              <p className="text-xs text-stone-500">
                {language === 'he'
                  ? 'שליטה מלאה במקורות המידע, הפרטיות החברתית ומערכת שקטה'
                  : 'Full control over information sources, social privacy, and quiet defaults'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-stone-200 bg-white px-6 gap-2 sm:gap-4 overflow-x-auto text-xs sm:text-sm font-semibold">
          <button
            onClick={() => setActiveTab('provenance')}
            className={`py-3 border-b-2 px-2 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'provenance'
                ? 'border-amber-800 text-amber-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            {language === 'he' ? 'אימות העדפות ומקור מידע' : 'Preferences & Provenance'}
          </button>

          <button
            onClick={() => setActiveTab('contacts')}
            className={`py-3 border-b-2 px-2 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'contacts'
                ? 'border-amber-800 text-amber-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            {language === 'he' ? 'אנשי קשר ופרטיות הדדית' : 'Contacts & Social Privacy'}
          </button>

          <button
            onClick={() => setActiveTab('decline')}
            className={`py-3 border-b-2 px-2 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'decline'
                ? 'border-amber-800 text-amber-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            {language === 'he' ? 'מחולל סירוב מנומס' : 'Polite Decline Generator'}
          </button>

          <button
            onClick={() => setActiveTab('locations')}
            className={`py-3 border-b-2 px-2 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'locations'
                ? 'border-amber-800 text-amber-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            {language === 'he' ? 'הפרדת מיקומי יציאה ומגורים' : 'Locations Separation'}
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          {/* TAB 1: Provenance */}
          {activeTab === 'provenance' && (
            <div className="space-y-5">
              {/* Educational banner on provenance */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-900">
                  <Info className="w-4 h-4 text-amber-800" />
                  <span>
                    {language === 'he'
                      ? 'הבחנה ברורה בין אישור משתמש, הערכה והסקה'
                      : 'Clear distinction between user confirmation, estimates, and inferences'}
                  </span>
                </div>
                <p className="text-stone-600 text-xs leading-relaxed">
                  {language === 'he'
                    ? 'המערכת אינה מניחה הנחות שווא. כל פריט מידע מסווג בצורה שקופה כדי לוודא שאינך מקבל המלצות המבוססות על מידע שגוי.'
                    : 'The system never invents facts. Every preference is transparently tracked to ensure you never receive recommendations based on false assumptions.'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                    <span className="font-bold text-emerald-800 block text-xs">
                      {language === 'he'
                        ? PROVENANCE_DETAILS.confirmed.labelHe
                        : PROVENANCE_DETAILS.confirmed.labelEn}
                    </span>
                    <span className="text-[11px] text-emerald-700">
                      {language === 'he'
                        ? PROVENANCE_DETAILS.confirmed.descriptionHe
                        : PROVENANCE_DETAILS.confirmed.descriptionEn}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200">
                    <span className="font-bold text-blue-800 block text-xs">
                      {language === 'he'
                        ? PROVENANCE_DETAILS.estimate.labelHe
                        : PROVENANCE_DETAILS.estimate.labelEn}
                    </span>
                    <span className="text-[11px] text-blue-700">
                      {language === 'he'
                        ? PROVENANCE_DETAILS.estimate.descriptionHe
                        : PROVENANCE_DETAILS.estimate.descriptionEn}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300">
                    <span className="font-bold text-amber-900 block text-xs">
                      {language === 'he'
                        ? PROVENANCE_DETAILS.inferred.labelHe
                        : PROVENANCE_DETAILS.inferred.labelEn}
                    </span>
                    <span className="text-[11px] text-amber-800">
                      {language === 'he'
                        ? PROVENANCE_DETAILS.inferred.descriptionHe
                        : PROVENANCE_DETAILS.inferred.descriptionEn}
                    </span>
                  </div>
                </div>
              </div>

              {/* Preferences List */}
              <div className="space-y-2">
                <h3 className="font-bold text-stone-900 text-sm">
                  {language === 'he' ? 'העדפות שמורות ומצב האימות שלהן:' : 'Saved Preferences & Validation Status:'}
                </h3>
                <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden bg-white">
                  {userProfile.preferences.map((pref) => {
                    const badge = PROVENANCE_DETAILS[pref.provenance];
                    return (
                      <div
                        key={pref.id}
                        className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-stone-50/60 transition-colors"
                      >
                        <div className="space-y-0.5">
                          <div className="font-semibold text-stone-900">{pref.label}</div>
                          {pref.notes && <div className="text-xs text-stone-500">{pref.notes}</div>}
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold border ${badge.colorClass}`}
                          >
                            {language === 'he' ? badge.labelHe : badge.labelEn}
                          </span>

                          {pref.provenance !== 'confirmed' && (
                            <button
                              type="button"
                              onClick={() => handleToggleProvenance(pref.id)}
                              className="px-2.5 py-1 text-xs font-bold bg-amber-800 text-white rounded-lg hover:bg-amber-900 cursor-pointer transition-colors"
                            >
                              {language === 'he' ? 'אישור סופי' : 'Verify as Confirmed'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quiet Default Principle */}
              <div className="p-4 rounded-2xl bg-stone-100 border border-stone-200 flex items-start gap-3">
                <BellOff className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-stone-900">
                    {language === 'he'
                      ? 'עקרון מערכת שקטה כברירת מחדל'
                      : 'Quiet System by Default Principle'}
                  </div>
                  <p className="text-xs text-stone-600">
                    {language === 'he'
                      ? 'המערכת לעולם אינה שולחת התראות יזומות, הצעות קופצות או הודעות דוחפות ללא בקשה מפורשת שלך. כל פעילות נפתחת אך ורק מתוך יוזמתך.'
                      : 'The system never sends unsolicited push notifications or spontaneous popups. Recommendations and activities only run when explicitly initiated by you.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Contacts & Social Privacy */}
          {activeTab === 'contacts' && (
            <div className="space-y-5">
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-emerald-900">
                  <Lock className="w-4 h-4 text-emerald-800" />
                  <span>
                    {language === 'he'
                      ? 'פרטיות חברתית הרמטית'
                      : 'Hermetic Social Privacy Architecture'}
                  </span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {language === 'he'
                    ? 'העדפותיך ומידת העניין שלך ביציאה משותפת עם אנשים שונים נשמרות באופן חסוי ומאובטח. איש קשר לעולם אינו מקבל אינדיקציה האם סומן כ"מועדף לפעילות" או "מעדיף שלא".'
                    : 'Your personal affinity and willingness to join activities together is strictly private. Contacts never receive any hint or indication of their affinity status.'}
                </p>
              </div>

              <div className="space-y-3">
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="p-4 rounded-2xl border border-stone-200 bg-white space-y-3 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xs">
                          {contact.name.slice(0, 1)}
                        </div>
                        <div>
                          <div className="font-bold text-stone-900">{contact.name}</div>
                          <div className="text-xs text-stone-500">{contact.relationship}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-stone-500 bg-stone-100 px-2 py-1 rounded-lg">
                        <Lock className="w-3.5 h-3.5 text-amber-800" />
                        <span>{language === 'he' ? 'פרטי עבורך בלבד' : 'Private to you only'}</span>
                      </div>
                    </div>

                    {/* Affinity setting */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-stone-700">
                        {language === 'he'
                          ? 'האם אתה מעוניין בפעילויות משותפות עם אדם זה?'
                          : 'Interest in joining activities together:'}
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => handleUpdateContactAffinity(contact.id, 'yes')}
                          className={`py-2 px-2.5 rounded-xl text-xs font-bold border text-center cursor-pointer transition-all ${
                            contact.interestInActivitiesTogether === 'yes'
                              ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                              : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                          }`}
                        >
                          {language === 'he' ? 'בכיף / בעדיפות גבוהה' : 'Gladly / High Priority'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleUpdateContactAffinity(contact.id, 'maybe')}
                          className={`py-2 px-2.5 rounded-xl text-xs font-bold border text-center cursor-pointer transition-all ${
                            contact.interestInActivitiesTogether === 'maybe'
                              ? 'bg-amber-700 text-white border-amber-700 shadow-xs'
                              : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                          }`}
                        >
                          {language === 'he' ? 'תלוי באופי הפעילות' : 'Depends on Activity'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleUpdateContactAffinity(contact.id, 'prefer_not')}
                          className={`py-2 px-2.5 rounded-xl text-xs font-bold border text-center cursor-pointer transition-all ${
                            contact.interestInActivitiesTogether === 'prefer_not'
                              ? 'bg-stone-800 text-white border-stone-800 shadow-xs'
                              : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                          }`}
                        >
                          {language === 'he' ? 'מעדיף שלא' : 'Prefer not'}
                        </button>
                      </div>
                    </div>

                    {/* Estimated preferences tags */}
                    {contact.estimatedPreferences.length > 0 && (
                      <div className="text-xs text-stone-600 flex items-center gap-1.5 flex-wrap pt-1">
                        <span className="font-semibold text-stone-500">
                          {language === 'he' ? 'הערכות שלך לגביו:' : 'Your estimates about them:'}
                        </span>
                        {contact.estimatedPreferences.map((p, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[11px]"
                          >
                            {p} (הערכה)
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Polite Decline Generator */}
          {activeTab === 'decline' && (
            <div className="space-y-5">
              <div className="bg-stone-100 border border-stone-200 rounded-2xl p-4 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-stone-900">
                  <ShieldCheck className="w-4 h-4 text-amber-800" />
                  <span>
                    {language === 'he'
                      ? 'סירוב מנומס, מכבד וניטרלי — ללא תירוצי יומן מדומים'
                      : 'Polite, respectful decline — zero fake calendar excuses'}
                  </span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {language === 'he'
                    ? 'כאשר אינך מעוניין לקחת חלק בהזמנה או באירוע, אין צורך להמציא תירוצים כוזבים על פגישות או טיפולים. להלן ניסוחים אותנטיים, נעימים ומכבדים.'
                    : 'When you prefer not to participate, there is no need to fabricate fake meetings or dentist appointments. Here are courteous, honest, and gracious response templates.'}
                </p>
              </div>

              {/* Contact name input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700">
                    {language === 'he' ? 'שם איש הקשר (אופציונלי):' : 'Contact Name (Optional):'}
                  </label>
                  <input
                    type="text"
                    value={selectedContactForDecline}
                    onChange={(e) => setSelectedContactForDecline(e.target.value)}
                    placeholder={language === 'he' ? 'לדוגמה: יוני' : 'e.g. Alex'}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700">
                    {language === 'he' ? 'בחר סגנון מענה:' : 'Select response tone:'}
                  </label>
                  <select
                    value={selectedTemplateId}
                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm bg-white"
                  >
                    {POLITE_DECLINE_TEMPLATES.map((tmpl) => (
                      <option key={tmpl.id} value={tmpl.id}>
                        {language === 'he' ? tmpl.titleHe : tmpl.titleEn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Generated message preview */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                  <span>{language === 'he' ? 'הודעה מוכנה לשליחה:' : 'Ready-to-send Message:'}</span>
                  <button
                    type="button"
                    onClick={handleCopyDeclineMessage}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-800 text-white font-bold hover:bg-amber-900 cursor-pointer transition-colors shadow-xs"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? (language === 'he' ? 'הועתק!' : 'Copied!') : (language === 'he' ? 'העתק טקסט' : 'Copy Text')}</span>
                  </button>
                </div>

                <div className="p-3 bg-white rounded-xl border border-stone-200 text-sm text-stone-800 font-medium whitespace-pre-wrap leading-relaxed shadow-inner">
                  {getCustomizedDeclineMessage(
                    selectedTemplateId,
                    selectedContactForDecline,
                    language === 'en' ? 'en' : 'he'
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Locations Separation */}
          {activeTab === 'locations' && (
            <div className="space-y-5">
              <div className="bg-stone-100 border border-stone-200 rounded-2xl p-4 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-stone-900">
                  <MapPin className="w-4 h-4 text-amber-800" />
                  <span>
                    {language === 'he'
                      ? 'הפרדה מדויקת בין מקום מגורים קבוע לנקודת יציאה'
                      : 'Precise separation of Permanent Residence vs. Activity Departure'}
                  </span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {language === 'he'
                    ? 'יציאה להופעה או לארוחת ערב מתבצעת לרוב ממקום העבודה או מפגישה אחרת, ולא בהכרח מהבית. המערכת מפרידה בין המגורים הקבועים לבין נקודת המוצא הרלוונטית לכל פעילות.'
                    : 'Leaving for an evening concert or dinner often happens from work or another meeting, not necessarily home. The system cleanly distinguishes your residence from where you actually start your evening.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 p-4 rounded-2xl border border-stone-200 bg-white">
                  <label className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-800" />
                    <span>{language === 'he' ? 'מגורים קבועים:' : 'Permanent Residence:'}</span>
                  </label>
                  <input
                    type="text"
                    value={userProfile.permanentHomeLocation}
                    onChange={(e) =>
                      onUpdateProfile({ ...userProfile, permanentHomeLocation: e.target.value })
                    }
                    placeholder={language === 'he' ? 'לדוגמה: תל אביב, ישראל' : 'e.g. Tel Aviv, Israel'}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm bg-white"
                  />
                  <p className="text-[11px] text-stone-500">
                    {language === 'he'
                      ? 'משמש לחישוב שעת חזרה הביתה ושינה בלילה'
                      : 'Used to calculate return home time and night rest'}
                  </p>
                </div>

                <div className="space-y-1.5 p-4 rounded-2xl border border-stone-200 bg-white">
                  <label className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-800" />
                    <span>{language === 'he' ? 'נקודת יציאה שגרתית לפעילות:' : 'Default Activity Departure Point:'}</span>
                  </label>
                  <input
                    type="text"
                    value={userProfile.defaultActivityDepartureLocation}
                    onChange={(e) =>
                      onUpdateProfile({
                        ...userProfile,
                        defaultActivityDepartureLocation: e.target.value,
                      })
                    }
                    placeholder={language === 'he' ? 'לדוגמה: רמת החייל (משרד)' : 'e.g. Office / Downtown'}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm bg-white"
                  />
                  <p className="text-[11px] text-stone-500">
                    {language === 'he'
                      ? 'המיקום שממנו יוצאים ישירות לפעילות (למשל אחרי יום עבודה)'
                      : 'The place you depart from directly to the activity'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-800 text-white font-bold text-xs sm:text-sm hover:bg-amber-900 cursor-pointer transition-colors shadow-xs"
          >
            {language === 'he' ? 'אישור וסיום' : 'Done & Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
