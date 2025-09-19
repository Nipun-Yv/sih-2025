export interface Activity{
    id:string;
    name:string;
    description:string;
    price:number;
    duration:number;
    category:string;
    latitude:number;
    longitude:number;
    attractionId:string
}
export interface ItineraryItem {
  activity_id:string;
  activity_name: string; 
  activity_type: 'rest' | 'adventure' | 'tourist attraction' | 'commute';
  start_time: string;
  end_time: string;
}

export interface CalendarActivity{
    activity_id:string;
    title:string;
    start:Date;
    end:Date;
    color:string;
    activity_type: 'rest' | 'adventure' | 'tourist attraction' | 'commute';
}