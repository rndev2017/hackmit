import { Menu } from '@headlessui/react'
import {
    Bars3Icon,
    CalculatorIcon as CalculatorInactiveIcon,
    WrenchScrewdriverIcon as BuilderInactiveIcon,
    QuestionMarkCircleIcon as FAQInactiveIcon,
    MoonIcon as DarkActiveIcon,
    SunIcon as LightActiveIcon,
    ArrowLeftOnRectangleIcon as LoginInactiveIcon,
    ArrowRightOnRectangleIcon as LogoutInactiveIcon,

} from '@heroicons/react/24/solid'
import {
    CalculatorIcon as CalculatorActiveIcon,
    QuestionMarkCircleIcon as FAQActiveIcon,
    WrenchScrewdriverIcon as BuilderActiveIcon,
    MoonIcon as DarkInactiveIcon,
    SunIcon as LightInactiveIcon,
    ArrowLeftOnRectangleIcon as LoginActiveIcon,
    ArrowRightOnRectangleIcon as LogoutActiveIcon,
} from '@heroicons/react/24/outline'
import { NavLink } from 'react-router-dom'
import { useDarkMode } from '../hooks/useDarkMode'
import { login, logout } from '../api/api'

export default function HamburgerMenu({ session, user }) {
    const [isDark, setIsDark] = useDarkMode()

    return (
        <Menu as='div' className='relative'>
            <Menu.Button className={'focus:outline-none'}>
                <Bars3Icon className='text-slate-900 dark:text-white h-6 w-6' />
            </Menu.Button>
            <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y dark:divide-slate-600 divide-slate-200 rounded-md bg-white dark:bg-slate-700 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="px-1 py-1">
                    <Menu.Item>
                        {({ active }) => (
                            <NavLink end to={'/'}
                                className={`${active ? 'bg-cyan-600 dark:bg-cyan-500 text-white' : 'text-slate-900 dark:text-slate-50'
                                    } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                            >
                                {active ? (
                                    <CalculatorActiveIcon
                                        className='text-cyan-400 dark:text-cyan-700 mr-3 h-5 w-5'
                                    />
                                ) : (
                                    <CalculatorInactiveIcon
                                        className="text-cyan-600 dark:text-cyan-500 mr-3 h-5 w-5"
                                        aria-hidden="true"
                                    />
                                )}
                                Calculator
                            </NavLink>
                        )}
                    </Menu.Item>
                    <Menu.Item>
                        {({ active }) => (
                            <NavLink to={'/builder'}
                                className={`${active ? 'bg-cyan-600 dark:bg-cyan-500 text-white' : 'text-slate-900 dark:text-slate-50'
                                    } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                            >
                                {active ? (
                                    <BuilderActiveIcon
                                        className='text-cyan-400 dark:text-cyan-700 mr-3 h-5 w-5'
                                    />
                                ) : (
                                    <BuilderInactiveIcon
                                        className="text-cyan-600 dark:text-cyan-500 mr-3 h-5 w-5"
                                        aria-hidden="true"
                                    />
                                )}
                                Recipe Builder 
                            </NavLink>
                        )}
                    </Menu.Item>
                    <Menu.Item>
                        {({ active }) => (
                            <NavLink to={'/faq'}
                                className={`${active ? 'bg-cyan-600 dark:bg-cyan-500 text-white' : 'text-slate-900 dark:text-slate-50'
                                    } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                            >
                                {active ? (
                                    <FAQActiveIcon
                                        className='text-cyan-400 dark:text-cyan-700 mr-3 h-5 w-5'
                                    />
                                ) : (
                                    <FAQInactiveIcon
                                        className="text-cyan-600 dark:text-cyan-500 mr-3 h-5 w-5"
                                        aria-hidden="true"
                                    />
                                )}
                                FAQ 
                            </NavLink>
                        )}
                    </Menu.Item>
                </div>
                <div className="px-1 py-1">
                    <Menu.Item>
                        {({ active }) => (
                            <button
                                onClick={() => setIsDark(!isDark)}
                                className={`${active ? 'bg-cyan-600 dark:bg-cyan-500 text-white' : 'dark:text-slate-100'
                                    } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                            >
                                {!isDark ? (
                                    active ? (
                                        <DarkActiveIcon
                                            className="text-cyan-400 dark:text-cyan-700 mr-3 h-5 w-5"
                                            aria-hidden="true"
                                        />
                                    ) : (
                                        <DarkInactiveIcon
                                            className="text-cyan-600 dark:text-cyan-500 mr-3 h-5 w-5"
                                            aria-hidden="true"
                                        />
                                    )
                                ) : (
                                    active ? (
                                        <LightActiveIcon
                                            className="text-cyan-400 dark:text-cyan-700 mr-3 h-5 w-5"
                                            aria-hidden="true"
                                        />
                                    ) : (
                                        <LightInactiveIcon
                                            className="text-cyan-600 dark:text-cyan-500 mr-3 h-5 w-5"
                                            aria-hidden="true"
                                        />
                                    )
                                )}
                                {`Switch to ${isDark ? 'Light' : 'Dark'} Theme`}
                            </button>
                        )}
                    </Menu.Item>
                    <Menu.Item>
                        {({ active }) => (
                            <button
                                onClick={() => {
                                    if (user) {
                                        logout(session)
                                    } else {
                                        login()
                                    }
                                }}
                                className={`${active ? 'bg-cyan-600 dark:bg-cyan-500 text-white' : 'dark:text-slate-100'
                                    } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                            >
                                {!user ? (
                                    active ? (
                                        <LoginActiveIcon
                                            className="text-cyan-400 dark:text-cyan-700 mr-3 h-5 w-5"
                                            aria-hidden="true"
                                        />
                                    ) : (
                                        <LoginInactiveIcon
                                            className="text-cyan-600 dark:text-cyan-500 mr-3 h-5 w-5"
                                            aria-hidden="true"
                                        />
                                    )
                                ) : (
                                    active ? (
                                        <LogoutActiveIcon
                                            className="text-cyan-400 dark:text-cyan-700 mr-3 h-5 w-5"
                                            aria-hidden="true"
                                        />
                                    ) : (
                                        <LogoutInactiveIcon
                                            className="text-cyan-600 dark:text-cyan-500 mr-3 h-5 w-5"
                                            aria-hidden="true"
                                        />
                                    )
                                )}
                                {user ? 'Log out' : 'Sign in'}
                            </button>
                        )}
                    </Menu.Item>
                </div>
            </Menu.Items>
        </Menu>
    )
}