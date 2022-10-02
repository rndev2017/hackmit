import React from 'react'

function Logo() {
  return (
    <div 
        className='text-xl md:text-2xl lg:text-3xl dark:text-neutral-50 font-semibold flex flex-row items-center'>
        <img 
            className='mx-2 h-5 w-5 md:h-6 md:w-6 lg:h-7 lg:w-7 -rotate-[135deg]' 
            src="/images/logo.png" />
        <p>logit</p>
    </div>
  )
}

export default Logo