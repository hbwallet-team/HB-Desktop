import React from 'react'
import Images from 'Assets/Image'
const yClock = 288
const xClock = 292.57
const WIDTH = '84px'

function rotateLock (gas) {
  const gasHand = document.getElementById('gas-hand')
  gasHand && gasHand.setAttribute('transform', 'rotate(' + gas + ' ' + xClock + ' ' + yClock + ')')
}

export default class View extends React.PureComponent {
  componentDidMount () {
    const { gasPercent } = this.props
    rotateLock(gasPercent ? gasPercent * 3 : 0)
  }
  render () {
    const { gasPercent } = this.props
    const gasPercentWithRound = Math.round(gasPercent)
    rotateLock(gasPercent ? gasPercent * 3 : 0)
    return (
      <div style={{width: WIDTH,
        height: WIDTH,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        {/* <img alt='bacoor'
          style={{width: WIDTH, height: WIDTH}}
          src={Images.gasClock}/> */}
        <div style={{
          position: 'absolute',
          zIndex: 5,
          width: WIDTH,
          height: WIDTH
        }}>
          {/* <svg version="1.1" id="gasClock" x="0px" y="0px"
            viewBox='0 0 585.14 597.492' >
            <circle cx={xClock} cy={yClock} r="150" fill="black" />
            <line id='gas-hand' dur='5s' strokeWidth='12' stroke='black' x1={xClock}
              y1={yClock} x2="222.57" y2="409" fill="black"/>
          </svg> */}
          <svg width="84" height="84" viewBox="0 0 84 84" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path id='c_1' d="M21.5432 78.7049L20.457 78.0713L22.8105 73.9753L23.9193 74.609L21.5432 78.7049Z" fill={gasPercentWithRound > 0 ? '#24E37D' : '#535E7A'}/>
            <path id='c_2' d="M61.1897 10.0248L60.1035 9.39115L62.457 5.31787L63.5658 5.95149L61.1897 10.0248Z" fill={gasPercentWithRound >= 60 ? '#24E37D' : '#535E7A'}/>
            <path id='c_3' d="M0 42.6337V41.3665H4.7069V42.6337H0Z" fill={gasPercentWithRound >= 20 ? '#24E37D' : '#535E7A'}/>
            <path id='c_4' d="M79.293 42.6337V41.3665H83.9999V42.6337H79.293Z" fill={gasPercentWithRound >= 80 ? '#24E37D' : '#535E7A'}/>
            <path id='c_5' d="M5.951 63.5656L5.31738 62.4567L9.39066 60.1033L10.0243 61.1895L5.951 63.5656Z" fill={gasPercentWithRound >= 10 ? '#24E37D' : '#535E7A'}/>
            <path id='c_6' d="M74.6082 23.9191L73.9746 22.8102L78.0705 20.4568L78.7041 21.543L74.6082 23.9191Z" fill={gasPercentWithRound >= 70 ? '#24E37D' : '#535E7A'}/>
            <path id='c_7' d="M9.39066 23.9191L5.31738 21.543L5.951 20.4568L10.0243 22.8102L9.39066 23.9191Z" fill={gasPercentWithRound >= 30 ? '#24E37D' : '#535E7A'}/>
            <path id='c_8' d="M78.0705 63.5656L73.9746 61.1895L74.6082 60.1033L78.7041 62.4567L78.0705 63.5656Z" fill={gasPercentWithRound >= 90 ? '#24E37D' : '#535E7A'}/>
            <path id='c_9' d="M41.3662 4.72953V0H42.6334V4.72953H41.3662Z" fill={gasPercentWithRound >= 50 ? '#24E37D' : '#535E7A'}/>
            <path id='c_10' d="M22.8105 10.0248L20.457 5.95149L21.5432 5.31787L23.9193 9.39115L22.8105 10.0248Z" fill={gasPercentWithRound >= 40 ? '#24E37D' : '#535E7A'}/>
            <path id='c_11' d="M62.457 78.7049L60.1035 74.609L61.1897 73.9753L63.5658 78.0713L62.457 78.7049Z" fill={gasPercentWithRound >= 100 ? '#24E37D' : '#535E7A'}/>
            <path id='c_12' d="M46.5491 0.248872L46.2776 2.87387L45.9834 2.85124L46.2549 0.203613L46.5491 0.248872Z" fill={gasPercentWithRound >= 52 ? '#24E37D' : '#535E7A'}/>
            <path id='c_13' d="M50.8931 0.950456L50.3274 3.5302L50.0332 3.46231L50.5989 0.882568L50.8931 0.950456Z" fill={gasPercentWithRound >= 54 ? '#24E37D' : '#535E7A'}/>
            <path id='c_14' d="M55.1253 2.10468L54.3106 4.61653L54.0391 4.52601L54.8537 2.01416L55.1253 2.10468Z" fill={gasPercentWithRound >= 56 ? '#24E37D' : '#535E7A'}/>
            <path id='c_15' d="M59.2209 3.68859L58.1573 6.10992L57.8857 5.97415L58.9493 3.57544L59.2209 3.68859Z" fill={gasPercentWithRound >= 58 ? '#24E37D' : '#535E7A'}/>
            <path id='c_16' d="M22.4709 76.1477L21.1358 78.4559L20.8643 78.2975L22.1994 76.012L22.4709 76.1477Z" fill={gasPercentWithRound > 0 ? '#24E37D' : '#535E7A'}/>
            <path id='c_17' d="M63.1358 5.70259L61.8233 7.98815L61.5518 7.82975L62.8869 5.54419L63.1358 5.70259Z" fill={gasPercentWithRound >= 60 ? '#24E37D' : '#535E7A'}/>
            <path id='c_18' d="M19.0086 73.9298L17.4245 76.0796L17.1982 75.8986L18.7597 73.7488L19.0086 73.9298Z" fill={gasPercentWithRound >= 2 ? '#24E37D' : '#535E7A'}/>
            <path id='c_19' d="M66.8014 8.10128L65.2626 10.2511L65.0137 10.07L66.5751 7.94287L66.8014 8.10128Z" fill={gasPercentWithRound >= 62 ? '#24E37D' : '#535E7A'}/>
            <path id='c_20' d="M15.7953 71.3504L14.0075 73.3191L13.7812 73.1155L15.569 71.1467L15.7953 71.3504Z" fill={gasPercentWithRound >= 4 ? '#24E37D' : '#535E7A'}/>
            <path id='c_21' d="M70.2189 10.8848L68.4538 12.8536L68.2275 12.6499L69.9926 10.6812L70.2189 10.8848Z" fill={gasPercentWithRound >= 64 ? '#24E37D' : '#535E7A'}/>
            <path id='c_22' d="M12.8757 68.431L10.8843 70.2187L10.6807 69.9924L12.672 68.2273L12.8757 68.431Z" fill={gasPercentWithRound >= 6 ? '#24E37D' : '#535E7A'}/>
            <path id='c_23' d="M73.3187 14.0075L71.35 15.7726L71.1689 15.5463L73.1151 13.7812L73.3187 14.0075Z" fill={gasPercentWithRound >= 66 ? '#24E37D' : '#535E7A'}/>
            <path id='c_24' d="M10.2742 65.2402L8.10176 66.8016L7.94336 66.5753L10.0931 65.0139L10.2742 65.2402Z" fill={gasPercentWithRound >= 8 ? '#24E37D' : '#535E7A'}/>
            <path id='c_25' d="M76.0807 17.4245L73.9309 18.986L73.7725 18.737L75.8996 17.1982L76.0807 17.4245Z" fill={gasPercentWithRound >= 68 ? '#24E37D' : '#535E7A'}/>
            <path id='c_26' d="M8.01054 61.8007L5.70235 63.1358L5.54395 62.8869L7.85214 61.5518L8.01054 61.8007Z" fill={gasPercentWithRound >= 10 ? '#24E37D' : '#535E7A'}/>
            <path id='c_27' d="M78.4557 21.1358L76.1701 22.4483L76.0117 22.1994L78.2973 20.8643L78.4557 21.1358Z" fill={gasPercentWithRound >= 70 ? '#24E37D' : '#535E7A'}/>
            <path id='c_28' d="M6.13231 58.1348L3.68834 59.2211L3.5752 58.9495L5.99653 57.8633L6.13231 58.1348Z" fill={gasPercentWithRound >= 12 ? '#24E37D' : '#535E7A'}/>
            <path id='c_29' d="M80.4466 25.0506L78.0253 26.1368L77.9121 25.8653L80.3108 24.7791L80.4466 25.0506Z" fill={gasPercentWithRound >= 72 ? '#24E37D' : '#535E7A'}/>
            <path id='c_30' d="M4.63965 54.3103L2.10517 55.1249L2.01465 54.8534L4.54913 54.0161L4.63965 54.3103Z" fill={gasPercentWithRound >= 14 ? '#24E37D' : '#535E7A'}/>
            <path id='c_31' d="M82.0096 29.1692L79.4977 29.9838L79.4072 29.6897L81.9191 28.875L82.0096 29.1692Z" fill={gasPercentWithRound >= 74 ? '#24E37D' : '#535E7A'}/>
            <path id='c_32' d="M3.55209 50.3274L0.949724 50.8705L0.881836 50.5989L3.48421 50.0332L3.55209 50.3274Z" fill={gasPercentWithRound >= 16 ? '#24E37D' : '#535E7A'}/>
            <path id='c_33' d="M83.1164 33.4233L80.5366 33.9664L80.4688 33.6723L83.0485 33.1292L83.1164 33.4233Z" fill={gasPercentWithRound >= 76 ? '#24E37D' : '#535E7A'}/>
            <path id='c_34' d="M2.89699 46.2544L0.24936 46.5486L0.204102 46.2544L2.87436 45.9602L2.89699 46.2544Z" fill={gasPercentWithRound >= 18 ? '#24E37D' : '#535E7A'}/>
            <path id='c_35' d="M83.7962 37.7683L81.1712 38.0399L81.126 37.7457L83.7736 37.4741L83.7962 37.7683Z" fill={gasPercentWithRound >= 78 ? '#24E37D' : '#535E7A'}/>
            <path id='c_36' d="M7.85311 22.4709L5.54492 21.1358L5.70333 20.8643L8.01152 22.1994L7.85311 22.4709Z" fill={gasPercentWithRound >= 30 ? '#24E37D' : '#535E7A'}/>
            <path id='c_37' d="M78.2982 63.1358L76.0127 61.8233L76.1711 61.5518L78.4567 62.8869L78.2982 63.1358Z" fill={gasPercentWithRound >= 90 ? '#24E37D' : '#535E7A'}/>
            <path id='c_38' d="M2.67026 42.1584H0V41.8643H2.67026V42.1584Z" fill={gasPercentWithRound >= 20 ? '#24E37D' : '#535E7A'}/>
            <path id='c_39' d="M84 42.1584H81.375V41.8643H84V42.1584Z" fill={gasPercentWithRound >= 80 ? '#24E37D' : '#535E7A'}/>
            <path id='c_40' d="M2.85173 38.0399L0.204102 37.7683L0.24936 37.4741L2.89699 37.7457L2.85173 38.0399Z" fill={gasPercentWithRound >= 22 ? '#24E37D' : '#535E7A'}/>
            <path id='c_41' d="M83.7736 46.5484L81.126 46.2768L81.1712 45.9827L83.7962 46.2542L83.7736 46.5484Z" fill={gasPercentWithRound >= 82 ? '#24E37D' : '#535E7A'}/>
            <path id='c_42' d="M3.48421 33.9664L0.881836 33.4233L0.949724 33.1292L3.55209 33.6723L3.48421 33.9664Z" fill={gasPercentWithRound >= 24 ? '#24E37D' : '#535E7A'}/>
            <path id='c_43' d="M83.0485 50.8931L80.4688 50.3274L80.5366 50.0332L83.1164 50.5989L83.0485 50.8931Z" fill={gasPercentWithRound >= 84 ? '#24E37D' : '#535E7A'}/>
            <path id='c_44' d="M4.54913 29.9838L2.01465 29.1692L2.10517 28.875L4.63965 29.7123L4.54913 29.9838Z" fill={gasPercentWithRound >= 26 ? '#24E37D' : '#535E7A'}/>
            <path id='c_45' d="M81.9183 55.125L79.3838 54.3104L79.4969 54.0388L82.0088 54.8535L81.9183 55.125Z" fill={gasPercentWithRound >= 86 ? '#24E37D' : '#535E7A'}/>
            <path id='c_46' d="M5.99653 26.1368L3.5752 25.0506L3.68834 24.7791L6.13231 25.8653L5.99653 26.1368Z" fill={gasPercentWithRound >= 28 ? '#24E37D' : '#535E7A'}/>
            <path id='c_47' d="M80.3108 59.2209L77.9121 58.1573L78.0253 57.8857L80.4466 58.9493L80.3108 59.2209Z" fill={gasPercentWithRound >= 88 ? '#24E37D' : '#535E7A'}/>
            <path id='c_48' d="M10.0931 19.0086L7.94336 17.4245L8.10176 17.1982L10.2742 18.7597L10.0931 19.0086Z" fill={gasPercentWithRound >= 32 ? '#24E37D' : '#535E7A'}/>
            <path id='c_49' d="M75.8996 66.8242L73.7725 65.2628L73.9309 65.0139L76.0807 66.5753L75.8996 66.8242Z" fill={gasPercentWithRound >= 92 ? '#24E37D' : '#535E7A'}/>
            <path id='c_50' d="M12.672 15.7953L10.6807 14.0075L10.8843 13.7812L12.8757 15.569L12.672 15.7953Z" fill={gasPercentWithRound >= 34 ? '#24E37D' : '#535E7A'}/>
            <path id='c_51' d="M73.1152 70.2187L71.1465 68.4536L71.3501 68.2273L73.3189 69.9924L73.1152 70.2187Z" fill={gasPercentWithRound >= 94 ? '#24E37D' : '#535E7A'}/>
            <path id='c_52' d="M15.569 12.8762L13.7812 10.8848L14.0075 10.6812L15.7953 12.6725L15.569 12.8762Z" fill={gasPercentWithRound >= 36 ? '#24E37D' : '#535E7A'}/>
            <path id='c_53' d="M69.9926 73.3191L68.2275 71.3504L68.4538 71.1467L70.2189 73.1155L69.9926 73.3191Z" fill={gasPercentWithRound >= 96 ? '#24E37D' : '#535E7A'}/>
            <path id='c_54' d="M18.7597 10.2737L17.1982 8.10128L17.4245 7.94287L19.0086 10.0927L18.7597 10.2737Z" fill={gasPercentWithRound >= 38 ? '#24E37D' : '#535E7A'}/>
            <path id='c_55' d="M66.5751 76.0797L65.0137 73.9299L65.2626 73.7715L66.824 75.8986L66.5751 76.0797Z" fill={gasPercentWithRound >= 98 ? '#24E37D' : '#535E7A'}/>
            <path id='c_56' d="M22.1994 8.01078L20.8643 5.70259L21.1358 5.54419L22.4709 7.85238L22.1994 8.01078Z" fill={gasPercentWithRound >= 40 ? '#24E37D' : '#535E7A'}/>
            <path id='c_57' d="M62.8869 78.4559L61.5518 76.1704L61.8233 76.012L63.1358 78.2975L62.8869 78.4559Z" fill={gasPercentWithRound >= 100 ? '#24E37D' : '#535E7A'}/>
            <path id='c_58' d="M25.8655 6.13255L24.7793 3.68859L25.0508 3.57544L26.1371 5.99678L25.8655 6.13255Z" fill={gasPercentWithRound >= 42 ? '#24E37D' : '#535E7A'}/>
            <path id='c_59' d="M29.7123 4.63916L28.875 2.10468L29.1692 2.01416L29.9838 4.54864L29.7123 4.63916Z" fill={gasPercentWithRound >= 44 ? '#24E37D' : '#535E7A'}/>
            <path id='c_60' d="M33.672 3.55283L33.1289 0.950456L33.4231 0.882568L33.9662 3.48494L33.672 3.55283Z" fill={gasPercentWithRound >= 46 ? '#24E37D' : '#535E7A'}/>
            <path id='c_61' d="M37.7462 2.8965L37.4746 0.248872L37.7688 0.203613L38.0403 2.85124L37.7462 2.8965Z" fill={gasPercentWithRound >= 48 ? '#24E37D' : '#535E7A'}/>
            <path id='c_62' d="M41.8643 2.67026V0H42.1584V2.67026H41.8643Z" fill={gasPercentWithRound >= 50 ? '#24E37D' : '#535E7A'}/>
          </svg>

        </div>
      </div>
    )
  }
}
