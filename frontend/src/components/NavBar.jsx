import React from 'react'
import { Link, NavLink } from 'react-router-dom'
import { login, logout } from '../api/api'
import { useSession } from '../hooks/useSession'
import HamburgerMenu from './HamburgerMenu'
import Example from './HamburgerMenu'
import Logo from './Logo'
import Switcher from './Switcher'

function Nav({ user }) {
    const [session] = useSession()

    const linkStyles = ({ isActive }) => (isActive ? 
        'font-medium text-cyan-600 dark:text-cyan-400' : 
        'hover:text-slate-700 dark:hover:text-slate-300' 
    )
    // TODO: Check this out to preserve the sess id 
    // https://github.com/remix-run/react-router/issues/2185 
    return (
        <div className="bg-white border-b-[1.25px] border-slate-200 dark:bg-slate-900 dark:border-slate-700 flex flex-row justify-between items-center px-2 md:px-4 lg:px-6">
            <Logo />
            <nav className='hidden md:flex'>
                <ul className='flex space-x-8 md:space-x-10 lg:space-x-12'>
                    <li>
                        <NavLink end className={linkStyles} to={'/'}>
                            Calculator
                        </NavLink>
                    </li>
                    <li>
                        <NavLink className={linkStyles} to={'/builder'}>
                            Recipe Builder 
                        </NavLink>
                    </li>
                    <li>
                        <NavLink className={linkStyles} to={'/faq'}>
                            FAQ 
                        </NavLink>
                    </li>
                </ul>
            </nav>
            {/* Default Signing and Dark Mode Toggle (Medium -> Large screens) */}
            <div className='hidden md:flex md:flex-row md:items-center md:space-x-8'>
                {!user && <button
                    onClick={login}
                    className={`text-sm lg:text-base text-slate-800 
                        hover:text-slate-600 dark:text-slate-50 
                        dark:hover:text-slate-300`}>
                    Sign In
                </button>}
                {user && <button
                    onClick={() => logout(session)}
                    className={`text-sm lg:text-base text-slate-800 
                        hover:text-slate-600 dark:text-slate-50 
                        dark:hover:text-slate-300`}>
                    Log out
                </button>}
                <Switcher
                    className={`h-5 w-5 md:h-6 md:w-6 lg:h-7 lg:w-7 dark:text-slate-200 text-slate-800 
                hover:cursor-pointer hover:text-slate-600 dark:hover:text-slate-50`} />
                {user && <div className='h-6 w-6 md:h-7 md:w-7 lg:h-8 lg:w-8'>
                    <a target={'_blank'} href={`https://www.fitbit.com/user/${user.user_id}`}>
                        <img
                            className="object-cover rounded-full border-[0.5px] border-slate-300 dark:border-0"
                            src={user.profile.avatar640} />
                    </a>
                </div>}
            </div>
            {/* Mobile Dropdown for Navigation and Sign In and Toggling themes */}
            <div className='md:hidden pt-1'>
                <HamburgerMenu session={session} user={user}/>
            </div>
        </div>
    )
}

export default Nav