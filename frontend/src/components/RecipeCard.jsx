import { ExclamationTriangleIcon, ShareIcon } from "@heroicons/react/24/outline"
import { LinkIcon } from "@heroicons/react/24/solid"
import { useEffect, useRef, useState } from "react";

function HostLink({ url }) {
    try {
        let domain = (new URL(url));
        domain = domain.hostname.replace('www.', '');
        return (
            <a
                className={`text-cyan-500 hover:text-cyan-600 font-medium 
                    flex items-center text-sm lg:text-base`}
                target={'_blank'}
                href={url}>
                {domain}
            </a>
        )
    } catch (error) {
        return null    
    }
}

function RecipeCard({ loading, error, data, onLog, onCreate }) {
    if (loading) {
        return (
            <div className="dark:bg-slate-800 bg-white flex flex-col shadow-sm p-8 rounded-lg mb-12">
                {/* Header */}
                <div className="flex flex-row w-full md:space-x-6 animate-pulse">
                    <div className="hidden md:h-44 md:w-44 md:block bg-slate-200 rounded-lg" />
                    <div className="flex flex-col flex-1 space-y-2">
                        <div className="h-7 w-1/2 bg-slate-200 rounded" />
                        <div className="h-4 w-1/5 bg-slate-200 rounded"/>
                        <div className="h-full w-3/4 bg-slate-200 rounded-lg"/>
                    </div>
                </div>

                {/* ingredients */}
                <div className="my-5 space-y-3 animate-pulse">
                    <div className="h-5 w-1/4 bg-slate-200 rounded-md" />
                    <div className="h-32 w-3/4 bg-slate-200 rounded-lg"/>
                </div>
                {/* nutrients */}
                <div className="my-5 space-y-3 animate-pulse">
                    <div className="h-5 w-1/4 bg-slate-200 rounded-md" />
                    <div className="h-36 w-3/4 bg-slate-200 rounded-lg"/>
                </div>
                <div className="flex flex-col md:flex-row my-5 space-y-4 space-x-0 md:space-x-8 md:space-y-0 animate-pulse">
                    <div className="w-full md:w-1/2 p-2 lg:p-3 h-16 bg-slate-200 rounded-lg" />
                    <div className="w-full md:w-1/2 p-2 lg:p-3 h-16 bg-slate-200 rounded-lg" />
                </div>
            </div>
        )
    } else if (error) {
        return (
            <div className="dark:bg-slate-800 bg-white h-1/2 w-full flex flex-col justify-center items-center p-8 rounded-lg text-center">
                <ExclamationTriangleIcon className=" text-yellow-500 dark:text-yellow-400 h-20 w-20 md:h-[5.5rem] md:w-[5.5rem] lg:h-24 lg:w-24 " />
                <p className="text-slate-900 text-lg md:text-xl lg:text-2xl dark:text-slate-50 font-semibold">
                    Couldn't calculate nutrition facts
                </p>
                <p className="text-slate-700 dark:text-slate-400 text-base md:text-lg lg:text-xl max-w-lg text-center my-3">
                    We don't know what went wrong, just <span className="italic">yet</span>.
                    But we're working extremely hard to find out!
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base lg:text-lg max-w-lg text-center my-3">
                    In the meantime, please try another recipe.
                </p>
            </div>
        )
    } else {
        return (
            <div className="dark:bg-slate-800 bg-white flex flex-col shadow-sm p-8 rounded-lg">
                {/* Header */}
                <div className="flex flex-row w-full md:space-x-6">
                    <div className="hidden md:h-44 md:w-44 md:block">
                        <img className="h-full w-full aspect-square object-cover rounded-lg" src={data?.image} />
                    </div>
                    <div className="flex flex-col flex-1">
                        <p className="font-semibold text-lg md:text-xl lg:text-2xl" dangerouslySetInnerHTML={{__html:data?.name}} />
                        <HostLink url={data.mainEntityOfPage}/>
                        <p
                            className="text-sm md:text-base lg:text-lg text-slate-500 dark:text-slate-400 my-5 line-clamp-3"
                            dangerouslySetInnerHTML={{ __html: data?.description }} />
                    </div>
                    {/* <ShareIcon className="h-4 w-4 md:h-5 md:w-5 hover:cursor-pointer text-slate-700 hover:text-slate-900 dark:text-slate-50 dark:hover:text-slate-300" /> */}
                </div>

                {/* ingredients */}
                <div className="my-3">
                    <p className="text-base md:text-lg lg:text-xl font-medium tracking-tight mb-2">Ingredients</p>
                    <ol role="list" className="marker:text-cyan-400 list-disc pl-5 space-y-2 text-slate-500 dark:text-slate-400 text-sm md:text-base lg:text-lg">
                        {data?.recipeIngredient.map((ingredient, idx) => {
                            return (
                                <li key={idx} dangerouslySetInnerHTML={{__html: ingredient}} />
                            )
                        })}
                    </ol>
                </div>
                {/* nutrients */}
                <div className="my-3 w-full md:w-3/4">
                    <p className="text-base md:text-lg lg:text-xl font-medium tracking-tight mb-2">
                        Nutrition Facts{' '}
                        <span className="text-slate-400 dark:text-slate-400 text-xs md:text-sm lg:text-base ml-1">(per serving)</span>
                    </p>
                    {Object.entries(data?.nutrition).map(([key, value], index) => {
                        return (
                            <div key={index} className="flex justify-between text-sm md:text-base lg:text-lg">
                                <p className="text-semibold">{value.name}</p>
                                <p className="text-slate-500 dark:text-slate-400">{value.qty} {value.unit}</p>
                            </div>
                        )
                    })}
                </div>
                <div className="flex flex-col md:flex-row my-5 space-y-4 space-x-0 md:space-x-8 md:space-y-0 text-sm md:text-base lg:text-lg">
                    <button
                        onClick={onLog}
                        disabled={data?.example}
                        className={`bg-cyan-600 hover:bg-cyan-700
                        dark:bg-cyan-500 dark:hover:bg-cyan-600 w-full md:w-1/2 
                        p-2 lg:p-3 text-semibold text-slate-50 rounded-md lg:rounded-lg
                        disabled:cursor-not-allowed 
                        dark:disabled:hover:bg-cyan-500
                        disabled:hover:bg-cyan-600`}>
                        Log food
                    </button>
                    <button
                        onClick={onCreate}
                        disabled={data?.example}
                        className={`border-2 border-cyan-600 hover:border-cyan-700
                    hover:bg-cyan-200/40 dark:hover:bg-cyan-100/10 dark:border-cyan-500 
                        dark:hover:border-cyan-600 w-full md:w-1/2 p-2 lg:p-3 text-semibold 
                        text-slate-800 dark:text-slate-50 rounded-md lg:rounded-lg
                        disabled:cursor-not-allowed disabled:bg-cyan-200/0
                        disabled:border-cyan-600 disabled:dark:bg-cyan-100/0
                        disabled:dark:border-cyan-500`}>
                        Create food
                    </button>
                </div>
            </div>
        )
    }
}


export default RecipeCard 