import { MinusCircleIcon, PlusCircleIcon } from '@heroicons/react/24/outline'
import React from 'react'
import { useState } from 'react'

function Accordian({ title, content }) {
    const [isActive, setIsActive] = useState(false)

    return (
        <div onClick={() => setIsActive(!isActive)} className='py-5 px-2 hover:cursor-pointer dark:hover:bg-slate-500/10 hover:bg-slate-50/70'>
            <div className='flex justify-between items-center'>
                <p className='text-sm md:text-base lg:text-xl'>{title}</p>
                {isActive && <MinusCircleIcon onClick={() => setIsActive(!isActive)} className='h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6' />}
                {!isActive && <PlusCircleIcon onClick={() => setIsActive(!isActive)} className='h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6' />}
            </div>
            {isActive && <div className='mt-4 dark:text-slate-500 text-slate-400 selection:bg-cyan-50/10 text-xs md:text-sm lg:text-base'>{content}</div>}
        </div>
    )
}

export default Accordian