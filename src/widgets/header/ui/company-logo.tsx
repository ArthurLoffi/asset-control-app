import {Box, Image} from '@mantine/core';
import {useState, type ReactElement} from 'react';
import {useTranslation} from 'react-i18next';
import {companyLogoSource} from '../model/company-logo';

type CompanyLogoProps = {
    marginLeft?: number;
    source?: string;
};

const CompanyLogo = ({
    marginLeft = 8,
    source = companyLogoSource,
}: CompanyLogoProps): ReactElement => {
    const {t} = useTranslation();
    const [loadFailed, setLoadFailed] = useState(false);

    if (loadFailed || source === undefined || source.length === 0) {
        return <></>;
    }

    const handleError = (): void => {
        setLoadFailed(true);
    };

    return (
        <Box visibleFrom="sm">
            <Image
                alt={t('companyLogo', {defaultValue: 'Company logo'})}
                fit="contain"
                h={40}
                maw={180}
                ml={marginLeft}
                onError={handleError}
                src={source}
                w="auto"
            />
        </Box>
    );
};

export default CompanyLogo;
