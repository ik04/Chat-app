import io from "socket.io-client"
import { useState, useEffect, useContext } from "react"
import { useRouter } from "next/router"
import { GlobalContext } from "@/context/GlobalContext"
import axios from "axios"
import Navbar from "@/components/Navbar"
import ScrollToBottom from "react-scroll-to-bottom"
import { Toaster, toast } from "react-hot-toast"

let socket

export default function Room(props) {
  // console.log(props.message)
  const { userUuid, name } = useContext(GlobalContext)

  const [isChat, setIsChat] = useState(false)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([])
  const [room, setRoom] = useState()

  const router = useRouter()
  const { uuid } = router.query
  // * figure out the interactions and setup routes for the same
  // * consider all posibilities
  useEffect(() => {
    socketInitializer()
  }, [])

  const roomChecks = async (e) => {
    e.preventDefault()
    try {
      const checkRoomRecordLink = "http://localhost:8000/api/check-members"
      const createRoomLink = "http://localhost:8000/api/room"
      const createRecordLink = "http://localhost:8000/api/members"
      const resp = await axios.post(checkRoomRecordLink, {
        user_id: userUuid,
        user_id2: uuid,
      })
      console.log(resp)
      if (resp.status === 200) {
        setRoom(resp.data.room_id) // used for sockets
        joinRoom(resp.data.room_id)
        toast.promise(loadMessages(resp.data.room_id), {
          loading: "Loading messages...",
          success: <b>Messages Loaded!</b>,
          error: <b>Could not Load Messages</b>,
        })
      }

      if (resp.status === 204) {
        const resp = await axios.post(createRoomLink)
        // console.log(resp.data) // new room created
        const resp2 = await axios.post(createRecordLink, {
          room_id: resp.data,
          user_id: userUuid,
          user_id2: uuid, // under the condition that user is valid, which will be done by ssr
        })
        // console.log(resp2)
        const resp3 = await axios.post(createRecordLink, {
          room_id: resp.data,
          user_id: uuid, // to allow the reverse to be true
          user_id2: userUuid,
        })

        setRoom(resp3.data.room_id)
        joinRoom(resp3.data.room_id)
      }
      setIsChat(true)
    } catch (error) {
      if (error.response.status === 403) {
        location.href = "/home"
      } else {
        console.log(error)
      }
    }
  }

  const joinRoom = async (roomId) => {
    await socket.emit("join_room", { room: roomId })
  }

  const loadMessages = async (roomId) => {
    const url = "http://localhost:8000/api/get-messages"

    const resp = await axios.post(url, {
      room_id: roomId,
    })
    console.log(resp)
    let desctructure = []
    resp.data.forEach((message) => {
      desctructure.push(message)
    })
    desctructure.forEach((message) => {
      setMessages((currentMsg) => [
        ...currentMsg,
        {
          author: message.name,
          message: message.message,
          room: roomId,
        },
      ])
    })
  }

  const socketInitializer = async () => {
    await fetch("/api/socket")
    socket = io()
    //* recieves
    socket.on("newIncomingMessage", (msg) => {
      setMessages((currentMsg) => [
        ...currentMsg,
        {
          author: msg.author,
          user_id: msg.user_id,
          message: msg.message,
          room: msg.room,
        },
      ])
    })
  }
  //* sends message
  const sendMessage = async (e) => {
    await socket.emit("createdMessage", {
      author: name,
      message: message,
      room: room,
      user_id: userUuid,
    })
    setMessages((currentMsg) => [
      ...currentMsg,
      { author: name, user_id: userUuid, message: message, room: room },
    ])

    const url = "http://localhost:8000/api/store-message"
    const resp = await axios.post(url, {
      user_id: userUuid,
      room_id: room,
      message: message,
    })
    console.log(resp)

    setMessage("")
  }

  const handleKeypress = (e) => {
    if (e.keyCode === 13) {
      if (message) {
        sendMessage()
      }
    }
  }
  return (
    <div className="overflow-y-hidden">
      <Toaster />
      <Navbar />
      <div className="flex items-center p-4 mx-auto min-h-screen justify-center bg-purple-500">
        <main className="gap-4 flex flex-col items-center justify-center w-full h-full">
          {!isChat ? (
            <>
              <button
                onClick={roomChecks}
                className="bg-white rounded-md px-4 py-2 text-xl"
              >
                Chat!
              </button>
            </>
          ) : (
            <>
              <p className="font-bold text-white text-xl">
                {name} Chatting with {props.name}
              </p>
              <div className="flex flex-col justify-end bg-white h-[20rem] min-w-[33%] rounded-md shadow-md ">
                <div className="h-full last:border-b-0 overflow-y-scroll">
                  {messages.map((msg, i) => {
                    return (
                      <div
                        className="w-full py-1 px-2 border-b border-gray-200"
                        key={i}
                      >
                        {msg.author} : {msg.message}
                      </div>
                    )
                  })}
                </div>
                <div className="border-t border-gray-300 w-full flex rounded-bl-md">
                  <input
                    type="text"
                    placeholder="New message..."
                    value={message}
                    className="outline-none py-2 px-2 rounded-bl-md flex-1"
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyUp={handleKeypress}
                    required
                  />
                  <div className="border-l border-gray-300 flex justify-center items-center  rounded-br-md group hover:bg-purple-500 transition-all">
                    <button
                      className="group-hover:text-white px-3 h-full"
                      onClick={(e) => {
                        sendMessage()
                      }}
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
export async function getServerSideProps(context) {
  const message = "ssr finished"
  try {
    const uuid = context.params.uuid
    const url = "http://localhost:8000/api/is-user"
    const resp = await axios.post(url, { user_id: uuid })
    if (resp.status !== 200) {
      return {
        redirect: {
          permanent: false,
          destination: "/home",
        },
      }
    }
    const name = resp.data.name
    return { props: { name, message } }
  } catch (error) {
    return {
      redirect: {
        permanent: false,
        destination: "/home",
      },
    }
  }
}

// // TODO allow connection to same room for both users done
// // CHECK IF PARAM UUID IS VALID THROUGH SSR TO PREVENT EXPLOITS
// // todo prepare the schemas for storing room and user ids
// // todo configure the websockets for messaging
// // todo add persistance through messages table
// // todo make the events for the different interactions

// todo change the frontend and implement search route for the future messaging stuff
// * implement other possible refactors and test out the messaging
// ? understand how socket connection was established and why you failed
