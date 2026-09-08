import { ROUTES } from "@/shared"
import { IconDeviceDesktop, IconDeviceLaptop, IconDeviceMobile, IconHome, IconMail, IconPrinter, IconUser, type Icon } from "@tabler/icons-react"

export type SidebarItemsType = {
    icon: Icon,
    text: string,
    link: string
}

export const sidebarItems: SidebarItemsType[] = [
    // Home
    {
        icon: IconHome,
        text: "Home",
        link: ROUTES.HOME,
    },
    // Employees
    {
        icon: IconUser,
        text: "Employees",
        link: ROUTES.EMPLOYEES,
    },
    // Machines
    {
        icon: IconDeviceLaptop,
        text: "Machines",
        link: ROUTES.MACHINES,
    },
    // Monitors
    {
        icon: IconDeviceDesktop,
        text: "Monitors",
        link: ROUTES.MONITORS,
    },
    // Phones
    {
        icon: IconDeviceMobile,
        text: "Phones",
        link: ROUTES.PHONES,
    },
    // Printers
    {
        icon: IconPrinter,
        text: "Printers",
        link: ROUTES.PRINTERS,
    },
    // Emails
    {
        icon: IconMail,
        text: "Emails",
        link: ROUTES.EMAILS,
    }
]