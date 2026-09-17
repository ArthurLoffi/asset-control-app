import type {ReactElement} from 'react';
import {useTranslation} from 'react-i18next';
import type {SidebarItemsType} from '../model/items';
import {Li, NavLink} from './styles';

type SidebarItemsProp = {
    item: SidebarItemsType;
    onClick?: () => void;
};

const SidebarItem = ({item, onClick}: SidebarItemsProp): ReactElement => {
    const {t} = useTranslation();
    return (
        <Li>
            <NavLink onClick={onClick} to={item.link}>
                <item.icon
                    width={20}
                    height={20}
                    stroke={1.5}
                    color="#ffffff"
                />
                {t(`navigation.${item.text.toLowerCase()}`)}
            </NavLink>
        </Li>
    );
};

export default SidebarItem;
