import GuestInterface from './pages/GuestInterface';
import VideoChat from './pages/VideoChat';
import Bookings from './pages/Bookings';
import HotelMap from './pages/HotelMap';
import PaymentCheck from './pages/PaymentCheck';
import HotelInfo from './pages/HotelInfo';
import MaintenanceRequest from './pages/MaintenanceRequest';
import RoomService from './pages/RoomService';
import ChatBot from './pages/ChatBot';
import Concierge from './pages/Concierge';
import Housekeeping from './pages/Housekeeping';

export const PAGES = {
  "GuestInterface": GuestInterface,
  "VideoChat": VideoChat,
  "Bookings": Bookings,
  "HotelMap": HotelMap,
  "PaymentCheck": PaymentCheck,
  "HotelInfo": HotelInfo,
  "MaintenanceRequest": MaintenanceRequest,
  "RoomService": RoomService,
  "ChatBot": ChatBot,
  "Concierge": Concierge,
  "Housekeeping": Housekeeping,
}

export const pagesConfig = {
  mainPage: "GuestInterface",
  Pages: PAGES,
  Layout: null,
}
