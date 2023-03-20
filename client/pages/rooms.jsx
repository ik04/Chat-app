import Navbar from "@/components/Navbar"
import { GlobalContext } from "@/context/GlobalContext"
import axios from "axios"
import React, { useContext, useEffect } from "react"

const rooms = () => {
  const { userUuid, token } = useContext(GlobalContext)
  useEffect(
    () => {
      getRooms(userUuid)
    },
    [userUuid, token],
    []
  )
  const url = "http://localhost:8000/api/rooms"
  const getRooms = async (user_id) => {
    const resp = await axios.post(url, { user_id: user_id })
    console.log(resp)
  }

  return (
    <div className="bg-purple-500 h-screen text-white">
      <Navbar />
    </div>
  )
}

export default rooms
