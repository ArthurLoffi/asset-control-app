const inventoryValueKeys: Record<string, string> = {
    Bom: 'good',
    'Com defeito': 'defective',
    'Em uso': 'inUse',
    Manutenção: 'maintenance',
    'Sem uso': 'noUse',
    'Uso temporário': 'temporary',
    'Uso temporÃ¡rio': 'temporary',
    'Só chip': 'simOnly',
    'SÃ³ chip': 'simOnly',
    'Sem chip': 'noSim',
    Celular: 'phone',
    Notebook: 'notebook',
    PC: 'pc',
    Novo: 'new',
    Ruim: 'bad',
};

type InventoryValue = string | null | undefined; // eslint-disable-line @typescript-eslint/no-restricted-types

export function translateInventoryValue(
    value: InventoryValue,
    translate: (key: string) => string,
): string | undefined {
    if (value === null || value === undefined) {
        return undefined;
    }

    const key = inventoryValueKeys[value];
    return key === undefined ? value : translate(`common.values.${key}`);
}
