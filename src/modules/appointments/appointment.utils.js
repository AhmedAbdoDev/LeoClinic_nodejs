export const normalizeDay = (day) => {
  return day.toString().trim().toLowerCase();
};

export const getDayName = (date) => {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: "UTC",
  })
    .format(date)
    .toLowerCase();
};

export const getMinutesFromDate = (date) => {
  return date.getUTCHours() * 60 + date.getUTCMinutes();
};
