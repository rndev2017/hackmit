import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import NavBar from "./components/NavBar"
import App from "./pages/Home"
import { useSession } from "./hooks/useSession"
import { useState, useEffect } from "react"
import { get_current_user } from "./api/api"
import FAQ from "./pages/FAQ"
import RecipeBuilder from "./pages/RecipeBuilder"
import NotFoundPage from "./pages/404"

function Root() {
    const [session] = useSession()
    const [user, setUser] = useState(null)

    // read the sess query parameter
    // validate it by sending a backend request to me
    // change nav to say log out when user is not null
    // then also check if a recipe is sitting in local storage
    useEffect(() => {
        if (session != null) {
            // get the current user
            get_current_user(session)
                .then((res) => {
                    if (res.status === 200) {
                        return res.json()
                    } else if (res.status === 401) {
                        // if the current session stored is invalid, remove it
                        window.localStorage.removeItem("sessionId")
                    }

                    // if none of the cases above fit, just return null
                    return null
                })
                .then((data) => {
                    setUser(data)
                })
        }
    }, [session])

    return (
        <div className="bg-slate-100 dark:bg-slate-900 dark:text-white grid grid-rows-[75px_1fr] h-screen overflow-x-hidden">
            {/* Navbar here */}
            <Toaster position="top-center" reverseOrder />
            <BrowserRouter>
                <NavBar user={user} />
                <Routes>
                    <Route path="/" element={<App user={user}/>} />
                    <Route path="/builder" element={<RecipeBuilder />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </BrowserRouter>
        </div>
    )

}

export default Root 