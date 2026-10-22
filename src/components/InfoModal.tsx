import React from 'react';
import { X, CheckCircle2, HelpCircle, Compass, Sparkles } from 'lucide-react';

interface InfoModalProps {
  type: 'how_it_works' | 'faq';
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ type, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div
        className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-xl border border-stone-200 text-right space-y-6 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {type === 'how_it_works' ? (
          <>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-stone-900">איך פועלת אפליקציית "הטיול שלנו"?</h3>
                <span className="text-xs text-stone-500">מדריך קצר ליזמים ומטיילים</span>
              </div>
            </div>

            <div className="space-y-4 text-sm text-stone-600 leading-relaxed">
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                <strong className="text-stone-900 block font-bold">1. שאלון אישי לכל אחד</strong>
                <p className="text-xs">
                  במקום שמישהו אחד ייקח על עצמו לתכנן וינחש מה האחרים אוהבים, כל משתתף מקבל שאלון קצר שממפה את העדפותיו האישיות.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                <strong className="text-stone-900 block font-bold">2. שקלול חכם ומניעת קונפליקטים</strong>
                <p className="text-xs">
                  המערכת מוצאת את נקודות החיבור (האהבות המשותפות) לצד פערים בקצב או בתקציב, ומציעה פתרונות גישור מובנים.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                <strong className="text-stone-900 block font-bold">3. הצעות מסלול ושאלות הכרעה</strong>
                <p className="text-xs">
                  במקום רשימת טיסות יבשה, מקבלים 3 קונספטים מובחנים לטיול עם נימוקים, ושאלות מנחות לחידוד ההחלטה הסופית.
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-stone-900">שאלות נפוצות על אב־הטיפוס</h3>
                <span className="text-xs text-stone-500">גרסה 1.0</span>
              </div>
            </div>

            <div className="space-y-4 text-sm text-stone-600 leading-relaxed">
              <div>
                <h4 className="font-bold text-stone-900 text-sm">האם צריך להירשם או להזין כרטיס אשראי?</h4>
                <p className="text-xs text-stone-600 mt-1">
                  לא. זוהי גרסת אב־טיפוס אינטראקטיבית ללא צורך בהתחברות או תשלום.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-stone-900 text-sm">היכן נשמרים הטיולים שאני יוצר?</h4>
                <p className="text-xs text-stone-600 mt-1">
                  הנתונים נשמרים ישירות בזיכרון המקומי של הדפדפן שלך (LocalStorage) כך שתוכל לרענן ולחזור אליהם בכל עת.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-stone-900 text-sm">איך נוצרות ההמלצות בשלב זה?</h4>
                <p className="text-xs text-stone-600 mt-1">
                  ההמלצות נבנות באמצעות מנוע התאמה לוגי מובנה המשקלל את תחומי העניין, הקצב והתקציב. בעתיד ניתן יהיה לחבר מודל AI לייצור מסלולים דינמיים לפי שעות ומחירים עדכניים.
                </p>
              </div>
            </div>
          </>
        )}

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-colors cursor-pointer"
          >
            הבנתי, תודה
          </button>
        </div>
      </div>
    </div>
  );
};
