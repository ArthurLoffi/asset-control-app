import type {ReactElement} from 'react';
import {sidebarItems} from '../model/items.js';
import {Wrapper} from './styles.js';
import SidebarItem from './sidebar-item.js';

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
