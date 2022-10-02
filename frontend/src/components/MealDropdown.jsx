import { Fragment } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/solid'

export const mealTypes = [
  { name: 'Breakfast', id: 1 },
  { name: 'Morning Snack', id: 2 },
  { name: 'Lunch', id: 3 },
  { name: 'Afternoon Snack', id: 4 },
  { name: 'Dinner', id: 5 },
  { name: 'Any time', id: 7 },
]

export default function MealDropdown({ selected, onChange }) {

  return (
    <div className="w-5/6">
      <Listbox value={selected} onChange={onChange}>
        <div className="relative mt-1">
          <Listbox.Button className="relative w-full cursor-default rounded-lg dark:bg-slate-800 dark:text-slate-50 bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
            <span className="block truncate">{selected.name}</span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                className="h-5 w-5 text-slate-400"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md dark:bg-slate-800 dark:text-slate-50 bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {mealTypes.map((meal, mealIdx) => (
                <Listbox.Option
                  key={mealIdx}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 px-5 mx-2 rounded-md  ${
                      active ? 'dark:bg-cyan-700 bg-cyan-100 dark:text-cyan-200 text-cyan-900' : 'dark:text-slate-50 text-slate-900'
                    }`
                  }
                  value={meal}
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? 'font-medium' : 'font-normal'
                        }`}
                      >
                        {meal.name}
                      </span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-cyan-600">
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  )
}
