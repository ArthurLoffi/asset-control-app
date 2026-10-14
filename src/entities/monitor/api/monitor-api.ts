import type {Monitor, MonitorInput, MonitorSearch} from '../model/types';
import {employeeApi} from '@/entities';
import {createResourceWriter, listEquipment} from '@/shared';

export const monitorApi = {
    async list(search: MonitorSearch, signal: AbortSignal): Promise<Monitor[]> {
        return listEquipment<Monitor>(
            '/monitors',
            search,
            signal,
            employeeApi.findIdsByName,
        );
    },

    ...createResourceWriter<Monitor, MonitorInput>('/monitors'),
};
