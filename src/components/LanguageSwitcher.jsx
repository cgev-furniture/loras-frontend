import { useTranslation } from 'react-i18next';

const LANGS = [
  { code: 'hy', label: 'ՀԱՅ' },
  { code: 'ru', label: 'РУС' },
  { code: 'en', label: 'ENG' },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.language?.slice(0, 2);

  function handleChange(code) {
    i18n.changeLanguage(code);
    localStorage.setItem('loras_lang', code);
    document.documentElement.lang = code;
  }

  return (
    <div
      style={{
        display: 'flex',
        gap: '0.25rem',
        alignItems: 'center',
      }}
      aria-label="Language switcher"
    >
      {LANGS.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => handleChange(code)}
          aria-pressed={current === code}
          style={{
            padding: '0.3rem 0.5rem',
            fontSize: 'var(--text-xs)',
            fontWeight: current === code ? 'var(--font-weight-semibold)' : 'var(--font-weight-regular)',
            borderRadius: 'var(--radius-sm)',
            border: '1.5px solid',
            borderColor: current === code ? 'var(--color-caramel)' : 'transparent',
            background: current === code ? 'var(--color-caramel)' : 'transparent',
            color: current === code ? 'var(--color-cream)' : 'inherit',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
            lineHeight: 1,
            minHeight: '32px',
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
