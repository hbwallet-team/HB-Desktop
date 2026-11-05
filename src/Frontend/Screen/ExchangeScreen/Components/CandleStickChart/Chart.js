import React from 'react'
import PropTypes from 'prop-types'
import { format } from 'd3-format'
import { timeFormat } from 'd3-time-format'

import { ChartCanvas, Chart } from 'react-stockcharts'
import {
  BarSeries,
  CandlestickSeries,
  LineSeries
} from 'react-stockcharts/lib/series'
import {
  CrossHairCursor,
  MouseCoordinateX,
  MouseCoordinateY,
  EdgeIndicator
} from 'react-stockcharts/lib/coordinates'
import { XAxis, YAxis } from 'react-stockcharts/lib/axes'

import { discontinuousTimeScaleProvider } from 'react-stockcharts/lib/scale'
import { ema } from 'react-stockcharts/lib/indicator'
import { fitWidth } from 'react-stockcharts/lib/helper'
import { last } from 'react-stockcharts/lib/utils'
import { convertWeiToBalance } from 'Utils/globalFunction'

const keyValues = ['high', 'low']

class CandleStickChartWithHoverTooltip extends React.Component {
  removeRandomValues (data) {
    return data.map(item => {
      const newItem = { ...item }
      const numberOfDeletion = Math.floor(Math.random() * keyValues.length) + 1
      for (let i = 0; i < numberOfDeletion; i += 1) {
        const randomKey = keyValues[Math.floor(Math.random() * keyValues.length)]
        newItem[randomKey] = undefined
      }
      return newItem
    })
  }
  render () {
    let { data: initialData, heightChart, widthChart, ratio, period, isZoom } = this.props
    const ema20 = ema()
      .id(0)
      .options({ windowSize: 20 })
      .merge((d, c) => {
        d.ema20 = c
      })
      .accessor(d => d.ema20)

    const ema50 = ema()
      .id(2)
      .options({ windowSize: 50 })
      .merge((d, c) => {
        d.ema50 = c
      })
      .accessor(d => d.ema50)

    const calculatedData = ema50(ema20(initialData))
    const xScaleProvider = discontinuousTimeScaleProvider.inputDateAccessor(
      d => d.date
    )
    const { data, xScale, xAccessor, displayXAccessor } = xScaleProvider(
      calculatedData
    )
    const start = Number(data.length) - period <= 0 ? Number(data.length) + Math.abs(data.length - period) : xAccessor(last(data))
    const end = xAccessor(data[Math.max(0, data.length - period)])
    const xExtents = [start, end]
    // console.log('xExtents', xExtents)
    let heightChartCandle = heightChart * 0.5
    let heightChartBar = heightChart * 0.2
    if (isZoom) {
      heightChartCandle = heightChart * 0.65
      heightChartBar = heightChart * 0.25
    }
    // console.log('heightChart', heightChart)
    // console.log('heightChartCandle', heightChartCandle)
    // console.log('heightChartBar', heightChartBar)

    return (
      <ChartCanvas
        height={heightChart}
        width={widthChart}
        ratio={ratio}
        margin={{ left: 16, right: 80, top: 5, bottom: 25 }}
        seriesName="MSFT"
        data={data}
        xScale={xScale}
        xAccessor={xAccessor}
        displayXAccessor={displayXAccessor}
        xExtents={xExtents}
        padding={{
          left: 0,
          right: 5
        }}
      >
        <Chart
          id={2}
          yExtents={[d => d.volume]}
          height={heightChartBar}
          origin={(w, h) => [0, h - heightChartBar]}
        >
          <XAxis axisAt="bottom" orient="bottom" ticks={5} stroke='#535E7A' tickStroke='#535E7A' fontSize={10}/>
          <YAxis axisAt="right" orient="right" ticks={2} stroke='#535E7A' tickStroke='#535E7A' tickFormat={format('.2s')} fontSize={10}/>
          <BarSeries
            yAccessor={d => d.volume}
            fill={d => (d.volume === 0 ? 'transparent' : '#dda750')}
            opacity={1}
          />
          <MouseCoordinateX
            at="bottom"
            orient="bottom"
            displayFormat={timeFormat('%Y-%m-%d %H:%M')}
            fontSize={10}/>
          <MouseCoordinateY
            at="right"
            orient="right"
            displayFormat={format('.2f')}
            fontSize={10}
            rectHeight={20}
            arrowWidth={10}
            dx={6}/>
        </Chart>
        <Chart
          id={1}
          yExtents={[
            d => [d.high, d.low],
            ema20.accessor(),
            ema50.accessor()
          ]}
          height={heightChartCandle}
        >
          <XAxis axisAt="bottom" orient="bottom" stroke='#535E7A' tickStroke='#535E7A' showTicks={false} fontSize={10}/>
          <YAxis axisAt="right" orient="right" ticks={3} stroke='#535E7A' tickStroke='#535E7A' tickFormat={format('.8f')} fontSize={10}/>

          <CandlestickSeries
            wickStroke={ d => d.close > d.open ? '#00b95f' : '#bc1b45' }
            stroke={ d => d.close > d.open ? '#00b95f' : '#bc1b45' }
            candleStrokeWidth={1}
            widthRatio={0.8}
            opacity={1}
            fill={d => d.close > d.open ? '#00ffac' : '#ff477a'}
          />
          <LineSeries
            yAccessor={ema20.accessor()}
            stroke={ema20.stroke()}
          />
          <LineSeries
            yAccessor={ema50.accessor()}
            stroke={ema50.stroke()}
          />
          <EdgeIndicator itemType="last" orient="right" edgeAt="right" displayFormat={format('.8f')} rectHeight={20} fontSize={10} lineStroke="orange" strokeWidth={0} arrowWidth={10}
            yAccessor={d => d.close} fill={d => d.close > d.open ? '#009086' : '#FF7F7F'} opacity={1} dx={6}/>
          <MouseCoordinateY
            at="right"
            orient="right"
            displayFormat={format('.8f')}
            fontSize={10}
            rectHeight={20}
            arrowWidth={10}
            dx={6}/>
        </Chart>
        <CrossHairCursor stroke="#FFFFFF" />
      </ChartCanvas>
    )
  }
}

CandleStickChartWithHoverTooltip.propTypes = {
  data: PropTypes.array.isRequired,
  width: PropTypes.number.isRequired,
  ratio: PropTypes.number.isRequired,
  period: PropTypes.number.isRequired,
  type: PropTypes.oneOf(['svg', 'hybrid']).isRequired
}

CandleStickChartWithHoverTooltip.defaultProps = {
  type: 'svg',
  period: 40
}
const mCandleStickChartWithHoverTooltip = fitWidth(CandleStickChartWithHoverTooltip)

export default mCandleStickChartWithHoverTooltip
