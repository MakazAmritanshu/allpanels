export const getDateRangeUTC = (startDate, endDate) => {
  const startDay = startDate.substring(0, 10);
  const endDay = endDate.substring(0, 10);

  const startUTC = new Date(`${startDay}T00:00:00.000Z`);
  const endUTC = new Date(`${endDay}T23:59:59.999Z`);

  return {
    $gte: startUTC,
    $lte: endUTC,
  };
};

export const getDateRangeUTCWithOr = (startDate, endDate) => {
  const range = getDateRangeUTC(startDate, endDate);
  return [{ date: range }, { createdAt: range }];
};
