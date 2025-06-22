import Appliances from "./components/appliances";
import Chat from "./components/Chat";
import NotificationButton from "./components/Notification";
import Sidebar from "./components/Sidebar";
import SignOutButton from "./components/SignOutButton";

export default function Mainpage (){
    return(
        <>
            <SignOutButton/>
            <NotificationButton />
            <Appliances />
            <Sidebar/>
            <Chat/>
        </>
    )
}