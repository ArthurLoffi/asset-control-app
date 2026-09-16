import {Box, Image} from '@mantine/core';
import {useState, type ReactElement} from 'react';
import {companyLogoSource} from '../model/company-logo';

type CompanyLogoProps = {
    source?: string;
};

const CompanyLogo = ({
    source = companyLogoSource,
}: CompanyLogoProps): ReactElement => {
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
                alt="Company logo"
                fit="contain"
                h={40}
                maw={180}
                ml={8}
                onError={handleError}
                src={source}
                w="auto"
            />
        </Box>
    );
};

export default CompanyLogo;
