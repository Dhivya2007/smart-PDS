import React from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { Phone, Mail, Shield, ExternalLink, HelpCircle } from 'lucide-react';

const Footer = () => {
  const { language, t } = useLanguage();

  return (
    <footer className="bg-gov-navy text-slate-300 border-t border-blue-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Government Identity */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🌾</span>
              <span className="font-bold text-white text-base">Smart PDS Portal</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {language === 'ta'
                ? 'பொது விநியோகத் திட்டத்தை நவீனமயமாக்கி, வெளிப்படையான வரிசை மேலாண்மை மற்றும் டிஜிட்டல் ரேஷன் விநியோகத்தை உறுதி செய்யும் தமிழ்நாடு அரசுத் தளம்.'
                : 'National & State Public Distribution System digitization initiative providing queue slots, instant tokens, verified stock tracking, and transparent distribution.'}
            </p>
            <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-semibold">
              <Shield className="w-4 h-4" />
              <span>NFSA & State Government Verified</span>
            </div>
          </div>

          {/* Col 2: Citizen Services */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3 border-b border-blue-800 pb-1">
              {language === 'ta' ? 'குடிமக்கள் சேவைகள்' : 'Citizen Services'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="/beneficiary/book-slot" className="hover:text-blue-200 transition">
                  {t('bookSlot')}
                </a>
              </li>
              <li>
                <a href="/beneficiary/verify-card" className="hover:text-blue-200 transition">
                  {language === 'ta' ? 'ஸ்மார்ட் கார்டு சரிபார்ப்பு' : 'Ration Card Verification'}
                </a>
              </li>
              <li>
                <a href="/beneficiary/purchase-history" className="hover:text-blue-200 transition">
                  {language === 'ta' ? 'டிஜிட்டல் ரசீதுகள்' : 'Digital Receipts & History'}
                </a>
              </li>
              <li>
                <a href="/login" className="hover:text-blue-200 transition">
                  {language === 'ta' ? 'கடை உரிமையாளர் உள்நுழைவு' : 'FPS Owner Portal'}
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Toll-Free Helplines */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3 border-b border-blue-800 pb-1">
              {language === 'ta' ? 'உதவி எண்கள் & புகார்' : 'Helpline & Grievance'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>Toll-Free: <strong>1967</strong> / <strong>1800-425-5901</strong></span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span>support@smartpds.gov.in</span>
              </li>
              <li className="flex items-center space-x-2">
                <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Working Hours: 09:00 AM - 06:00 PM</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Important Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3 border-b border-blue-800 pb-1">
              {language === 'ta' ? 'அதிகாரப்பூர்வ இணைப்புகள்' : 'Official Portals'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="https://tnpds.gov.in" target="_blank" rel="noreferrer" className="hover:text-blue-200 flex items-center gap-1 transition">
                  <span>TNPDS State Portal</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a href="https://nfsa.gov.in" target="_blank" rel="noreferrer" className="hover:text-blue-200 flex items-center gap-1 transition">
                  <span>National Food Security (NFSA)</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a href="https://dfpd.gov.in" target="_blank" rel="noreferrer" className="hover:text-blue-200 flex items-center gap-1 transition">
                  <span>Department of Food & Public Distribution</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-blue-900/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <p>© {new Date().getFullYear()} Smart PDS Queue Management System. All Rights Reserved.</p>
          <div className="flex items-center space-x-4">
            <span className="text-slate-500">College Capstone Project Demonstration</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span className="text-emerald-400 font-mono">System Online</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
