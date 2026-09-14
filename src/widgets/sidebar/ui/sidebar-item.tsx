import type {ReactElement} from 'react';
import type {SidebarItemsType} from '../model/items';
import {Li, NavLink} from './styles';

type SidebarItemsProp = {
    item: SidebarItemsType;
    onClick?: () => void;
};

const SidebarItem = ({item, onClick}: SidebarItemsProp): ReactElement => (
    <Li>
        <NavLink onClick={onClick} to={item.link}>
            <item.icon width={20} height={20} stroke={1.5} color="#ffffff" />
            {item?.text}
        </NavLink>
    </Li>
);

export default SidebarItem;
