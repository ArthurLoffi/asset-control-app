// This source-scanning test needs Node globals excluded from the browser tsconfig.
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="node" />
import {readFileSync, readdirSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';
import {createInstance} from 'i18next';
import {describe, expect, it} from 'vitest';
import {translationResources, supportedLanguages} from './resources';
import {translateMessage} from './translate-message';

function flatten(
    value: Record<string, unknown>,
    prefix = '',
): Record<string, string> {
    return Object.fromEntries(
        Object.entries(value).flatMap(([key, entry]) => {
            const path = prefix.length > 0 ? `${prefix}.${key}` : key;
            return typeof entry === 'string'
                ? [[path, entry]]
                : Object.entries(
                      flatten(entry as Record<string, unknown>, path),
                  );
        }),
    );
}

function sourceFiles(directory: string): string[] {
    return readdirSync(directory, {withFileTypes: true}).flatMap((entry) => {
        const path = join(directory, entry.name);
        return entry.isDirectory()
            ? sourceFiles(path)
            : /(?<!\.test)\.tsx?$/u.test(entry.name)
              ? [path]
              : [];
    });
}

function literalKeys(node: ts.Node): string[] {
    if (ts.isStringLiteral(node)) {
        return [node.text];
    }

    if (ts.isConditionalExpression(node)) {
        return [...literalKeys(node.whenTrue), ...literalKeys(node.whenFalse)];
    }

    return [];
}

describe('translation coverage', () => {
    it('has matching keys and interpolation variables in both catalogs', () => {
        const english = flatten(translationResources.en.translation);
        const portuguese = flatten(translationResources['pt-BR'].translation);
        expect(Object.keys(portuguese).toSorted()).toEqual(
            Object.keys(english).toSorted(),
        );
        for (const [key, value] of Object.entries(english)) {
            expect(portuguese[key], key).not.toBe('');
            expect(
                portuguese[key].match(/\{\{\w+\}\}/gu)?.toSorted(),
                key,
            ).toEqual(value.match(/\{\{\w+\}\}/gu)?.toSorted());
        }
    });

    it.each(supportedLanguages)(
        'resolves all literal UI translation keys without fallback in %s',
        async (language) => {
            const instance = createInstance();
            await instance.init({
                lng: language,
                fallbackLng: false,
                resources: translationResources,
            });
            const missing: string[] = [];
            for (const file of sourceFiles(
                fileURLToPath(new URL('../../../', import.meta.url)),
            )) {
                const source = ts.createSourceFile(
                    file,
                    readFileSync(file, 'utf8'),
                    ts.ScriptTarget.Latest,
                    true,
                );
                const visit = (node: ts.Node): void => {
                    if (
                        ts.isCallExpression(node) &&
                        (node.expression.getText(source) === 't' ||
                            node.expression.getText(source) === 'i18n.t') &&
                        node.arguments.length > 0
                    ) {
                        for (const key of literalKeys(node.arguments[0])) {
                            if (!instance.exists(key, {count: 2})) {
                                missing.push(`${file}: ${key}`);
                            }
                        }
                    }

                    ts.forEachChild(node, visit);
                };

                visit(source);
            }

            expect(missing).toEqual([]);
        },
    );

    it('retranslates stored errors and success messages while preserving unknown API details', async () => {
        const instance = createInstance();
        await instance.init({lng: 'pt-BR', resources: translationResources});
        expect(
            translateMessage('invalid username or password', instance.t),
        ).toBe('Usuário ou senha inválidos');
        expect(
            translateMessage('Printer updated successfully.', instance.t),
        ).toBe('Impressora atualizada com sucesso.');
        expect(translateMessage('Request failed (503).', instance.t)).toBe(
            'A solicitação falhou (503).',
        );
        expect(translateMessage('Custom API detail: XYZ', instance.t)).toBe(
            'Custom API detail: XYZ',
        );
        await instance.changeLanguage('en');
        expect(
            translateMessage('Impressora atualizada com sucesso.', instance.t),
        ).toBe('Printer updated successfully.');
    });

    it.each(supportedLanguages)(
        'uses complete singular and plural coverage messages in %s',
        async (language) => {
            const instance = createInstance();
            await instance.init({
                lng: language,
                resources: translationResources,
            });
            expect(instance.t('excludedInventory', {count: 1})).toBe(
                translationResources[
                    language
                ].translation.excludedInventory_one.replace('{{count}}', '1'),
            );
            expect(instance.t('excludedInventory', {count: 2})).toBe(
                translationResources[
                    language
                ].translation.excludedInventory_other.replace('{{count}}', '2'),
            );
        },
    );
});
