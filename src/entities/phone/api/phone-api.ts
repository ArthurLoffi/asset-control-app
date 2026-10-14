import type {Phone, PhoneInput, PhoneSearch} from '../model/types';
import {employeeApi} from '@/entities';
import {createResourceWriter, listEquipment} from '@/shared';

export const phoneApi = {
    async list(search: PhoneSearch, signal: AbortSignal): Promise<Phone[]> {
        return listEquipment<Phone>(
            '/phones',
            search,
            signal,
            employeeApi.findIdsByName,
        );
    },

    ...createResourceWriter<Phone, PhoneInput>('/phones'),
};
