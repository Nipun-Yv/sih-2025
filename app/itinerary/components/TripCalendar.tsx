"use client";
import { Calendar, dayjsLocalizer, View } from "react-big-calendar"
import dayjs from "dayjs";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  MapPin,
  Clock,
  Users,
} from "lucide-react";
import { CalendarActivity } from "@/types/Activity";
import useStreaming from "../hooks/useStreaming";

const localizer = dayjsLocalizer(dayjs);

const eventTypes = {
  meeting: { icon: Users, label: "Meeting" },
  meal: { icon: MapPin, label: "Dining" },
  travel: { icon: MapPin, label: "Travel" },
  accommodation: { icon: MapPin, label: "Stay" },
};

const TripCalendar = ({events,connectionStatus}:{events:any,connectionStatus:string}) => {

  const [date, setDate] = useState<Date>(new Date());
  const [view, setView] = useState<View>("week");

  const [selectedEvent, setSelectedEvent] = useState<CalendarActivity | null>(
    null
  );
  const calendarContainerRef = useRef<HTMLDivElement>(null);

  // Add a useEffect to scroll to the latest event when events change
  useEffect(() => {
    if (events.length > 0 && calendarContainerRef.current) {
      // Example: scroll to the last event (assuming events are sorted by time)
      const lastEvent = events[events.length - 1];
      const eventElements =
        calendarContainerRef.current.querySelectorAll(".rbc-event");
      let targetElement = null;
      for (const el of eventElements) {
        if (el.textContent && el.textContent.includes(lastEvent.title)) {
          targetElement = el;
          break;
        }
      }
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [events]);

  const customEventPropGetter = (event: CalendarActivity) => ({
    style: {
      backgroundColor: event.color,
      color: `${event.color == "white" ? "orange" : "white"}`,
      border: "none",
      borderRadius: "5px",
      fontSize: "13px",
      fontWeight: "500",
      cursor: "pointer",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      transition: "all 0.2s ease-in-out",
      borderBottom: "1px solid white",
    },
  });
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex-3/4">
      <div className="bg-white rounded-xl shadow-lg border border-orange-100 overflow-hidden backdrop-blur-sm"
        ref={calendarContainerRef}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          onNavigate={(newDate) => setDate(newDate)}
          onView={(newView) => setView(newView)}
          onSelectEvent={setSelectedEvent}
          step={10}
          timeslots={1}
          view={view}
          date={date}
          style={{ height: "700px" }}
          eventPropGetter={customEventPropGetter}
          popup={true}
        />
      </div>
      {/* <button
        onClick={startStreaming}
        disabled={
          connectionStatus === "connecting" || connectionStatus === "connected"
        }
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
      >
        {connectionStatus === "connecting" && (
          <Loader2 className="w-4 h-4 animate-spin" />
        )}
        {connectionStatus === "connecting"
          ? "Connecting..."
          : "Generate Itinerary"}
      </button>

      <button
        onClick={stopStreaming}
        disabled={connectionStatus === "disconnected"}
        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Stop Stream
      </button> */}
      <div className="flex items-center gap-2">
        <div
          className={`w-3 h-3 rounded-full transition-colors ${
            connectionStatus === "connected"
              ? "bg-green-500"
              : connectionStatus === "connecting"
              ? "bg-yellow-500 animate-pulse"
              : connectionStatus === "error"
              ? "bg-red-500"
              : connectionStatus === "completed"
              ? "bg-blue-500"
              : "bg-gray-500"
          }`}
        ></div>
        <span className="text-sm text-gray-600 capitalize">
          {connectionStatus}
        </span>
      </div>
      {/* Modal */}
      {selectedEvent && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-orange-100 transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: selectedEvent.color }}
                >
                  {(() => {
                    const EventIcon =
                      eventTypes[selectedEvent.type]?.icon || CalendarDays;
                    return <EventIcon className="w-6 h-6 text-white" />;
                  })()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedEvent.title}
                  </h3>
                  <p className="text-sm text-orange-600 font-medium">
                    {eventTypes[selectedEvent.type]?.label}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-light w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-3 text-sm text-gray-600 p-3 bg-orange-50 rounded-lg">
                <Clock className="w-4 h-4 text-orange-500" />
                <span className="font-medium">
                  {dayjs(selectedEvent.start).format("MMM DD, YYYY HH:mm")} -
                  {dayjs(selectedEvent.end).format("HH:mm")}
                </span>
              </div>

              {selectedEvent.location && (
                <div className="flex items-center space-x-3 text-sm text-gray-600 p-3 bg-orange-50 rounded-lg">
                  <MapPin className="w-4 h-4 text-orange-500" />
                  <span className="font-medium">{selectedEvent.location}</span>
                </div>
              )}
            </div>

            {/* <div className="flex space-x-3">
              <button className="flex-1 bg-gradient-to-r from-orange-400 to-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:from-orange-500 hover:to-orange-600 shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                Edit Event
              </button>
              <button className="px-6 py-3 border border-orange-200 text-orange-700 rounded-lg hover:bg-orange-50 font-medium transition-colors">
                Delete
              </button>
            </div> */}
          </div>
        </div>
      )}
    </div>
  );
};

export default TripCalendar;
