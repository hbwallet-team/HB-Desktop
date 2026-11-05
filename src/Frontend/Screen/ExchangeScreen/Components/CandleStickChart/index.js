import React from 'react'
import Chart from './Chart'
import AreaChart from './AreaChart'
import { Spin } from 'Frontend/Components/HBLoader'
import './styles.css'
import { CHART_TYPE } from 'Utils/globalConstants'

const heightChartRatio = 2.1 / 10
const widthChartRatio = 4.8 / 10

class CandleStickChart extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      isLoadingChart: false
    }
  }
  updateDimensions = () => {
    this.setState({
      heightChart: document.getElementById('exs-chart-container').clientHeight - 10,
      widthChart: document.getElementById('exs-chart-container').clientWidth
    })
  }
  componentWillUnmount () {
    window.removeEventListener('resize', this.updateDimensions)
  }
  componentDidMount () {
    this.setState({
      heightChart: document.getElementById('exs-chart-container').clientHeight - 10,
      widthChart: document.getElementById('exs-chart-container').clientWidth
    })
    window.addEventListener('resize', this.updateDimensions)
  }
  render () {
    const { heightChart, widthChart } = this.state
    const { data, isLoadingChart, isZoom, type, period, t } = this.props

    const height = (isZoom ? window.innerHeight - 50 : heightChart)
    const width = (isZoom ? window.innerWidth : widthChart)
    return (
      <div style={{ height: '100%', width: '100%' }}>
        {!isLoadingChart
          ? <div className='exs-chart-loading'>
            { data && data.length > 0
              ? type === CHART_TYPE.CHART_LINE
                ? <AreaChart data={data} heightChart={height} widthChart={width} period={period}/>
                : <Chart data={data} heightChart={height} widthChart={width} isZoom={isZoom}/>
              : t('ChartEmpty')
            }
          </div>
          : <div className='exs-chart-loading'><Spin/></div>
        }
      </div>

    )
  }
}

export default CandleStickChart
