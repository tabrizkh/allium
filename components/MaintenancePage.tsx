'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import BrandLogo from './BrandLogo';
import { Lock } from 'lucide-react';
import { toast } from 'sonner';

interface MaintenancePageProps {
  onBypass: (password: string) => Promise<void>;
}

const MaintenancePage: React.FC<MaintenancePageProps> = ({ onBypass }) => {
  const { t, i18n } = useTranslation();
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onBypass(password);
    } catch (error) {
      toast.error(t('maintenance.error'));
    } finally {
      setLoading(false);
    }
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('allium-lang', lng);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="z-10 flex flex-col items-center max-w-2xl w-full text-center space-y-8">
        <div className="mb-4">
          <BrandLogo className="w-48 h-auto" />
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary">
            {t('maintenance.title')}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-md mx-auto">
            {t('maintenance.description')}
          </p>
        </div>

        <div className="flex space-x-4 pt-4">
          {['ru', 'az', 'en'].map((lang) => (
            <button
              key={lang}
              onClick={() => changeLanguage(lang)}
              className={`px-4 py-2 rounded-full border transition-all ${
                i18n.language === lang
                  ? 'bg-primary text-primary-foreground border-primary shadow-lg'
                  : 'bg-background hover:bg-muted border-input'
              }`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="pt-12 w-full flex flex-col items-center">
          {!showAdminLogin ? (
            <button
              onClick={() => setShowAdminLogin(true)}
              className="text-xs text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors flex items-center space-x-1"
            >
              <Lock className="w-3 h-3" />
              <span>{t('maintenance.admin_login')}</span>
            </button>
          ) : (
            <form onSubmit={handleLogin} className="w-full max-w-xs space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('maintenance.password_placeholder')}
                autoFocus
                className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-center"
              />
              <div className="flex space-x-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {loading ? '...' : t('maintenance.submit')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAdminLogin(false)}
                  className="px-4 py-2 rounded-lg border border-input hover:bg-muted transition-colors"
                >
                  ×
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <footer className="absolute bottom-8 text-muted-foreground/40 text-sm">
        &copy; {new Date().getFullYear()} allium. {t('footer.all_rights')}
      </footer>
    </div>
  );
};

export default MaintenancePage;
