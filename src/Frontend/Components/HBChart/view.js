import React from 'react'
import { Tooltip, YAxis, AreaChart, Area } from 'recharts'
import './styles.css'
import { convertTimestampToDateTime, formatNumber } from 'Utils/globalFunction'

const HEIGHT_CHART = 120
const WIDTH_CHART_320 = 320
const WIDTH_CHART_330 = 330

const HBChart = ({widthCustom, heightCustom, datas, dataKey = 'average', symbol = 'USD', maxY, minY, paddingBottom = null, isTime = true, decimal = 5}) => {
  // const Dot = (item) => {
  //   const { cx, cy } = item
  //   if (cx !== +cx || cy !== +cy) { return null }
  //   return (
  //     <svg x={cx - 4} y={cy - 4} width={8} height={8} fill="#1594f6" viewBox="0 0 16 16">
  //       <circle cx="8" cy="8" r="8"></circle>
  //     </svg>
  //     // <svg x={cx - 1} y={cy - 1} width={1} height={1} fill="#1594f6" viewBox="0 0 1 1">
  //     //   <circle cx="1" cy="1" r="1"></circle>
  //     // </svg>
  //   )
  // }
  const DotActive = (item) => {
    const { cx, cy } = item
    if (cx !== +cx || cy !== +cy) { return null }
    return (
      <svg x={cx - 5} y={cy - 5} width={10} height={10} fill="white" viewBox="0 0 20 20">
        <circle cx="10" cy="10" r="10"></circle>
      </svg>
    )
  }
  const CustomTooltip = (item) => {
    const { active, payload } = item
    if (active && payload && payload[0] && payload[0].value) {
      return (
        <div className="chart-tooltip-contain">
          <div className="chart-tooltip-text"> {paddingBottom ? '0.00' : formatNumber(payload[0].value, decimal)} {symbol}</div>
          {isTime && <div className="chart-tooltip-text-date"> {convertTimestampToDateTime(payload[0].payload.time)}</div>}
        </div>
      )
    }
    return null
  }
  const width = widthCustom ? Number(widthCustom) : datas.length < 30 ? WIDTH_CHART_330 : WIDTH_CHART_320
  const height = heightCustom || HEIGHT_CHART
  return (
    // <LineChart width={WIDTH_CHART} height={paddingBottom || HEIGHT_CHART}
    //   data={datas}
    //   margin={{top: 7, right: 7, left: 10, bottom: 7}}

    // >
    //   <YAxis hide={true} domain={[minY, maxY]}/>
    //   <Tooltip cursor={false} content={<CustomTooltip/>}/>
    //   <Line dot={<Dot/>} activeDot={<DotActive/>} dataKey={dataKey} stroke='#1594f6' strokeWidth={1} isAnimationActive={false}/>
    // </LineChart>
    <AreaChart width={width} height={height}
      data={datas}
      margin={{top: 7, right: 7, left: 10, bottom: 7}}
    >
      <YAxis hide={true} domain={[minY, maxY]}/>
      <Tooltip cursor={false} content={<CustomTooltip/>}/>
      <defs>
        <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
          <stop offset={0} stopColor="#312f68" stopOpacity={1}/>
          <stop offset={100} stopColor="#15233E" stopOpacity={1}/>
        </linearGradient>
      </defs>
      <Area activeDot={<DotActive/>} dataKey={dataKey} fill='url(#splitColor)' stroke='#7F29FF' strokeWidth={1} isAnimationActive={false}/>
    </AreaChart>
  )
}

export default HBChart
