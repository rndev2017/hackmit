import React from 'react'
import Accordian from '../components/Accordian'

const faq = [
    {
        title: "What is logit?",
        content: `logit is the easiest way to analyze online recipes and import them
        into the FitBit Mobile/Desktop applications.`
    },
    {
        title: "How does logit work?",
        content: `logit has two main features: a calculator and recipe builder.
        The calculator allows you to paste a link to any online recipe and get the
        nutrition facts into the FitBit app hassle free. logit can analyze close to 90%
        of all recipes on the internet. "But what if I have a homemade recipe?" 
        This is why we built "Recipe Builder"! Simply search for ingredients, and 
        we'll accurately tally up all the nutrition facts, and then simply 
        import it into the FitBit app. New feature,same design & interface.`
    },
    {
        title: "Is logit free?",
        content: `Yep, it will remain that way until the end of time.`
    },
    {
        title: "Will my data be private and safe?",
        content: `Although we have access to your FitBit profile after sign in, 
        we do not store that information in any database or any similar storage
        mechanism. All your data is provided and managed by FitBit.`
    },
    {
        title: "Is logit affiliated with FitBit?",
        content: `No. My name is Rohan Nagavardhan, a college junior studying
        Computer Science at University of Michigan. logit is a product that I've building
        by myself in my spare time. It's been a super rewarding experience and I'm
        so thrilled at all the support I've recieved so far!` 
    },
]

function FAQ() {
    return (
        <div className='bg-white dark:bg-slate-900 h-full w-full flex flex-col items-center'>
            <div className='flex flex-col items-center text-slate-900 dark:text-slate-50 my-12'>
                <p className='font-semibold mb-3 text-xs md:text-sm lg:text-base'>FAQs</p>
                <p className='text-2xl md:text-3xl lg:text-4xl'>Frequently asked questions</p>
                <p className='dark:text-slate-500 text-slate-400 mt-6 text-sm md:text-base lg:text-lg'>Have questions? We're here to help.</p>
            </div>
            <div className='divide-y-2 divide-slate-300 dark:divide-slate-500 w-3/4 md:w-1/2 mb-10'>
                {faq.map((q, idx) => <Accordian key={idx} title={q.title} content={q.content} />)}
            </div>
            <div className='w-5/6 md:w-1/3 text-xs md:text-sm lg:text-base text-center dark:text-slate-500 text-slate-400'>
                <p>
                    If this app is
                    exceeding your expectations, and you can afford to help support its ongoing development,
                    then I would greatly appreciate your consideration. Thank you!
                </p>
                <div className="w-full flex justify-center my-5">
                    <a 
                        href='https://www.buymeacoffee.com/rnagavar'
                        target={'_blank'}
                        className='block w-1/3 p-2 cursor-pointer bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-md hover:bg-slate-200'>Support</a>
                </div>
            </div>
        </div>
    )
}

export default FAQ