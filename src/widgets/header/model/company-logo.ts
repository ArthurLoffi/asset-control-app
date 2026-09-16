const localLogoUrls = import.meta.glob<string>('../assets/*', {
    eager: true,
    import: 'default',
    query: '?url',
});

const headerAssetPrefixes = [
    '@/widgets/header/assets/',
    '/src/widgets/header/assets/',
    'src/widgets/header/assets/',
    './assets/',
    '../assets/',
];

function getLocalAssetPath(source: string): string | undefined {
    const normalizedSource = source.replaceAll('\\', '/');
    const matchingPrefix = headerAssetPrefixes.find((prefix) =>
        normalizedSource.startsWith(prefix),
    );

    if (matchingPrefix !== undefined) {
        return `../assets/${normalizedSource.slice(matchingPrefix.length)}`;
    }

    if (!normalizedSource.includes('/')) {
        return `../assets/${normalizedSource}`;
    }

    return undefined;
}

export function resolveCompanyLogoSource(
    configuredSource: unknown,
): string | undefined {
    if (typeof configuredSource !== 'string') {
        return undefined;
    }

    const source = configuredSource.trim();
    if (source.length === 0) {
        return undefined;
    }

    const localAssetPath = getLocalAssetPath(source);
    return localAssetPath === undefined
        ? source
        : (localLogoUrls[localAssetPath] ?? source);
}

export const companyLogoSource = resolveCompanyLogoSource(
    import.meta.env.VITE_COMPANY_LOGO,
);
