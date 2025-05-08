import type { LanguageCode, AvailableLanguage } from '@/constants/languages'

interface LanguageSelectorProps {
    language: LanguageCode
    availableLanguages: readonly AvailableLanguage[]
}

export default function LanguageSelector({ language, availableLanguages }: LanguageSelectorProps) {
    return (
        <div className="idiomaSelector">
            {availableLanguages.map((lang) => (
                <button
                    key={lang}
                    className={`idiomaBtn ${language === lang ? 'active' : ''}`}
                    onClick={() => {
                        window.location.href = `?lang=${lang}`
                    }}
                >
                    {lang.toUpperCase()}
                </button>
            ))}
        </div>
    )
}
