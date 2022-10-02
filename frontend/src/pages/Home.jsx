import { useState, useEffect } from "react"
import { calculate, create_food, get_current_user } from "../api/api"
import { example } from "../api/exampleRecipe"
import RecipeCard from "../components/RecipeCard"
import Nav from "../components/NavBar"
import RecipeLinkForm from "../components/RecipeLinkForm"
import { useSafeLocalStorage } from "../hooks/useSafeLocalStorage"
import { useSession } from "../hooks/useSession"
import toast, { Toaster } from "react-hot-toast"
import AuthorizeAppDialog from "../components/AuthorizeAppDialog"
import ChooseMealDialog from "../components/ChooseMealDialog"

function App({ user }) {
  const [session] = useSession()
  const [recipe, setRecipe] = useSafeLocalStorage("recipe", example)
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [isAuthorizeDialogOpen, setIsAuthorizeDialogOpen] = useState(false)
  const [isMealDialogOpen, setIsMealDialogOpen] = useState(false)


  function onCalculate() {
    // use a javascript closure in order
    // to get around the fact that link's state
    // is contained within the child component
    return function (link) {
      setIsLoading(true)
      calculate(
        link,
        (data) => {
          toast.success(
            "nutrition facts calculated", {
            className: "dark:bg-slate-800 dark:text-slate-50"
          }
          )
          setRecipe(data)
          setIsError(false)
        },
        () => {
          // todo: send notification
          toast.error(
            "unable to calculate nutrition facts", {
            className: "dark:bg-slate-800 dark:text-slate-50"
          })
          setRecipe(example)
          setIsError(true)
        }
      )
      setIsLoading(false)
    }
  }

  function onLog() {
    if (user === null) {
      setIsAuthorizeDialogOpen(true)
    } else {
      setIsMealDialogOpen(true)
    }
  }

  function onCreate() {
    if (user === null) {
      setIsAuthorizeDialogOpen(true)
    } else {
      // make api call
      create_food(session, recipe)
        .then((res) => {
          if (res.status === 201) {
            toast.success("created food", {
              className: "dark:bg-slate-800 dark:text-slate-50"
            })
          } else {
            toast.error("couldn't create food", {
              className: "dark:bg-slate-800 dark:text-slate-50"
            })
          }
        })
    }
  }

  return (
    <>
      <AuthorizeAppDialog open={isAuthorizeDialogOpen} onClose={() => setIsAuthorizeDialogOpen(false)} />
      <ChooseMealDialog recipe={recipe} open={isMealDialogOpen} onClose={() => setIsMealDialogOpen(false)} />
      <div className="flex flex-col w-[85%] lg:w-[55%] justify-self-center space-y-10 my-10">
        <RecipeLinkForm onSubmit={onCalculate()} />
        <RecipeCard
          loading={isLoading}
          error={isError}
          data={recipe}
          onLog={onLog}
          onCreate={onCreate}
        />
      </div>
    </>
  )
}

export default App
