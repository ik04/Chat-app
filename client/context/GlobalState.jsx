import React, { useEffect, useState } from "react"
import { GlobalContext } from "./GlobalContext"
import axios from "axios"

const GlobalState = (props) => {
  const [name, setName] = useState()
  const [userUuid, setUuid] = useState()
  const [email, setEmail] = useState()
  const url = "http://localhost:8000/api/user-data"

  useEffect(() => {
    getUserData()
  }, [])

  const getUserData = async () => {
    try {
      const resp = await axios.get(url)
      console.log(resp)
      setName(resp.data.user.name)
      setUuid(resp.data.user.user_id)
      setEmail(resp.data.user.email)
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${resp.data.access_token}`
    } catch (error) {
      console.log(error.message)
    }
  }
  return (
    <GlobalContext.Provider value={{ email, name, userUuid }}>
      {props.children}
    </GlobalContext.Provider>
  )
}

export default GlobalState
