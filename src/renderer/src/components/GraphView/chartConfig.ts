import type { ChartOptions } from 'chart.js'

export const CHART_COLORS = [
  'rgb(255, 99, 132)',
  'rgb(54, 162, 235)',
  'rgb(255, 205, 86)',
  'rgb(75, 192, 192)',
  'rgb(153, 102, 255)'
]

export const CHART_FONT_FAMILY =
  "'Zen Maru Gothic', 'M PLUS Rounded 1c', 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Yu Gothic UI', 'Meiryo', sans-serif"

export function buildChartOptions(fontFamily: string): ChartOptions<'line'> {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            family: fontFamily
          }
        }
      },
      title: {
        display: true,
        text: '年収推移予測',
        font: {
          family: fontFamily
        }
      }
    },
    scales: {
      x: {
        ticks: {
          font: {
            family: fontFamily
          }
        }
      },
      y: {
        ticks: {
          font: {
            family: fontFamily
          },
          callback: (value) => (Number(value) / 10000).toLocaleString() + '万円'
        }
      }
    }
  }
}
