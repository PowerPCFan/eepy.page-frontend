import * as pkg from "@powerpcfan/eepy-page-i18n";

const localLocales = import.meta.glob("/locales/*/*.json", { eager: true }) as Record<string, { default: any }>;

if (Object.keys(localLocales).length > 0) {
    for (const [filePath, mod] of Object.entries(localLocales)) {
        const match = filePath.match(/\/locales\/([^/]+)\/([^/]+)\.json$/);
        if (match && match[1] && match[2]) {
            const locale = match[1];
            const ns = match[2];
            const data = mod.default || mod;
            pkg.rootI18n.addResourceBundle(locale, "translation", { [ns]: data }, true, true);
            if (pkg.clientI18n && pkg.clientI18n !== pkg.rootI18n) {
                pkg.clientI18n.addResourceBundle(locale, "translation", { [ns]: data }, true, true);
            }
        }
    }
}

export * from "@powerpcfan/eepy-page-i18n";
