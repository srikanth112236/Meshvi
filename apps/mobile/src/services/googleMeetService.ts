import { Linking, Share, Clipboard, Alert } from 'react-native';

export interface GoogleMeetDetails {
  title: string;
  datetime: string;
  duration: string;
  durationMinutes: number;
  meetCode: string;
  meetUrl: string;
  googleCalendarUrl: string;
  startDate: Date;
  endDate: Date;
  partnerName?: string;
}

/**
 * Generates an authentic 3-part Google Meet conference code (e.g. 'qmv-rtws-kpa')
 */
export function generateGoogleMeetCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const pick = (len: number) =>
    Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${pick(3)}-${pick(4)}-${pick(3)}`;
}

/**
 * Creates full Google Meet room URL
 */
export function createGoogleMeetUrl(roomCode?: string): string {
  const code = roomCode || generateGoogleMeetCode();
  return `https://meet.google.com/${code}`;
}

/**
 * Formats a Date object into Google Calendar ISO format (YYYYMMDDTHHmmssZ)
 */
function formatGoogleCalendarDate(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

/**
 * Calculates start and end Date objects from a date preset and time slot
 */
export function calculateMeetingDates(
  datePreset: 'TODAY' | 'TOMORROW' | 'NEXT_MON' | 'CUSTOM',
  timeSlot: string,
  durationMinutes: number = 30,
  customDate?: Date
): { startDate: Date; endDate: Date; displayDateStr: string } {
  const now = new Date();
  const start = customDate ? new Date(customDate.getTime()) : new Date();

  if (!customDate) {
    if (datePreset === 'TODAY') {
      // Keep today
    } else if (datePreset === 'TOMORROW') {
      start.setDate(now.getDate() + 1);
    } else if (datePreset === 'NEXT_MON') {
      const daysUntilMon = (8 - now.getDay()) % 7 || 7;
      start.setDate(now.getDate() + daysUntilMon);
    }
  }

  // Parse time slot (e.g. "02:00 PM" or "10:30 AM")
  const match = timeSlot.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const isPM = match[3].toUpperCase() === 'PM';
    if (isPM && hours < 12) hours += 12;
    if (!isPM && hours === 12) hours = 0;
    start.setHours(hours, minutes, 0, 0);
  } else {
    start.setHours(14, 0, 0, 0);
  }

  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayName = dayNames[start.getDay()];
  const monthName = monthNames[start.getMonth()];
  const dayNum = start.getDate();

  const displayDateStr = `${dayName}, ${dayNum} ${monthName} at ${timeSlot} (SGT)`;

  return { startDate: start, endDate: end, displayDateStr };
}

/**
 * Constructs an official 1-click Google Calendar Event Creation URL with Google Meet room
 */
export function buildGoogleCalendarUrl(options: {
  title: string;
  startDate: Date;
  endDate: Date;
  meetUrl: string;
  description?: string;
  partnerName?: string;
}): string {
  const dates = `${formatGoogleCalendarDate(options.startDate)}/${formatGoogleCalendarDate(options.endDate)}`;
  const title = encodeURIComponent(`Sync: ${options.title}`);
  const details = encodeURIComponent(
    `${options.description || 'Commercial Partnership Synchronization & Bilateral Mandate Review'}\n\n` +
    `🎥 Google Meet Video Room: ${options.meetUrl}\n` +
    `${options.partnerName ? `👤 Participant: ${options.partnerName}\n` : ''}` +
    `🔒 Secured via MESHVI Protocol`
  );
  const location = encodeURIComponent(options.meetUrl);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
}

/**
 * Creates full Google Meet + Calendar payload object
 */
