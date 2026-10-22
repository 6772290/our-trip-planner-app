import React, { useState, useEffect } from 'react';
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
  Plus,
  Trash2,
  RefreshCw,
  RotateCcw,
  AlertTriangle,
  Settings,
  Heart,
} from 'lucide-react';

export type AccountModalTab = 'profile' | 'preferences' | 'contacts' | 'privacy' | 'settings';

interface ProfileAndPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  contacts: ContactPerson[];
  initialTab?: AccountModalTab;
  onUpdateProfile: (updated: UserProfile) => void;
  onUpdateContacts: (updated: ContactPerson[]) => void;
  onLoadDemoData: () => void;
  onResetToEmpty: () => void;
}

export const ProfileAndPrivacyModal: React.FC<ProfileAndPrivacyModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  contacts,
  initialTab = 'profile',
  onUpdateProfile,
  onUpdateContacts,
  onLoadDemoData,
  onResetToEmpty,
}) => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<AccountModalTab>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  // New preference form
  const [newPrefLabel, setNewPrefLabel] = useState('');
  const [newPrefCategory, setNewPrefCategory] = useState<PreferenceItem['category']>('dietary');
  const [newPrefScope, setNewPrefScope] = useState<PreferenceItem['scope']>('partner_only');

  // New contact form
  const [newContactName, setNewContactName] = useState('');
  const [newContactRelationship, setNewContactRelationship] = useState('');

  // Decline generator state
  const [selectedContactForDecline, setSelectedContactForDecline] = useState<string>(
    contacts[0]?.name || ''
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('warm_direct');
  const [copied, setCopied] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!isOpen) return null;

  const handleToggleProvenance = (prefId: string) => {
    const updatedPrefs = userProfile.preferences.map((p) => {
      if (p.id === prefId) {
        return { ...p, provenance: 'confirmed' as ProvenanceType };
      }
      return p;
    });
    onUpdateProfile({ ...userProfile, preferences: updatedPrefs });
  };

  const handleRemovePreference = (prefId: string) => {
    const updatedPrefs = userProfile.preferences.filter((p) => p.id !== prefId);
    onUpdateProfile({ ...userProfile, preferences: updatedPrefs });
  };

  const handleAddPreference = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrefLabel.trim()) return;

    const newPref: PreferenceItem = {
      id: `pref_${Date.now()}`,
      category: newPrefCategory,
      label: newPrefLabel.trim(),
      provenance: 'confirmed', // Explicitly entered by the user
      scope: newPrefScope,
      notes: language === 'he' ? 'הוזן ישירות על ידך' : 'Entered directly by you',
    };

    onUpdateProfile({
      ...userProfile,
      preferences: [...userProfile.preferences, newPref],
    });
    setNewPrefLabel('');
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim()) return;

    const newContact: ContactPerson = {
      id: `c_${Date.now()}`,
      name: newContactName.trim(),
      relationship: newContactRelationship.trim() || (language === 'he' ? 'חבר/ה' : 'Friend'),
      interestInActivitiesTogether: 'yes',
      privateNotes: '',
      estimatedPreferences: [],
      confirmedPreferences: [],
    };

    onUpdateContacts([...contacts, newContact]);
    setNewContactName('');
    setNewContactRelationship('');
  };

  const handleRemoveContact = (contactId: string) => {
    onUpdateContacts(contacts.filter((c) => c.id !== contactId));
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
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-stone-900">
                  {language === 'he'
                    ? 'מרכז העדפות, פרופיל ופרטיות'
                    : 'Profile, Preferences & Privacy Center'}
                </h2>
                {userProfile.isDemo ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    {language === 'he' ? 'נתוני הדגמה פעילים' : 'Demo Mode'}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                    {language === 'he' ? 'פרופיל אישי נקי' : 'Personal Clean Profile'}
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500">
                {language === 'he'
                  ? 'ללא הנחות שווא: מידע מוגדר רק על ידך ומאוחסן בדפדפן'
                  : 'Zero assumptions: Information is only set by you and stored locally'}
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
            onClick={() => setActiveTab('profile')}
            className={`py-3 border-b-2 px-2 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'profile'
                ? 'border-amber-800 text-amber-900 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            {language === 'he' ? 'הפרופיל שלי' : 'My Profile'}
          </button>

          <button
            onClick={() => setActiveTab('preferences')}
            className={`py-3 border-b-2 px-2 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'preferences'
                ? 'border-amber-800 text-amber-900 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            {language === 'he' ? 'ההעדפות שלי' : 'My Preferences'}
          </button>

          <button
            onClick={() => setActiveTab('contacts')}
            className={`py-3 border-b-2 px-2 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'contacts'
                ? 'border-amber-800 text-amber-900 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            {language === 'he' ? 'האנשים והקבוצות שלי' : 'My People & Groups'}
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`py-3 border-b-2 px-2 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'privacy'
                ? 'border-amber-800 text-amber-900 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            {language === 'he' ? 'פרטיות ושיתוף' : 'Privacy & Sharing'}
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 border-b-2 px-2 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'settings'
                ? 'border-amber-800 text-amber-900 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            {language === 'he' ? 'הגדרות' : 'Settings'}
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          {/* TAB 1: Profile & Locations */}
          {activeTab === 'profile' && (
            <div className="space-y-5">
              {/* Personal Details */}
              <div className="space-y-3 p-4 rounded-2xl border border-stone-200 bg-white shadow-xs">
                <h3 className="font-bold text-stone-900 text-xs sm:text-sm flex items-center gap-1.5">
                  <User className="w-4 h-4 text-amber-800" />
                  <span>{language === 'he' ? 'פרטי המשתמש:' : 'User Details:'}</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-stone-700">
                      {language === 'he' ? 'שם מלא (אופציונלי):' : 'Full Name (Optional):'}
                    </label>
                    <input
                      type="text"
                      value={userProfile.fullName}
                      onChange={(e) => onUpdateProfile({ ...userProfile, fullName: e.target.value })}
                      placeholder={language === 'he' ? 'השם שלך' : 'Your Name'}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-stone-700">
                      {language === 'he' ? 'מגורים קבועים:' : 'Permanent Home:'}
                    </label>
                    <input
                      type="text"
                      value={userProfile.permanentHomeLocation}
                      onChange={(e) =>
                        onUpdateProfile({ ...userProfile, permanentHomeLocation: e.target.value })
                      }
                      placeholder={language === 'he' ? 'למשל: תל אביב, חיפה...' : 'e.g. City / Country'}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-stone-700">
                      {language === 'he' ? 'נקודת יציאה שגרתית לפעילות:' : 'Default Departure Point:'}
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
                      placeholder={language === 'he' ? 'למשל: משרד / בית' : 'e.g. Office / Home'}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Quiet Default Principle */}
              <div className="p-4 rounded-2xl bg-stone-100 border border-stone-200 flex items-start gap-3">
                <BellOff className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-stone-900">
                    {language === 'he'
                      ? 'מערכת שקטה כברירת מחדל (Quiet by Default)'
                      : 'Quiet System by Default'}
                  </div>
                  <p className="text-xs text-stone-600">
                    {language === 'he'
                      ? 'המערכת אינה שולחת התראות, תזכורות או הצעות יזומות. אין חיפוש מחזורי ברקע. כל פעילות מתחילה אך ורק ביוזמתך הישירה.'
                      : 'Zero unsolicited alerts or periodic background polling. The system only runs when you ask.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Preferences */}
          {activeTab === 'preferences' && (
            <div className="space-y-5">
              {/* Add New Preference Form */}
              <form
                onSubmit={handleAddPreference}
                className="p-4 rounded-2xl border border-amber-200 bg-amber-50/50 space-y-3"
              >
                <div className="font-bold text-xs text-amber-900">
                  {language === 'he' ? '+ הוספת העדפה אישית חדשה (מאושרת על ידך):' : '+ Add New Verified Preference:'}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={newPrefLabel}
                    onChange={(e) => setNewPrefLabel(e.target.value)}
                    placeholder={language === 'he' ? 'למשל: העדפת מסעדות צמחוניות / קונצרטים...' : 'e.g. Vegetarian / Live Jazz...'}
                    className="sm:col-span-2 px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs"
                  />
                  <select
                    value={newPrefCategory}
                    onChange={(e) => setNewPrefCategory(e.target.value as any)}
                    className="px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-semibold"
                  >
                    <option value="dietary">{language === 'he' ? 'תזונה / כשרות' : 'Dietary'}</option>
                    <option value="culture">{language === 'he' ? 'תרבות ואמנות' : 'Culture'}</option>
                    <option value="music">{language === 'he' ? 'מוזיקה' : 'Music'}</option>
                    <option value="atmosphere">{language === 'he' ? 'אווירה ולוח זמנים' : 'Atmosphere'}</option>
                    <option value="mobility">{language === 'he' ? 'נגישות / הליכה' : 'Mobility'}</option>
                  </select>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-amber-800 text-white font-bold text-xs hover:bg-amber-900 cursor-pointer transition-colors shadow-xs"
                  >
                    {language === 'he' ? 'שמור העדפה' : 'Save Preference'}
                  </button>
                </div>
              </form>

              {/* Preferences List */}
              <div className="space-y-2">
                <h3 className="font-bold text-stone-900 text-xs sm:text-sm">
                  {language === 'he' ? 'העדפות רשומות במערכת:' : 'Saved Preferences:'}
                </h3>
                {userProfile.preferences.length === 0 ? (
                  <div className="p-6 text-center rounded-2xl border border-dashed border-stone-300 text-stone-500 text-xs">
                    {language === 'he'
                      ? 'אין עדיין העדפות שמורות. המערכת מתחילה ריקה לחלוטין וללא הנחות מוקדמות.'
                      : 'No saved preferences yet. The system begins completely empty with zero assumptions.'}
                  </div>
                ) : (
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
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${badge.colorClass}`}
                            >
                              {language === 'he' ? badge.labelHe : badge.labelEn}
                            </span>

                            {pref.provenance !== 'confirmed' && (
                              <button
                                type="button"
                                onClick={() => handleToggleProvenance(pref.id)}
                                className="px-2.5 py-1 text-xs font-bold bg-amber-800 text-white rounded-lg hover:bg-amber-900 cursor-pointer transition-colors"
                              >
                                {language === 'he' ? 'אישור כעובדה' : 'Confirm'}
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleRemovePreference(pref.id)}
                              className="text-stone-400 hover:text-rose-600 p-1 cursor-pointer transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Contacts & Social Privacy */}
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

              {/* Add New Contact Form */}
              <form
                onSubmit={handleAddContact}
                className="p-4 rounded-2xl border border-stone-200 bg-stone-50 space-y-3"
              >
                <div className="font-bold text-xs text-stone-800">
                  {language === 'he' ? '+ הוספת איש קשר חדש:' : '+ Add New Contact:'}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newContactName}
                    onChange={(e) => setNewContactName(e.target.value)}
                    placeholder={language === 'he' ? 'שם איש הקשר' : 'Contact Name'}
                    className="px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs"
                  />
                  <input
                    type="text"
                    value={newContactRelationship}
                    onChange={(e) => setNewContactRelationship(e.target.value)}
                    placeholder={language === 'he' ? 'קשר (בן/בת זוג, חבר, קולגה)' : 'Relationship (Partner, Friend...)'}
                    className="px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-amber-800 text-white font-bold text-xs hover:bg-amber-900 cursor-pointer transition-colors shadow-xs"
                  >
                    {language === 'he' ? 'הוסף איש קשר' : 'Add Contact'}
                  </button>
                </div>
              </form>

              {/* Contacts List */}
              <div className="space-y-3">
                {contacts.length === 0 ? (
                  <div className="p-6 text-center rounded-2xl border border-dashed border-stone-300 text-stone-500 text-xs">
                    {language === 'he'
                      ? 'אין אנשי קשר מוגדרים כרגע. תוכלו להוסיף שותפים אמיתיים או לטעון נתוני הדגמה.'
                      : 'No contacts defined yet. Add real partners or load demo data.'}
                  </div>
                ) : (
                  contacts.map((contact) => (
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

                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5 text-xs text-stone-500 bg-stone-100 px-2 py-1 rounded-lg">
                            <Lock className="w-3.5 h-3.5 text-amber-800" />
                            <span>{language === 'he' ? 'פרטי עבורך' : 'Private'}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveContact(contact.id)}
                            className="text-stone-400 hover:text-rose-600 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: Privacy & Sharing */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              {/* Privacy principles banner */}
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 font-bold text-stone-900">
                  <ShieldCheck className="w-5 h-5 text-amber-800" />
                  <span>
                    {language === 'he'
                      ? 'עקרונות פרטיות והפרדה מלאה בין חברי קבוצה'
                      : 'Privacy Principles & Strict Separation'}
                  </span>
                </div>
                <ul className="text-xs text-stone-600 space-y-1.5 list-disc list-inside leading-relaxed">
                  <li>
                    {language === 'he'
                      ? 'הערות פרטיות, תקציב וסירובים אינם נחשפים לאף אדם אחר, גם לא בתוך אותה קבוצה.'
                      : 'Private notes, individual budgets, and declines are never shared with others, even within the same group.'}
                  </li>
                  <li>
                    {language === 'he'
                      ? 'העדפות אישיות שמוגדרות כ"פרטיות" משמשות רק את מנוע החיפוש האישי שלך.'
                      : 'Preferences marked as private are only used for your individual experience recommendations.'}
                  </li>
                  <li>
                    {language === 'he'
                      ? 'אין מעקב מיקום רציף ואין סנכרון חיצוני ללא הסכמה מפורשת.'
                      : 'No continuous location tracking or external sync without explicit consent.'}
                  </li>
                </ul>
              </div>

              {/* Polite decline tool */}
              <div className="border border-stone-200 rounded-2xl p-4 space-y-4">
                <div className="space-y-1">
                  <h4 className="text-xs sm:text-sm font-bold text-stone-900 flex items-center gap-2">
                    <BellOff className="w-4 h-4 text-amber-800" />
                    <span>
                      {language === 'he'
                        ? 'כלי לסירוב מנומס, מכבד וניטרלי'
                        : 'Polite, Respectful Decline Generator'}
                    </span>
                  </h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    {language === 'he'
                      ? 'כאשר אינך מעוניין להשתתף בפעילות, אין צורך להמציא תירוצים כוזבים. בחר ניסוח אותנטי, נעים ומכבד:'
                      : 'When you prefer not to participate, no fake excuses are needed. Choose an authentic, gracious phrasing:'}
                  </p>
                </div>

                {/* Contact name input & style picker */}
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
                <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                    <span>{language === 'he' ? 'הודעה מוכנה להעתקה:' : 'Message Ready to Copy:'}</span>
                    <button
                      type="button"
                      onClick={handleCopyDeclineMessage}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-800 text-white font-bold hover:bg-amber-900 cursor-pointer transition-colors shadow-xs"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? (language === 'he' ? 'הועתק!' : 'Copied!') : (language === 'he' ? 'העתק טקסט' : 'Copy Text')}</span>
                    </button>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-800 font-medium whitespace-pre-wrap leading-relaxed">
                    {getCustomizedDeclineMessage(
                      selectedTemplateId,
                      selectedContactForDecline,
                      language === 'en' ? 'en' : 'he'
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Settings */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Storage explanation banner */}
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 font-bold text-stone-900">
                  <Lock className="w-4 h-4 text-amber-800" />
                  <span>
                    {language === 'he'
                      ? 'אחסון מקומי ופרטיות נתונים'
                      : 'Local Storage & Data Privacy'}
                  </span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {language === 'he'
                    ? 'כל המידע האישי שלך — שם, מקום מגורים, העדפות, אנשי קשר וקבוצות — נשמר אך ורק באחסון המקומי של דפדפן זה (Local Storage). שום מידע אישי אינו נשלח לשרת חיצוני, אין שירותי ענן מדומים ואין צורך בשום סיסמה או חשבון מקוון.'
                    : 'All your personal profile data — name, home base, preferences, contacts, and groups — is stored strictly inside this browser (Local Storage). No personal data is sent to external servers, there are no fake cloud accounts, and no online passwords are needed.'}
                </p>
              </div>

              {/* Current Profile Status */}
              <div className="border border-stone-200 rounded-2xl p-4 space-y-2">
                <h4 className="text-xs font-bold text-stone-700">
                  {language === 'he' ? 'סטטוס הפרופיל הפעיל:' : 'Active Profile Status:'}
                </h4>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {userProfile.isDemo ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        {language === 'he' ? 'מצב הדגמה פעיל (דן כהן)' : 'Demo Profile Active'}
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                        {language === 'he' ? 'פרופיל אישי נקי' : 'Personal Clean Profile'}
                      </span>
                    )}
                    <span className="text-xs text-stone-500">
                      {userProfile.preferences.length}{' '}
                      {language === 'he' ? 'העדפות שמורות' : 'saved preferences'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Demo Mode / Data Exploration */}
              <div className="border border-stone-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-stone-900">
                      {language === 'he' ? 'נתוני הדגמה לבדיקה' : 'Demo Data for Exploration'}
                    </h4>
                    <p className="text-xs text-stone-500">
                      {language === 'he'
                        ? 'טעינת פרופיל לדוגמה עם תחומי עניין מוכנים (דן ומיכל, תל אביב) לצורך התנסות במערכת.'
                        : 'Load a sample profile with preset interests (Dan & Michal) to explore platform features.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onLoadDemoData();
                      setShowResetConfirm(false);
                    }}
                    className="px-3.5 py-1.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-100 cursor-pointer transition-colors whitespace-nowrap shrink-0"
                  >
                    {language === 'he' ? 'טעינת נתוני הדגמה' : 'Load Demo Data'}
                  </button>
                </div>
              </div>

              {/* Data Reset Section with Confirmation */}
              <div className="border border-red-200 bg-red-50/40 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-red-900 font-bold text-xs sm:text-sm">
                  <AlertTriangle className="w-4 h-4 text-red-700 shrink-0" />
                  <span>
                    {language === 'he'
                      ? 'מחיקת מידע אישי ואיפוס פרופיל'
                      : 'Delete Personal Data & Reset Profile'}
                  </span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {language === 'he'
                    ? 'פעולה זו תמחק את הפרופיל האישי, כל ההעדפות ואנשי הקשר שנשמרו בדפדפן זה, ותחזיר את המערכת לפרופיל נקי לחלוטין. טיולים שתוכננו במערכת תכנון הטיולים יישמרו.'
                    : 'This action deletes your personal profile, all preferences and contacts saved in this browser, returning to a completely empty profile. Trips in the Trip Planner will be kept.'}
                </p>

                {showResetConfirm ? (
                  <div className="p-3 bg-white rounded-xl border border-red-300 space-y-2.5">
                    <p className="text-xs font-bold text-red-800">
                      {language === 'he'
                        ? 'האם אתה בטוח שברצונך לאפס את כל הנתונים האישיים ולהתחיל מחדש?'
                        : 'Are you sure you want to reset all personal data and start fresh?'}
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onResetToEmpty();
                          setShowResetConfirm(false);
                        }}
                        className="px-4 py-1.5 rounded-lg bg-red-700 hover:bg-red-800 text-white font-bold text-xs cursor-pointer transition-colors shadow-xs"
                      >
                        {language === 'he' ? 'כן, אפס ומחק הכל' : 'Yes, Reset All'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowResetConfirm(false)}
                        className="px-3 py-1.5 rounded-lg border border-stone-300 text-stone-700 font-medium text-xs hover:bg-stone-100 cursor-pointer transition-colors"
                      >
                        {language === 'he' ? 'ביטול' : 'Cancel'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowResetConfirm(true)}
                      className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs sm:text-sm cursor-pointer transition-colors shadow-xs"
                    >
                      {language === 'he' ? 'איפוס פרופיל ומחיקת נתונים' : 'Reset Profile & Delete Data'}
                    </button>
                  </div>
                )}
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
