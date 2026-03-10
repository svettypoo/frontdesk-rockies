import GuestInterface from './pages/GuestInterface';
import VideoChat from './pages/VideoChat';
import Bookings from './pages/Bookings';
import __Layout from './Layout.jsx';

export const PAGES = {
  "GuestInterface": GuestInterface,
  "VideoChat": VideoChat,
  "Bookings": Bookings,
}

export const pagesConfig = {
  mainPage: "GuestInterface",
  Pages: PAGES,
  Layout: __Layout,
}
