import { Transition, Dialog } from '@headlessui/react'
import { XMarkIcon, ShieldExclamationIcon } from '@heroicons/react/24/solid';
import { Fragment } from 'react';
import { login } from '../api/api';

function AuthorizeAppDialog({ open, onClose }) {
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
                        <Dialog.Panel className="w-[16rem] md:w-[25rem] lg:w-[30rem] flex flex-col items-center dark:bg-slate-900 bg-white rounded-xl text-center p-4">
                            <button onClick={onClose} className='w-full flex justify-end'>
                                <XMarkIcon className='h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 dark:text-slate-50 text-slate-900' />
                            </button>
                            <ShieldExclamationIcon className="my-3 text-green-500 h-20 w-20 md:h-[5.5rem] md:w-[5.5rem] lg:h-24 lg:w-24 " />
                            <Dialog.Title className="font-semibold text-xl md:text-2xl lg:text-3xl dark:text-slate-50">
                                Authorize logit
                            </Dialog.Title>
                            <Dialog.Description className="text-lg md:text-xl text-slate-800 dark:text-slate-500 my-3 max-w-xs lg:max-w-sm">
                                In order to use logit, you{' '}
                                <span className='font-semibold'>must</span>
                                {' '}authorize us to edit your Fitbit food logs on
                                your behalf.
                            </Dialog.Description>
                            <button
                                onClick={login}
                                className='w-5/6 p-2 lg:p-3 my-5 rounded-lg text-slate-50 font-semibold dark:bg-cyan-500 dark:hover:bg-cyan-600 bg-cyan-600 hover:bg-cyan-700'>
                                Authorize
                            </button>
                        </Dialog.Panel>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default AuthorizeAppDialog