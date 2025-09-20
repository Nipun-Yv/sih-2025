"use client";
import { useStreamingContext } from "../../contexts/StreamingContext";
import { CalendarActivity, ItineraryItem } from "@/types/Activity";
import { ConnectionStatus, SSEMessage } from "@/types/SSE";
import axios from "axios";
import{ useEffect, useRef, useState, useCallback } from "react";

const useStreaming = () => {
  const { itineraryItems, setItineraryItems, isComplete, setIsComplete } =
    useStreamingContext();
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const [events, setEvents] = useState<CalendarActivity[]>([]);
  const hasStartedRef = useRef(false); // Ref to track streaming start

  const startStreaming = useCallback(async () => {
    // Reset state
     console.log("startStreaming called");
    setItineraryItems([]);
    setError(null);
    setIsComplete(false);
    setConnectionStatus("connecting");

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      // const { data: user } = await axios.get("/api/user");
      // if (!user) {
      //   redirect("/auth");
      // }

      const result=await axios.get(`${apiUrl}/health`)
      const eventSource = new EventSource(
        `${apiUrl}/stream-itinerary-sse/sample`
      );
      eventSourceRef.current = eventSource;

      eventSource.onopen = (): void => {
        setConnectionStatus("connected");
        console.log("SSE connection opened");
      };

      eventSource.onmessage = (event: MessageEvent): void => {
        try {
          const data: SSEMessage = JSON.parse(event.data);

          switch (data.type) {
            case "connected":
              console.log("Stream started:", data.message);
              break;

            case "item":
              if (data.data) {
                setItineraryItems((prev) => [...prev, data.data!]);
                console.log("New itinerary item:", data.data);
              }
              break;

            case "complete":
              console.log("Itinerary generation complete");
              setIsComplete(true);
              setConnectionStatus("completed");
              eventSource.close();
              break;

            case "error":
              console.error("Server error:", data.message);
              setError(data.message || "Unknown server error");
              setConnectionStatus("error");
              eventSource.close();
              break;

            default:
              console.log("Unknown message type:", data);
          }
        } catch (err) {
          console.error("Error parsing SSE data:", err);
          setError("Failed to parse server response");
        }
      };

      eventSource.onerror = (event: Event): void => {
        console.error("SSE error:", event);
        setConnectionStatus("error");
        setError("Connection error occurred");
        eventSource.close();
      };
    } catch (err) {
      console.error("Error starting stream:", err);
      setConnectionStatus("error");
      setError("Failed to initialize streaming");
    }
  }, [setItineraryItems, setIsComplete, setConnectionStatus]);

  const stopStreaming = useCallback((): void => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setConnectionStatus("disconnected");
  }, []);

  useEffect(() => {
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      startStreaming();
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [startStreaming]);

  const formatDate = (timeString: string): Date => {
    const date = new Date(timeString);
    return date;
  };
  const getActivityColor = (
    activityType: ItineraryItem["activity_type"]
  ): string => {
    switch (activityType) {
      case "adventure":
        return "#ea580c";
      case "tourist attraction":
        return "#fb923c";
      case "rest":
        return "white";
      case "commute":
        return "#fdba74";
      default:
        return "#fed7aa";
    }
  };
  useEffect(() => {
    const updateEventList = (itineraryItems: ItineraryItem[]) => {
      setEvents(
        itineraryItems.map((item) => {
          return {
            activity_id:item.activity_id,
            title: item.activity_name,
            start: formatDate(item.start_time),
            end: formatDate(item.end_time),
            color: getActivityColor(item.activity_type),
            activity_type: item.activity_type,
          };
        })
      );
    };
    updateEventList(itineraryItems);
  }, [itineraryItems]);

  return {
    itineraryItems,
    connectionStatus,
    error,
    isComplete,
    events,
    startStreaming,
    stopStreaming,
  };
};

export default useStreaming;

// {activity_name: "Morning walk",
//   activity_type:  'adventure',
//   start_time: '2025-06-17T08:00:00',
//   end_time:'2025-06-17T10:00:00' },
// {activity_name: "Morning walk",
//   activity_type:  'adventure',
//   start_time: '2025-06-17T11:00:00',
//   end_time:'2025-06-17T12:00:00' }
