import { TWO_PLAYER_GAMES } from '../constants';

/**
 * Check if game should show only two players
 */
export const shouldShowOnlyTwoPlayers = (gameId) => {
  return TWO_PLAYER_GAMES.includes(gameId);
};

/**
 * Get chart data for baccarat statistics
 */
export const getBaccaratChartData = (resultData) => {
  const g = resultData?.g;
  return [
    { name: 'player', y: parseFloat(g?.p || 0), color: '#428bca' },
    { name: 'banker', y: parseFloat(g?.b || 0), color: '#d9534f' },
    { name: 'Tie', y: parseFloat(g?.t || 0), color: '#5cb85c' },
  ];
};

/**
 * Get Highcharts configuration for baccarat pie chart
 */
export const getBaccaratChartOptions = (chartData) => ({
  chart: {
    type: 'pie',
    options3d: { enabled: true, alpha: 35, depth: 50 },
    backgroundColor: 'transparent',
    animation: false,
    height: '300',
  },
  title: {
    text: null,
  },
  credits: {
    enabled: false,
  },
  plotOptions: {
    pie: {
      depth: 45,
      startAngle: -85,
      endAngle: 450,
      center: ['50%', '50%'],
      dataLabels: {
        enabled: true,
        distance: -40,
        formatter: function () {
          return this.y > 0 ? this.y : null;
        },
        style: {
          color: '#fff',
          fontWeight: 'bold',
          textOutline: 'none',
          fontSize: '14px',
        },
      },
    },
  },
  tooltip: { enabled: true },
  series: [
    {
      type: 'pie',
      animation: false,
      data: chartData,
    },
  ],
});

/**
 * Get video stream URL for a game
 */
export const getVideoStreamUrl = (gameid) => {
  return `https://casino-stream-v2.cricketid.xyz/casino-tv?id=${gameid}`;
};
