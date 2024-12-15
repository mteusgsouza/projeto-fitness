"use client"

import * as React from "react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { ListOrdered } from "lucide-react"

type TMenu = {
  title: string;
  href: string;
  submenu?: TMenu[];
}

const menus: TMenu[] = [
  {
    title: "Home",
    href: "/",
  },
  {
    title: "Treinos",
    href: "",
    submenu: [
      {
        title: "Listagem",
        href: "/training",
      },
      {
        title: "Cadastrar",
        href: "/training/create",
      }
    ]
  },
  {
    title: "Histórico",
    href: "",
    submenu: [
      {
        title: "Listagem",
        href: "/training-history",
      },
      {
        title: "Cadastrar",
        href: "/training-history/create",
      }
    ]
  },
  {
    title: "Meu perfil",
    href: "/my-profile",
  },
]

export default function HeaderNavigationMenu() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        {menus.map((menu, key) => {
          if (!menu.submenu) {
            return (
              <NavigationMenuItem key={key}>
                <Link href={menu.href} legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    {menu.title}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            )
          }
          return (
            <NavigationMenuItem key={key}>
              <NavigationMenuTrigger>{menu.title}</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="flex flex-col gap-2 p-4">
                  {menu.submenu.map((submenu) => (
                    <ListItem
                      key={submenu.title}
                      title={submenu.title}
                      href={submenu.href} />
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          )
        })}
      </NavigationMenuList>
    </NavigationMenu>
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none flex gap-1 items-center">
            <ListOrdered />
            {title}
          </div>
          <p>{children}</p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"
