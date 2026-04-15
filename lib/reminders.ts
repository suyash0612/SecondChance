// Medication reminder utilities using the Web Notifications API

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

export function scheduleReminder(medName: string, dosage: string, timeStr: string) {
  // timeStr: "08:00"
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  const [hours, minutes] = timeStr.split(":").map(Number);
  const now = new Date();
  const next = new Date();
  next.setHours(hours, minutes, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  const delay = next.getTime() - now.getTime();

  setTimeout(() => {
    new Notification(`💊 Medication Reminder`, {
      body: `Time to take ${medName} ${dosage}`,
      icon: "/SecondChance/favicon.png",
      tag: `med-${medName}`,
    });
  }, delay);
}

export function cancelReminder(_medName: string) {
  // Can't truly cancel a setTimeout without storing the handle.
  // In a real app, use a service worker with periodic sync.
  // This is a stub for the UI.
}
