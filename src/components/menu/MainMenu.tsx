'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { LanguageCode } from '@/constants/languages'
import { getTranslation, UITranslation } from '@/translations'
import { UserRole } from '@prisma/client'

interface MainMenuProps {
  lang: LanguageCode
}

interface MenuOption {
  id: string
  icon: string
  titleKey: keyof UITranslation['mainMenu']['options']
  href: string
  roles: UserRole[]
}

export default function MainMenu({ lang }: MainMenuProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const t = getTranslation(lang)

  if (!session?.user) {
    router.push(`/${lang}/login`)
    return null
  }

  const menuOptions: MenuOption[] = [
    {
      id: 'establishment_admin',
      icon: '🧑‍💼',
      titleKey: 'establishmentAdmin',
      href: `/admin/establishment/${session.user.establishmentId}`,
      roles: [UserRole.establishment_admin],
    },
    {
      id: 'employee_orders',
      icon: '🖥️',
      titleKey: 'employeeOrders',
      href: `/employee/establishment/${session.user.establishmentId}`,
      roles: [UserRole.waiter, UserRole.cook],
    },
    {
      id: 'general_admin',
      icon: '👑',
      titleKey: 'generalAdmin',
      href: '/admin/general',
      roles: [UserRole.general_admin],
    },
    {
      id: 'restaurant_menu',
      icon: '📋',
      titleKey: 'restaurantMenu',
      href: `/${lang}/restaurant/${session.user.establishmentId}/menu`,
      roles: [
        UserRole.client,
        UserRole.waiter,
        UserRole.cook,
        UserRole.establishment_admin,
        UserRole.general_admin,
      ],
    },
  ]

  const availableOptions = menuOptions.filter((option) =>
    option.roles.includes(session.user.role as UserRole)
  )

  const handleNavigation = (href: string) => {
    router.push(href)
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: `/${lang}/login` })
  }

  return (
    <div className="main-menu-container">
      <div className="main-menu-welcome">
        <h1 className="main-menu-title">{t.mainMenu.welcome}</h1>
        <p className="main-menu-subtitle">{t.mainMenu.subtitle}</p>
      </div>

      <div className="category-nav-container">
        {availableOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => handleNavigation(option.href)}
            className="category-nav-item"
          >
            <div className="main-menu-icon-container">
              <span className="main-menu-option-icon">{option.icon}</span>
            </div>
            <h3 className="main-menu-option-title">{t.mainMenu.options[option.titleKey].title}</h3>
            <p className="main-menu-option-description">
              {t.mainMenu.options[option.titleKey].description}
            </p>
          </button>
        ))}
      </div>

      <div className="main-menu-logout">
        <button onClick={handleLogout} className="main-menu-logout-btn">
          {t.mainMenu.logout}
        </button>
      </div>
    </div>
  )
}
