import Appliances from "./components/appliances";
import Chat from "./components/Chat";
import NotificationButton from "./components/Notification";
import Sidebar from "./components/Sidebar";

export default function Mainpage (){
    return(
        <>
            <NotificationButton />
            <Appliances />
            {/* <Sidebar/> */}
            <Chat/>
        </>
    )
}