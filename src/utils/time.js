const MINUTES_IN_DAY = 1440;

export const timeToMinutes = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

export const minutesToTime = (minutes) => {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
};

export const minutesToTimeLabel = (minutes) => {
  const hour24 = Math.floor(minutes / 60);
  const minute = minutes % 60;
  const period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  const hourLabel = hour12.toString().padStart(2, "0");
  const minuteLabel = minute.toString().padStart(2, "0");
  return `${hourLabel}:${minuteLabel} ${period}`;
};

export const formatTimeLabel = (startMinutes, endMinutes) => {
  return `${minutesToTimeLabel(startMinutes)} - ${minutesToTimeLabel(
    endMinutes,
  )}`;
};

export { MINUTES_IN_DAY };
