export const DATA_RANGES = {
  '1D': [
    { time: '9:30', value: 24500 },
    { time: '10:00', value: 24650 },
    { time: '10:30', value: 24580 },
    { time: '11:00', value: 24720 },
    { time: '11:30', value: 24800 },
    { time: '12:00', value: 24750 },
    { time: '12:30', value: 24890 },
    { time: '13:00', value: 24950 },
    { time: '13:30', value: 24900 },
    { time: '14:00', value: 25100 },
    { time: '14:30', value: 25050 },
    { time: '15:00', value: 25150 },
    { time: '15:30', value: 25232 },
    { time: '16:00', value: 25232 },
  ],
  '1W': Array.from({ length: 7 }, (_, i) => ({
    time: `Day ${i + 1}`,
    value: 24000 + Math.random() * 2000,
  })),
  '1M': Array.from({ length: 30 }, (_, i) => ({
    time: `Day ${i + 1}`,
    value: 23000 + Math.random() * 3000,
  })),
  '3M': Array.from({ length: 90 }, (_, i) => ({
    time: `Day ${i + 1}`,
    value: 20000 + Math.random() * 6000,
  })),
  YTD: Array.from({ length: 100 }, (_, i) => ({
    time: `Day ${i + 1}`,
    value: 18000 + Math.random() * 8000,
  })),
  '1Y': Array.from({ length: 12 }, (_, i) => ({
    time: `Month ${i + 1}`,
    value: 15000 + Math.random() * 12000,
  })),
  ALL: Array.from({ length: 50 }, (_, i) => ({
    time: `Year ${i + 1}`,
    value: 5000 + Math.random() * 25000,
  })),
};

export const CHART_RANGES = ['1D', '1W', '1M', '3M', 'YTD', '1Y', 'ALL'];
