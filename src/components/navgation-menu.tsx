"use client"

import * as React from "react"
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from "./ui/menubar"
import Link from "next/link";

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
        href: "/history",
      },
      {
        title: "Registrar",
        href: "/history/create",
      }
    ]
  },
]

export default function HeaderNavigationMenu() {

  return (
    <Menubar className="border-0 shadow-none bg-transparent">
      {menus.map((menu) => {
        if (!menu.submenu) {
          return (
            <MenubarMenu key={menu.title}>
              <Link href={menu.href} passHref>
                <MenubarTrigger>{menu.title}</MenubarTrigger>
              </Link>
            </MenubarMenu>
          )
        }
        return (
          <MenubarMenu key={menu.title}>
            <MenubarTrigger>{menu.title}</MenubarTrigger>
            <MenubarContent>
              {menu.submenu.map((submenu, key) => (
                <Link key={key} href={submenu.href} passHref>
                  <MenubarItem>
                    {submenu.title}
                  </MenubarItem>
                </Link>
              ))}
            </MenubarContent>
          </MenubarMenu>
        )
      })}
    </Menubar>
  )
}
