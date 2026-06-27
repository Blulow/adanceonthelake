const languages = Object.values(import.meta.glob("../assets/lang/*.json", { eager: true }));
export class Lang {
    static EN = "en";
    static JA = "ja";
}
let currentLang = Lang.EN;
let lang =  languages.find(e => e.lang === currentLang);
setLanguage(currentLang);

export function t(key, params = {}) {
    let text = lang.t[key];

    for (const [n, v] of Object.entries(params)) {
        text = text.replace(`{${n}}`, value);
    }

    return text;
}

export function setLanguage(_lang) {
    currentLang = _lang;
    document.documentElement.lang = _lang;
    lang = languages.find(e => e.lang === _lang);
    
    document.querySelectorAll("[data-i18n]").forEach(e => {
        const key = e.dataset.i18n;
        e.textContent = t(key);
    });
}