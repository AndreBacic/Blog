import { createContext } from "react"

const HaveSearchBarContext = createContext<[boolean, ((h: boolean) => void)]>([true, (() => { })])
export default HaveSearchBarContext