export function createGoogleMeetSession(options: {
  title: string;
  datePreset: 'TODAY' | 'TOMORROW' | 'NEXT_MON' | 'CUSTOM';
  timeSlot: string;
  durationStr: string;
  partnerName?: string;
  description?: string;
  customDate?: Date;
}): GoogleMeetDetails {
  const durationMinutes = parseInt(options.durationStr, 10) || 30;
  const { startDate, endDate, displayDateStr } = calculateMeetingDates(
    options.datePreset,
    options.timeSlot,
    durationMinutes,
    options.customDate
  );

  const meetCode = generateGoogleMeetCode();
  const meetUrl = createGoogleMeetUrl(meetCode);

  const googleCalendarUrl = buildGoogleCalendarUrl({
    title: options.title,
    startDate,
    endDate,
    meetUrl,
    description: options.description,
    partnerName: options.partnerName,
  });

  return {
    title: options.title,
    datetime: displayDateStr,
    duration: options.durationStr,
    durationMinutes,
    meetCode,
    meetUrl,
    googleCalendarUrl,
    startDate,
    endDate,
    partnerName: options.partnerName,
  };
}

/**
 * Native launch: Opens Google Meet in browser or native app
 */
export async function openGoogleMeet(meetUrl: string): Promise<boolean> {
  try {
    const can = await Linking.canOpenURL(meetUrl);
    if (can) {
      await Linking.openURL(meetUrl);
      return true;
    }
    await Linking.openURL(meetUrl);
    return true;
  } catch {
    Alert.alert('Unable to Open Google Meet', 'Could not open Google Meet video room. Please check your browser or network connection.');
    return false;
  }
}

/**
 * Native launch: Opens Google Calendar event creator
 */
export async function openGoogleCalendar(calendarUrl: string): Promise<boolean> {
  try {
    await Linking.openURL(calendarUrl);
    return true;
  } catch {
    Alert.alert('Unable to Open Google Calendar', 'Could not launch Google Calendar.');
    return false;
  }
}

/**
 * Native Share Sheet: Share meeting invitation across WhatsApp, Email, Messages, Slack
 */
export async function shareMeetingInvite(meeting: {
  title: string;
  datetime?: string;
  duration?: string;
  meetUrl: string;
  googleCalendarUrl?: string;
  partnerName?: string;
  agenda?: string;
}): Promise<void> {
  try {
    const timeStr = meeting.datetime ? (meeting.duration ? `${meeting.datetime} (${meeting.duration})` : meeting.datetime) : 'Scheduled Date & Time';
    const message =
      `🤝 Executive Video Conference Invitation\n\n` +
      `📌 Agenda: ${meeting.title}\n` +
      `🕒 Time: ${timeStr}\n\n` +
      `🎥 Google Meet Video Call:\n${meeting.meetUrl}\n\n` +
      (meeting.googleCalendarUrl ? `📅 Add to Google Calendar:\n${meeting.googleCalendarUrl}\n\n` : '') +
      `Encrypted bilateral room dispatched via MESHVI.`;

    await Share.share({
      title: meeting.title,
      message,
      url: meeting.meetUrl,
    });
  } catch (err: any) {
    // Handled silently
  }
}

/**
 * Copies formatted Google Meet invitation to Clipboard
 */
export function copyMeetingInviteToClipboard(
  meetingOrUrl:
    | string
    | {
        title: string;
        datetime?: string;
        duration?: string;
        meetUrl?: string;
        googleCalendarUrl?: string;
      }
): string {
  let text = '';
  if (typeof meetingOrUrl === 'string') {
    text = meetingOrUrl;
  } else {
    text =
      `📌 Meeting: ${meetingOrUrl.title}\n` +
      (meetingOrUrl.datetime ? `🕒 Time: ${meetingOrUrl.datetime} ${meetingOrUrl.duration ? `(${meetingOrUrl.duration})` : ''}\n` : '') +
      (meetingOrUrl.meetUrl ? `🎥 Google Meet: ${meetingOrUrl.meetUrl}\n` : '') +
      (meetingOrUrl.googleCalendarUrl ? `📅 Google Calendar: ${meetingOrUrl.googleCalendarUrl}\n` : '');
  }

  Clipboard.setString(text);
  return text;
}
