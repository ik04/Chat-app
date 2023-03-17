import Navbar from "@/components/Navbar"
import SearchBar from "@/components/SearchBar"
import { GlobalContext } from "@/context/GlobalContext"
import React, { useContext } from "react"

const home = () => {
  const { name } = useContext(GlobalContext)
  return (
    <div className="bg-purple-500 h-screen text-white">
      <Navbar />
      <SearchBar />
    </div>
  )
}

export default home

/*

*Finished:
 *it works now make up the logic for the same, use the uuid in the param and setup the to redirect 
 todo create search users and then make an api route to create a room on clicking the user, if room exists then send that room id through api route or make a new one and then send that
 todo also add the current user to that room in the backend, make it so when both users interact and try to make room they have the same id
 ? if the room already exists then how do i show that to a user
 * if the other user tries to create a new room just check if that user has a room with the requested user, try to make it so that the users associated with each room are in separate records
 ? how do i make a schema structure that allows those checks
 todo do these checks using ssr , and find a way to run uuid
 todo after implementing the room thingy make the sockets fit that (refactor the existing app)
 * the schema should have room id and participants
 * room id must be generated in backend!
 * 
 * 
 * 
 * Left:
 ! refactor routes acc to needs
 TODO after that move onto rendering existing rooms from the room table
 todo only after thats done work on persisting messages, make a messages table that takes user and table as FK, for now the order of messages does not matter
 ! one step at a time
 */
