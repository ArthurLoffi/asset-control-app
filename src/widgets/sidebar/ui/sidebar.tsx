import type {ReactElement} from 'react';
import {sidebarItems} from '../model/items';
import {Wrapper} from './styles';
import SidebarItem from './sidebar-item';

type SidebarProps = {
    onNavigate?: () => void;
};

const Sidebar = ({onNavigate}: SidebarProps): ReactElement => (
    <Wrapper $open={true}>
        {sidebarItems?.map((item) => (
            <SidebarItem key={item.link} item={item} onClick={onNavigate} />
        ))}
    </Wrapper>
);

export default Sidebar;
