import { useDarkMode } from "../hooks/useDarkMode";
import { SunIcon } from '@heroicons/react/24/outline'
import { MoonIcon } from '@heroicons/react/24/solid'

function Switcher({ className }) {
    const [isDark, setIsDark] = useDarkMode()
    
    if (!isDark) {
        return (
            <SunIcon 
                onClick={() => setIsDark(!isDark)}
                className={className} /> 
        ) 
    } else {
        return (
            <MoonIcon
                onClick={() => setIsDark(!isDark)}
                className={className}/>
        )
    }
}

export default Switcher