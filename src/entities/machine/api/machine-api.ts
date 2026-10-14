import type {Machine, MachineInput, MachineSearch} from '../model/types';
import {employeeApi} from '@/entities';
import {createResourceWriter, listEquipment} from '@/shared';

export const machineApi = {
    async list(search: MachineSearch, signal: AbortSignal): Promise<Machine[]> {
        return listEquipment<Machine>(
            '/machines',
            search,
            signal,
            employeeApi.findIdsByName,
        );
    },

    ...createResourceWriter<Machine, MachineInput>('/machines'),
};
