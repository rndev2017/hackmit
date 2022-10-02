import { Transition, Dialog } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/solid';
import { Fragment, useState } from 'react';
import { add_log } from '../api/api';
import { useSession } from '../hooks/useSession';
import MealDropdown, { mealTypes } from './MealDropdown';

function ChooseMealDialog ({ recipe, open, onClose }) {
    const [selected, setSelected] = useState(mealTypes[0])
    const [session] = useSession()

    return (
        <Transition appear show={open} as={Fragment}>
            <Dialog
                open={open}
                onClose={onClose}
                className="relative z-50"
            >
                {/* The backdrop, rendered as a fixed sibling to the panel container */}
                <div className="fixed inset-0 bg-black/50" aria-hidden="true" />

                {/* Full-screen scrollable container */}
                <div className="fixed inset-0 flex items-center justify-center">
                    {/* Container to center the panel */}
                    <div className="flex min-h-full items-center justify-center">
                        {/* The actual dialog panel  */}
                        <Dialog.Panel className="w-[16rem] md:w-[25rem] lg:w-[30rem] flex flex-col justify-center items-center dark:bg-slate-900 bg-white rounded-xl p-3">
                            <button onClick={onClose} className='w-full flex justify-end'>
                                <XMarkIcon className='h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 dark:text-slate-50 text-slate-900'/>
                            </button>
                            <Dialog.Title className="font-semibold text-xl md:text-2xl lg:text-3xl dark:text-slate-50">
                                Log recipe 
                            </Dialog.Title>
                            <Dialog.Description className="text-lg md:text-xl text-slate-800 dark:text-slate-500 my-3 max-w-xs lg:max-w-sm text-center">
                                When did you make this recipe?
                            </Dialog.Description>
                            <MealDropdown selected={selected} onChange={setSelected}/>
                            <button
                                onClick={() => {
                                    add_log(session, recipe, selected)
                                    onClose()
                                }}
                                className='w-5/6 my-5 p-2 lg:p-3 rounded-lg text-slate-50 font-semibold dark:bg-cyan-500 dark:hover:bg-cyan-600 bg-cyan-600 hover:bg-cyan-700'>
                                    Add to log 
                            </button>
                        </Dialog.Panel>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default ChooseMealDialog; 