export interface Meeting {
  reference_id?: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  meeting_status?: string;
  meetingId?: string;
  video_uri?: string;
  thumbnail_image?: string;
  isMeetingRecorded?: boolean;
  uid_host?: string;
  onchain_host_uid?: string;
  attendees?: Attendee[];
  created_at?: Date;
}

export interface Attendee {
  attendee_address: string;
  attendee_uid?: string;
  attendee_onchain_uid?: string;
}
export interface OfficeHoursDocument {
  host_address: string;
  dao: {
    name: string;
    meetings: Meeting[];
  }[];
  created_at: Date;
  updated_at: Date;
}

export interface OfficeHoursRequestBody {
  host_address: string;
  dao_name: string;
  meetings: Meeting[];
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  id?: string;
  bookedTitle?: string;
  bookedDescription?: string;
  reference_id?: string;
}

export interface DateSchedule {
  date: Date;
  timeSlots: TimeSlot[];
  isRecurring?: boolean;
  title: string;
  description: string;
}

export interface UserScheduledHoursProps {
  daoName: string;
}

export interface CalendarProps {
  currentDate: Date;
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
  selectedDates: DateSchedule[];
  toggleDateSelection: (date: Date) => void;
  isDateDisabled: (date: Date) => boolean;
  isDateSelected: (date: Date) => boolean;
}

export interface TimeSlotSectionProps {
  hostAddress: string | null;
  daoName: string;
  selectedDates: DateSchedule[];
  setSelectedDates: React.Dispatch<React.SetStateAction<DateSchedule[]>>;
  generateTimeOptions: (
    selectedDate: Date,
    isStartTime: boolean,
    startTime?: string
  ) => string[];
  toggleRecurring: (dateIndex: number) => void;
  addTimeSlot: (dateIndex: number) => void;
  removeTimeSlot: (dateIndex: number, slotIndex: number) => void;
  updateTime: (
    dateIndex: number,
    slotIndex: number,
    field: "startTime" | "endTime",
    newTime: string
  ) => void;
  updateBookedSlot: (
    dateIndex: number,
    slotIndex: number,
    updatedSlot: TimeSlot
  ) => void;
  deleteBookedSlot: (dateIndex: number, slotIndex: number) => void;
  removeExistingSchedule: (referenceId: string) => void;
}

export interface AlertProps {
  message: string;
  onClose: () => void;
}

export interface EditOfficeHoursModalProps {
  hostAddress: string;
  daoName: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (editedData: {
    title: string;
    description: string;
    startTime: string;
    endTime: string;
  }) => void;
  slotData: {
    title: string;
    description: string;
    startTime: string;
    endTime: string;
  } | null;
  generateTimeOptions: (date: Date, startTime?: string) => string[];
  selectedDate: Date;
}

export interface EditBookedSlotModalProps {
  slot: TimeSlot;
  onClose: () => void;
  onUpdate: (updatedSlot: TimeSlot) => void;
}

export interface ExistingSchedule {
  startTime: string;
  endTime: string;
  title: string;
  description: string;
  id: string;
  reference_id: string;
}

export interface OfficeHoursProps {
  attendees?: Attendee[];
  created_at?: string;
  dao_name: string;
  description: string;
  host_address: string;
  onchain_host_uid?: string;
  uid_host?: string;
  isMeetingRecorded?: boolean;
  meetingId?: string;
  meeting_status: "Ongoing" | "Upcoming" | "Recorded" | "Hosted" | "Attended";
  thumbnail_image: string;
  title: string;
  video_uri?: string;
  startTime: string;
  endTime: string;
  reference_id: string;
  views?: number;
  nft_image?: string;
}
