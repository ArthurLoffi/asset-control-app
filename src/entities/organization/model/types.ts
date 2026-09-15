export type OrganizationOption = {
    id: number;
    name: string;
};

export type OrganizationLists = {
    branches: OrganizationOption[];
    departments: OrganizationOption[];
};
