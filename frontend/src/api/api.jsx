import toast from "react-hot-toast"
import { validLink } from "./regex"

const DEBUG = true 
const apiUrl = DEBUG ? "http://localhost:8080" : "https://logit-xyz.herokuapp.com" 

// log in
function login() {
    window.location.replace(`${apiUrl}/auth`)
}

// logs you out
function logout(session) {
    // remove the session
    window.localStorage.removeItem("sessionId")
    window.location.replace(`${apiUrl}/logout?sess=${session}`)
}

// gets the current active session user
async function get_current_user(session) {
    return fetch(`${apiUrl}/me`, {
        method: "GET",
        headers: {
            'Authorization': session
        }
    })
}

function calculate(link, onSuccess, onError) {
    const regex = new RegExp(validLink);
    if (link === "" || link === null || link === undefined || !regex.test(link)) {
        toast.error(
            "enter a valid link", {
            className: "dark:bg-neutral-800 dark:text-neutral-50"
        })
        // premature return
        return;
    }

    fetch(`${apiUrl}/calculate?link=${link}`)
        .then(res => {
            if (res.status === 202) {
                return res.json()
            } else {
                return null
            }
        })
        .then((data) => {
            if (data === null || data.nutrition == null) {
                onError()
            } else {
                onSuccess(data)
            }
        })
}

function create_food(session, recipe) {
    var createBody = {
        foodName: recipe.name,
        servingSize: 1,
        unitId: 304,
        nutrition: {}
    }
    var nutritionPost = {}
    var keys = Object.keys(recipe.nutrition)
    for (var i = 0; i < keys.length; ++i) {
        nutritionPost[keys[i]] = recipe.nutrition[keys[i]].qty
    }
    createBody.nutrition = nutritionPost
    return fetch(`${apiUrl}/create`, {
        method: "POST",
        headers: {
            'Authorization': session
        },
        body: JSON.stringify(createBody)
    })
        
}

function add_log(session, recipe, meal) {
    var logBody = {
        foodName: recipe.name,
        mealTypeId: meal.id,
        amount: 1,
        unitId: 304,
        nutrition: {}
    }
    var nutritionPost = {}
    var keys = Object.keys(recipe.nutrition)
    for (var i = 0; i < keys.length; ++i) {
        nutritionPost[keys[i]] = recipe.nutrition[keys[i]].qty
    }
    logBody.nutrition = nutritionPost
    fetch(`${apiUrl}/log`, {
        method: "POST",
        headers: {
            'Authorization': session
        },
        body: JSON.stringify(logBody)
    })
        .then((res) => {
            if (res.status === 201) {
                toast.success('added to log', {
                    className: "dark:bg-neutral-800 dark:text-neutral-50"
                })
            } else {
                toast.error("couldn't add to log", {
                    className: "dark:bg-neutral-800 dark:text-neutral-50"
                })
            }
        })
}

export {
    login,
    logout,
    get_current_user,
    calculate,
    add_log,
    create_food
}