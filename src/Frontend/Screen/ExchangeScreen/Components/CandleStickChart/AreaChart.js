import React from 'react'
import PropTypes from 'prop-types'
import { format } from 'd3-format'
import { timeFormat } from 'd3-time-format'
import { curveMonotoneX } from 'd3-shape'

import { ChartCanvas, Chart } from 'react-stockcharts'
import { AreaSeries } from 'react-stockcharts/lib/series'
import { XAxis, YAxis } from 'react-stockcharts/lib/axes'
import { discontinuousTimeScaleProvider } from 'react-stockcharts/lib/scale'
import { fitWidth } from 'react-stockcharts/lib/helper'
import { createVerticalLinearGradient, hexToRGBA, last } from 'react-stockcharts/lib/utils'
import { CrossHairCursor } from 'react-stockcharts/lib/coordinates'
import { HoverTooltip } from 'react-stockcharts/lib/tooltip'

const canvasGradient = createVerticalLinearGradient([
  { stop: 0, color: hexToRGBA('#312f68', 1) },
  // { stop: 0.7, color: hexToRGBA('#6fa4fc', 0.4) },
  { stop: 1, color: hexToRGBA('#15233E', 1) }
])

const dateFormat = timeFormat('%Y-%m-%d %H:%M')
const numberFormat = format('.8f')

class AreaChart extends React.Component {
  tooltipContent = () => {
    return ({ currentItem, xAccessor }) => {
      return {
        y: [
          {
            label: 'Price',
            value: currentItem.close && numberFormat(currentItem.close) + ' WETH'
          }
        ],
        x: dateFormat(xAccessor(currentItem))
      }
    }
  }
  render () {
    const { data: initialData, type, ratio, heightChart, widthChart, period } = this.props
    const xScaleProvider = discontinuousTimeScaleProvider.inputDateAccessor(
      d => d.date
    )
    const { data, xScale, xAccessor, displayXAccessor } = xScaleProvider(initialData)
    const start = xAccessor(last(data))
    const end = xAccessor(data[Math.max(0, data.length - period)])
    const xExtents = [start, end]
    return (
      <ChartCanvas ratio={ratio} width={widthChart} height={heightChart}
        margin={{ left: 16, right: 80, top: 5, bottom: 25 }}
        seriesName='MSFT'
        data={data} type={type}
        xAccessor={xAccessor}
        displayXAccessor={displayXAccessor}
        xScale={xScale}
        xExtents={xExtents}
      >
        <Chart id={1} yExtents={d => [d.high, d.low]} >
          <defs>
            <linearGradient id='areaGradient' x1='0' y1='0' x2='0' y2='1'>
              <stop offset={0} stopColor='#312f68' stopOpacity={1}/>
              <stop offset={100} stopColor='#15233E' stopOpacity={1}/>
            </linearGradient>
          </defs>
          <XAxis axisAt='bottom' orient='bottom' ticks={5} stroke='#535E7A' tickStroke='#535E7A' fontSize={10}/>
          <YAxis axisAt='right' orient='right' ticks={3} stroke='#535E7A' tickStroke='#535E7A' tickFormat={format('.8f')} fontSize={10}/>
          <AreaSeries
            yAccessor={d => d.close}
            fill='url(#areaGradient)'
            strokeWidth={1}
            stroke='#7F29FF'
            interpolation={curveMonotoneX}
            canvasGradient={canvasGradient}
          />
          {/* <MouseCoordinateX
            at='bottom'
            orient='bottom'
            displayFormat={timeFormat('%Y-%m-%d %H:%M')}
            rectWidth={115}/>
          <MouseCoordinateY
            at='right'
            orient='right'
            displayFormat={format('.8f')}
            rectWidth={70}/> */}
          <HoverTooltip
            tooltipContent={this.tooltipContent()}
            fontSize={10}
            fill='#051126'
            fontFill='#F2F5FC'
            stroke='#051126'
            bgOpacity={0}
          />
        </Chart>
        <CrossHairCursor stroke='#FFFFFF' />
      </ChartCanvas>
    )
  }
}

AreaChart.propTypes = {
  data: PropTypes.array.isRequired,
  width: PropTypes.number.isRequired,
  ratio: PropTypes.number.isRequired,
  period: PropTypes.number.isRequired,
  type: PropTypes.oneOf(['svg', 'hybrid']).isRequired
}

AreaChart.defaultProps = {
  type: 'svg',
  period: 24
}
const mAreaChart = fitWidth(AreaChart)

export default mAreaChart
