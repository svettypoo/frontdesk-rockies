import GuestInterface from './pages/GuestInterface';
import VideoChat from './pages/VideoChat';
import Bookings from './pages/Bookings';
import HotelMap from './pages/HotelMap';
import PaymentCheck from './pages/PaymentCheck';
import HotelInfo from './pages/HotelInfo';

export const PAGES = {
  "GuestInterface": GuestInterface,
  "VideoChat": VideoChat,
  "Bookings": Bookings,
  "HotelMap": HotelMap,
  "PaymentCheck": PaymentCheck,
  "HotelInfo": HotelInfo,
}

export const pagesConfig = {
  mainPage: "GuestInterface",
  Pages: PAGES,
  Layout: null,
}
