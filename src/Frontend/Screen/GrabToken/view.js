import React from 'react'
import './styles.css'
import { Tooltip, Tabs, List } from 'antd'
import { convertTimestampToDate, formatNumberLeftZero, convertWeiToBalance, convertBalanceToWei } from 'Utils/globalFunction'
import ApplyForAirdrop from './SubView/ApplyForAirdrop'
import UpdateMyAirdrop from './SubView/UpdateMyAirdrop'
import AirdropRight from './SubView/AirdropRight'
import TokenSaleRight from './SubView/TokenSaleRight'
import TokenSaleTerm from './SubView/TokenSaleTerm'
import TokenSaleConfirm from './SubView/TokenSaleConfirm'
import Images from 'Assets/Image'
import { Spin } from 'Frontend/Components/HBLoader'
import { HBPopupConfirm } from 'Frontend/Components/HBPopup'
import Modal from 'Frontend/Components/HBModal/FadeModal'
import NotificationPopup from './NotificationPopup/view'
import HBImage from 'Frontend/Components/HBImage'
import Settings from 'Backend/settings'
import moment from 'moment'
import { HBCURRENCY_SYMBOL, HBCURRENCY } from 'Utils/globalConstants'

const TabPane = Tabs.TabPane
const TAB_SELECTED = {
  AIRDROP: '1',
  TOKEN_SALE: '2',
  CLOSED: '3'
}

export default class View extends React.PureComponent {
  constructor (props) {
    super(props)
    let newArrAirdrop = props.arrAirdrop.filter(e => (!e.isExpire && e.isActive) || (!e.isExpire && e.is721Drop === true))
    props.funcDefautlThis(this)
    this.state = ({
      isLoading: true,
      selectedAirdrop: newArrAirdrop && newArrAirdrop[0],
      indexAirdrop: 0,
      indexTokenSale: 0,
      tabSelected: TAB_SELECTED.AIRDROP,
      ethAmount: '',
      tokenAmount: '',
      ethConfirmAmount: '',
      currencyConfirmAmount: '',
      receiverAccount: '',
      isTermScreen: false,
      isConfirmScreen: false,
      isDisableSend: true,
      isSendAmountErr: false,
      fSpendable: 0,
      isErrorMindeposit: false,
      tokenConfirmAmount: '',
      isLoadingSpendable: true,
      isLoadingExcute: false,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      daysG: 0,
      hoursG: 0,
      minutesG: 0,
      secondsG: 0,
      deadline: 1554076800000, // April 4 2019
      deadlineGacha: 1554076800000, // April 4 2019
      deadlineAllGacha: 1554076800000, // April 4 2019
      isEnableRequest: false,
      isEnableJoin: false,
      smoothSlider: true,
      isApplyForAirdrop: false,
      arrMyAirdrop: [],
      isMyAirdrop: false,
      isUpdateMyAirdrop: false,
      isAddressErr: false,
      txtReceiveAddr: '',
      detailMyAirdrop: {},
      loadingPause: false,
      loadingWithdraw: false,
      isLoadingHistory721: true,
      history721: false,
      listHistory: [],
      loadImg: false,
      itemAirdrop721: [],
      isGetting721: false,
      awardGame: {},
      awardImage: null,
      getHistoryPrize: null,
      getHistoryAmount: null,
      getHistoryName: null,
      fullTime: true,
      timeRequestGacha: 0,
      randomImages: Images.gacha[0],
      transactionFee: 0,
      gasInput: 0,
      getGasFee: 50,
      gasPrice: {slow: 1, medium: 2, fast: 3},
      gasPriceToShow: {slowest: 1, slow: 2, medium: 3, fast: 4, fastest: 5},
      gasLimit: 50000, // gas limit for gacha
      isErrorGas: false,
      isLoadingWinnerList: true,
      getWinnerList: [],
      countTxs: 0,
      gachaCode: false,
      isGachaErr: false,
      gcName: false,
      gcBalance: false,
      valueGachaCode: '',
      getGachaCode: false,
      isExpireAirdrops: null,
      tabClosed: false,
      totalNumGacha: 0,
      pageNum: 1,
      hasMore: true,
      isLoadMore: false
    })
    this.currency = props.arrCurrencyData === undefined
      ? HBCURRENCY_SYMBOL[HBCURRENCY.JPY]
      : HBCURRENCY_SYMBOL[props.arrCurrencyData]
    this._isMounted = false
  }
  componentDidMount () {
    this.props.fetchInitData()
    this.props.fetchGasPrice()
    this.getTimeUntil()
    this.getTimeUntilGacha()
    this.getTimeRequestGacha()
    setInterval(() => {
      this.getTimeUntil()
      this.getTimeUntilGacha()
      this.getTimeRequestGacha()
    }, 1000)
    this._isMounted = true
  }
  componentWillUnmount () {
    this._isMounted = false
  }

  leading0 (num) {
    return num < 10 ? '0' + num : num
  }
  setDefaultSmoothSlider () {
    this.setState({ smoothSlider: true })
  }
  twoNumber (num) {
    return ('0' + num).slice(-2)
  }
  getTimeUntilGachaOLD () {
    let time = this.state.deadlineGacha - Date.parse(new Date())
    if (time < 0) {
      this.setState({ daysG: 0, hoursG: 0, minutesG: 0, secondsG: 0, fullTime: true })
    } else {
      let secondsG = Math.floor((time / 1000) % 60)
      let minutesG = Math.floor((time / 1000 / 60) % 60) + 1
      let hoursG = Math.floor((time / (1000 * 60 * 60)) % 24)
      let daysG = Math.floor(time / (1000 * 60 * 60 * 24))
      this.setState({ daysG, hoursG, minutesG, secondsG })
    }
  }
  getTimeUntilGacha () {
    let deadlineAllGacha = this.state.deadlineAllGacha
    if (deadlineAllGacha) {
      for (let i = 0; i < deadlineAllGacha.length; i++) {
        if (deadlineAllGacha[i].gdeadlineGacha > 0) {
          let time = deadlineAllGacha[i].gdeadlineGacha - Date.parse(new Date())
          if (time === 0) {
            this.state.selectedAirdrop && this.props.selectedCellAirdrop(this.state.selectedAirdrop)
          }
          if (time < 0) {
            deadlineAllGacha[i].daysG = 0
            deadlineAllGacha[i].hoursG = 0
            deadlineAllGacha[i].minutesG = 0
            deadlineAllGacha[i].secondsG = 0
            deadlineAllGacha[i].gfullTime = true
            this.setState({ deadlineAllGacha })
          } else {
            let secondsG = Math.floor((time / 1000) % 60)
            let minutesG = Math.floor((time / 1000 / 60) % 60) + 1
            let hoursG = Math.floor((time / (1000 * 60 * 60)) % 24)
            let daysG = Math.floor(time / (1000 * 60 * 60 * 24))
            if (minutesG === 60) {
              minutesG = 0
              hoursG++
            }
            deadlineAllGacha[i].daysG = daysG
            deadlineAllGacha[i].hoursG = hoursG
            deadlineAllGacha[i].minutesG = minutesG
            deadlineAllGacha[i].secondsG = secondsG
            this.setState({ deadlineAllGacha })
          }
        }
      }
    }
  }
  getTimeUntil () {
    const time = this.state.deadline - Date.parse(new Date())
    if (time < 0) {
      this.setState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
    } else {
      const seconds = Math.floor((time / 1000) % 60)
      const minutes = Math.floor((time / 1000 / 60) % 60)
      const hours = Math.floor((time / (1000 * 60 * 60)) % 24)
      const days = Math.floor(time / (1000 * 60 * 60 * 24))
      this.setState({ days, hours, minutes, seconds })
    }
  }
  getTimeRequestGacha () {
    let time = this.state.timeRequestGacha
    if (time <= 0) {
      this.setState({ timeRequestGacha: 0 })
      this.refs.md_mab_confirm2 && this.refs.md_mab_confirm2.hide()
    } else {
      this.setState({ timeRequestGacha: time - 1 }, () => {
        if ((time - 2) === 0) {
          this.refs.md_mab_confirm2 && this.refs.md_mab_confirm2.hide()
        }
        if ((time - 1) === 0 && !this.state.history721 && !this.state.isErrorGas) {
          this.refs.md_mab_confirm3 && this.refs.md_mab_confirm3.show()
        }
      })
    }
  }
  ImageExist = async (url) => {
    var img = new Image()
    img.src = url
    return img.height !== 0
  }
  render () {
    const { isApplyForAirdrop, isUpdateMyAirdrop, isAddressErr, txtReceiveAddr, indexAirdrop, detailMyAirdrop, arrMyAirdrop, loadingPause, loadingWithdraw, selectedAirdrop, awardGame, awardImage, getHistoryPrize, getHistoryAmount, getHistoryName, history721, randomImages, isLoadingWinnerList, getWinnerList, awardGamev2, gasPrice, gasLimit, gasPriceToShow } = this.state
    const { clickAirDrop, clickCancel, backToTop, t, onClickMyAirdrop, onClickPauseAirdrop, onClickStopAirdrop, onCheckWithdraw, onClickWithdrawAirdrop, handlePauseAirdrop, handleStopAirdrop, cancelAirdrop, arrAirdrop, handleWithdrawAirdrop, click2AirDrop, click3AirDrop, click4AirDrop, onCancel2, onCancel3, onCancel4, openViewTransaction } = this.props
    return (
      <div className='gt-container'>
        {isApplyForAirdrop
          ? isUpdateMyAirdrop
            ? <UpdateMyAirdrop 
              onClickMyAirdrop={onClickMyAirdrop}
              onClickPauseAirdrop={onClickPauseAirdrop}
              onClickStopAirdrop={onClickStopAirdrop}
              onCheckWithdraw={onCheckWithdraw}
              isAddressErr={isAddressErr}
              txtReceiveAddr={txtReceiveAddr}
              onClickWithdrawAirdrop={onClickWithdrawAirdrop}
              item={selectedAirdrop}
              detailMyAirdrop={detailMyAirdrop}
              loadingPause={loadingPause}
              loadingWithdraw={loadingWithdraw}
              t={t}/>
            : <ApplyForAirdrop backToTop={backToTop} t={t}/>
          : this.renderGrabToken()
        }
        <Modal ref="md_mab_confirm">
          <HBPopupConfirm
            onOk={clickAirDrop}
            onCancel={clickCancel}
            addClass={'air-editHeight'}
            header={'RequestToken'}
            titleCancel={'cancel'}
            titleOk={'Agree'}
            message={t('TransactionFeesWillBeRequired')}
            t={t}
          />
        </Modal>
        <Modal ref="md_mab_confirmGacha">
          <HBPopupConfirm
            onOk={clickAirDrop}
            onCancel={clickCancel}
            addClass={'air-editHeight'}
            header={t('gachaTitlePopup')}
            titleCancel={t('cancel')}
            titleOk={t('gachaDrop')}
            imagesIntro={randomImages}
            HBHasGas={true}
            handleChangeGasPriceAirdrop={this.props.handleChangeGasPriceAirdrop}
            t={t}
            THIS={this}
            gachaCode={this.state.gachaCode}
            isGachaErr={this.state.isGachaErr}
            valueGachaCode={this.state.valueGachaCode}
            getGachaCode={this.state.getGachaCode}
            handleResult={this.props.saveGasFee}
          />
        </Modal>
        <Modal ref="md_mab_confirm2">
          <HBPopupConfirm
            onOk={click2AirDrop}
            onCancel={onCancel2}
            addClass={'air-editHeight'}
            header={t('gachaRequesting')}
            titleOk={t('ok')}
            noCancel={true}
            imagesIntro={Images.gacha[1]}
            isExecuting={true}
            HBHasGas={true}
            HBHasGasForView={true}
            t={t}
            THIS={this}
            getGasFee={this.state.getGasFee}
          />
        </Modal>
        <Modal ref="md_mab_confirm3" className='air-editWidth'>
          <HBPopupConfirm
            onOk={click3AirDrop}
            onCancel={onCancel3}
            addClass={'air-editHeight'}
            header={t('gachaRequest')}
            titleOk={t('ok')}
            noCancel={true}
            message={t('gachaNote3')}
            imagesIntro={Images.gacha[4]}
            t={t}
          />
        </Modal>
        <Modal ref="md_mab_confirm4" className='air-editWidth'>
          <HBPopupConfirm
            onOk={click4AirDrop}
            onCancel={onCancel4}
            addClass={'air-editHeight'}
            header={t('gachaSendErr')}
            titleOk={t('ok')}
            noCancel={true}
            message={t('gasGachaNotEnough')}
            imagesIntro={Images.gacha[3]}
            t={t}
          />
        </Modal>
        <Modal ref="modalNotificationPopupPause">
          <NotificationPopup
            handleAirdrop={() => handlePauseAirdrop(selectedAirdrop)}
            cancelAirdrop={cancelAirdrop}
            t={t}
            title={(detailMyAirdrop && detailMyAirdrop.stop) ? 'afa-unPause' : 'afa-Pause'}
            message={(detailMyAirdrop && detailMyAirdrop.stop) ? 'afa-AreYouSureUnPause' : 'afa-AreYouSurePause'}
          />
        </Modal>
        <Modal ref="modalNotificationPopupWithdraw">
          <NotificationPopup
            handleAirdrop={() => handleWithdrawAirdrop(selectedAirdrop)}
            cancelAirdrop={cancelAirdrop}
            t={t}
            title={'withdraw'}
            message={'afa-AreYouSureWithdraw'}
          />
        </Modal>
        
        {awardGamev2 && awardGamev2.numAudio === 1 
          ? <Modal ref="modalPriceAirdrop" className="img-priceAirdrop img-priceAirdropV2">
            <div id="lottie" onClick={() => this.refs.modalPriceAirdrop.hide()}>
              <div className="op05">
                <img className='img-effect img-effect0 fadeIn' src={Images.gc_img1} />
              </div>
              <img className='img-effect img-effect1 fadeIn' src={Images.gc_img2} />
              <img className='img-effect img-effect4 aniInfinite1' src={Images.gc_img7} />
              <img className='img-effect img-effect8 fadeInInfinite2' src={Images.gc_img9} />
              <img className='img-effect img-effect8a-lost fadeIn' src={Images.gc_img8} />
              <img className='img-effect img-effect8b fadeIn' src={Images.gc_img10} />
              <img className='img-effect img-effect8c fadeIn' src={Images.gc_img5} />
              <img className='img-effect img-effect8b1 fadeIn' src={Images.gc_img10} />
              <img className='img-effect img-effect8c1-lost fadeIn' src={Images.gc_img5} />
              <img className='img-effect img-effect10 aniInfinite' src={Images.gc_img11} />
            </div>
          </Modal>
          : awardGamev2 && awardGamev2.numAudio === 2 
            ? <Modal ref="modalPriceAirdrop" className="img-priceAirdrop img-priceAirdropV2">
              <div id="lottie" onClick={() => this.refs.modalPriceAirdrop.hide()}>
                <div className="op05">
                  <img className='img-effect img-effect0 fadeIn' src={Images.gc_img1} />
                </div>
                <img className='img-effect img-effect1 fadeIn' src={Images.gc_img2} />
                <img className='img-effect img-effect4 aniInfinite1' src={Images.gc_img7} />
                <img className='img-effect img-effect8 aniInfinite1' src={Images.gc_img9} />
                <img className='img-effect img-effect8a aniInfinite1' src={Images.gc_img8} />
                <img className='img-effect img-effect8d17 fadeIn' src={awardGamev2.image} />
                <img className='img-effect img-effect10 top82 aniInfinite' src={Images.gc_img3} />
                <div className='wait3Days fadeIn'>{t('wait3Days')}</div>
              </div>
            </Modal>
            : awardGamev2 && awardGamev2.numAudio === 3 
              ? <Modal ref="modalPriceAirdrop" className="img-priceAirdrop img-priceAirdropV2">
                <div id="lottie" onClick={() => this.refs.modalPriceAirdrop.hide()}>
                  <div className="op05">
                    <img className='img-effect img-effect0 fadeIn' src={Images.gc_img1} />
                  </div>
                  <img className='img-effect img-effect1 fadeIn' src={Images.gc_img2} />
                  <img className='img-effect img-effect4 aniInfinite1' src={Images.gc_img7} />
                  <img className='img-effect img-effect8 fadeInInfinite2' src={Images.gc_img9} />
                  <img className='img-effect img-effect8a fadeIn' src={Images.gc_img8} />
                  <img className='img-effect img-effect8b fadeIn' src={Images.gc_img10} />
                  <img className='img-effect img-effect8c fadeIn' src={Images.gc_img5} />
                  <img className='img-effect img-effect8b1 fadeIn' src={Images.gc_img10} />
                  <img className='img-effect img-effect8c1 fadeIn' src={Images.gc_img5} />
                  <img className='img-effect img-effect8c2 fadeIn' src={Images.gc_img5} />
                  <img className='img-effect img-effect8d fadeIn' src={Images.gc_img4} />
                  <div className='crack_img'>
                    <img className='img-effect img-effect8d1 fadeIn' src={Images.crack_img0} />
                    <img className='img-effect img-effect8d2 fadeIn' src={Images.crack_img1} />
                    <img className='img-effect img-effect8d3 fadeIn' src={Images.crack_img2} />
                    <img className='img-effect img-effect8d4 fadeIn' src={Images.crack_img3} />
                    <img className='img-effect img-effect8d5 fadeIn' src={Images.crack_img4} />
                    <img className='img-effect img-effect8d6 fadeIn' src={Images.crack_img5} />
                    <img className='img-effect img-effect8d7 fadeIn' src={Images.crack_img6} />
                    <img className='img-effect img-effect8d8 fadeIn' src={Images.crack_img7} />
                    <img className='img-effect img-effect8d9 fadeIn' src={Images.crack_img8} />
                    <img className='img-effect img-effect8d10 fadeIn' src={Images.crack_img9} />
                    <img className='img-effect img-effect8d11 fadeIn' src={Images.crack_img10} />
                    <img className='img-effect img-effect8d12 fadeIn' src={Images.crack_img11} />
                    <img className='img-effect img-effect8d13 fadeIn' src={Images.crack_img12} />
                    <img className='img-effect img-effect8d14 fadeIn' src={Images.crack_img13} />
                    <img className='img-effect img-effect8d15 fadeIn' src={Images.crack_img14} />
                  </div>
                  <img className='img-effect img-effect8d19 aniInfinite' src={Images.gc_img7} />
                  <img className='img-effect img-effect8d16 fadeIn' src={awardGamev2.image} />
                  <img className='img-effect img-effect10b top82 aniInfinite' src={Images.gc_img6} />
                  <div className='wait3Days wait3DaysB fadeIn'>{t('wait3Days')}</div>
                </div>
              </Modal>
              : awardGamev2 && awardGamev2.numAudio === 0 
                ? <Modal ref="modalPriceAirdrop" className="img-priceAirdrop img-priceAirdropV2">
                  <div id="lottie" onClick={() => this.refs.modalPriceAirdrop.hide()}>
                    <div className="op05">
                      <img className='img-effect img-effect0 fadeIn' src={Images.gc_img1} />
                    </div>
                    <img className='img-effect img-effect1 fadeIn' src={Images.gc_img2} />
                    <img className='img-effect img-effect4 aniInfinite1' src={Images.gc_img7} />
                    <img className='img-effect img-effect8 aniInfinite1' src={Images.gc_img9} />
                    <img className='img-effect img-effect10a aniInfinite' src={Images.gc_img11} />
                  </div>
                </Modal>
                : awardGame 
                  ? <Modal ref="modalPriceAirdrop" className="img-priceAirdrop">
                    {(awardImage === 5 && !history721) || (awardImage === 4 && !history721) || getHistoryPrize === 5 || getHistoryPrize === 4
                      ? <div id="lottie">
                        <img className='img-effect img-effect0 fadeIn' src={Images.ea_image0} />
                        <img className='img-effect img-effect1 fadeIn' src={Images.ea_image1} />
                        <img className='img-effect img-effect2 fadeIn' src={Images.ea_image2} />
                        <img className='img-effect img-effect3 fadeIn' src={Images.ea_image3} />
                        <img className='img-effect img-effect4 fadeIn' src={Images.ea_image4} />
                        <img className='img-effect img-effect5 fadeIn' src={Images.ea_image5} />
                        <img className='img-effect img-effect6 fadeIn' src={Images.ea_image6} />
                        <img className='img-effect img-effect7 fadeIn' src={Images.ea_image7} />
                        <img className='img-effect img-effect8 fadeIn' src={Images.ea_image8} />
                        <img className='img-effect img-effect9 fadeIn' src={Images.ea_image9} />
                        <img className='img-effect img-effect10 aniInfinite' src={Images.ea_image10} />
                        <img className='img-effect img-effect11 aniInfinite' src={Images.ea_image11} />
                        {/* Default award */}
                        <img className='img-effect img-effect12 upDownInfinite' src={Images.ea_imagePrice3} />
                        {getHistoryPrize 
                          ? <div className='img-effectText'>{t('gotMoney', {value: getHistoryAmount + ' ' + getHistoryName})}</div>
                          : <div className='img-effectText'>{t('gotMoney', {value: awardGame.amount + ' ' + awardGame.name})}</div>}
                      </div>
                      : <div id="lottie">
                        <div className='wrapFade2'>
                          <img className='img-effect img-effect0 fadeIn' src={Images.ea_image0} />
                          <img className='img-effect img-effect1 fadeIn' src={Images.ea_image1} />
                          <img className='img-effect img-effect2 fadeIn' src={Images.ea_image2} />
                          <img className='img-effect img-effect3 fadeIn' src={Images.ea_image3} />
                          <img className='img-effect img-effect4 fadeIn' src={Images.ea_image4} />
                          <img className='img-effect img-effect5 fadeIn' src={Images.ea_image5} />
                          <img className='img-effect img-effect6 fadeIn' src={Images.ea_image6} />
                          <img className='img-effect img-effect7 fadeIn' src={Images.ea_image7} />
                          <img className='img-effect img-effect8 fadeIn' src={Images.ea_image8} />
                          <img className='img-effect img-effect9 fadeIn' src={Images.ea_image9} />
                          <img className='img-effect img-effect10 aniInfinite' src={Images.ea_image10} />
                          <img className='img-effect img-effect11 aniInfinite' src={Images.ea_image11} />
                        </div>
                        {/* when user got a bigger award */}
                        <div className='img-effect img-effect13 wrapShakeTwo'><img className='shakeTwo' src={Images.ea_imagePrice3} /></div>
                        <img className='img-effect img-effect14 fadeIn' src={Images.ea_imageBroken0} />
                        <img className='img-effect img-effect15 fadeIn' src={Images.ea_imageBroken1} />
                        <img className='img-effect img-effect16 fadeIn' src={Images.ea_imageBroken2} />
                        <img className='img-effect img-effect17 fadeIn' src={Images.ea_imageBroken3} />
                        <img className='img-effect img-effect18 fadeIn' src={Images.ea_imageBroken4} />
                        <img className='img-effect img-effect19 fadeIn' src={Images.ea_imageBroken5} />
                        <img className='img-effect img-effect20 fadeIn' src={Images.ea_imageBroken6} />
                        <img className='img-effect img-effectB0 fadeIn' src={Images.ea_imageRed0} />
                        <img className='img-effect img-effectB1 fadeIn' src={Images.ea_imageRed1} />
                        <img className='img-effect img-effectB2 fadeIn' src={Images.ea_imageRed2} />
                        <img className='img-effect img-effectB3 fadeIn' src={Images.ea_imageRed3} />
                        <img className='img-effect img-effectB4 fadeIn' src={Images.ea_imageRed4} />
                        <img className='img-effect img-effectB5 fadeIn' src={Images.ea_imageRed5} /> 
                        <img className='img-effect img-effectB6 fadeIn' src={Images.ea_imageRed6} />
                        <img className='img-effect img-effectB7 fadeIn' src={Images.ea_imageRed7} />
                        <img className='img-effect img-effectB8 fadeIn' src={Images.ea_imageRed8} />
                        <img className='img-effect img-effectB9 fadeIn' src={Images.ea_imageRed9} />
                        <img className='img-effect img-effectB10 aniInfinite' src={Images.ea_imageRed10} />
                        <img className='img-effect img-effectB11 aniInfinite' src={Images.ea_imageRed11} />
          
                        {history721
                          ? <div>
                            {(getHistoryPrize === 1) && <img className='img-effect img-effect21 upDownInfinite2' src={Images.ea_imagePrice0} />}
                            {(getHistoryPrize === 2) && <img className='img-effect img-effect22 upDownInfinite2' src={Images.ea_imagePrice0} />}
                            {(getHistoryPrize === 3) && <img className='img-effect img-effect23 upDownInfinite2' src={Images.ea_imagePrice2} />}
                          </div>
                          : <div>
                            {(awardImage === 1) && <img className='img-effect img-effect21 upDownInfinite2' src={Images.ea_imagePrice0} />}
                            {(awardImage === 2) && <img className='img-effect img-effect22 upDownInfinite2' src={Images.ea_imagePrice0} />}
                            {(awardImage === 3) && <img className='img-effect img-effect23 upDownInfinite2' src={Images.ea_imagePrice2} />}
                          </div>
                        }
                        {getHistoryPrize 
                          ? <div className='img-effectText2'>{t('gotMoney', {value: getHistoryAmount + ' ' + getHistoryName})}</div>
                          : <div className='img-effectText2'>{t('gotMoney', {value: awardGame.amount + ' ' + awardGame.name})}</div>}
                      </div>}
                  </Modal>
                  : console.log('cant got any thing!')}
        <Modal ref="modalWinnerList" className="md-mab-request">
          <div className="wrapPopup-request wrap-WinnerList">
            <div className="edt-md-header">
              <div className="pp-close" onClick={() => this.refs.modalWinnerList.hide()}><img src={Images.close1} /></div>
              {t('gc-list')}
            </div>
            {isLoadingWinnerList
              ? <div className='gc-loading'><Spin/></div>
              : getWinnerList
                ? <List
                  id="HBScrollBar"
                  className="grab-token-list"
                  dataSource={getWinnerList}
                  renderItem={(item, index) => this.renderWinnerList(item, index, openViewTransaction, t)}
                  locale={{ emptyText: t('NoData') }}/>
                : <div className="gc-noDataList">
                  <img alt='img' src={Images.noInternet1} className={'mdToken-imgNoInternet'} />
                  <div className="txtNoResult">{t('NoData')}</div>
                </div>
            }
          </div>
        </Modal>
        <Modal ref="modalTransactionFee" className="md-mab-request md-TransactionFee">
          <div className="wrapPopup-request wrap-TransactionFee">
            <div className="edt-md-header">
              <div className="pp-close" onClick={() => this.refs.modalTransactionFee.hide()}><img src={Images.close1} /></div>
              {t('feeRef')}
            </div>
            <div className="tf-content">
              <div className="adr-gacha-title7">{t('FreeContent7')}</div>
              <div className="adr-gacha-title7a">{t('FreeContent7a', {eth: gasPriceToShow && gasPriceToShow.slowest, price: formatNumberLeftZero((gasPrice && Number(gasPriceToShow.slowest) * this.props.etherPrice.price), 4), currency: this.currency})}</div>
              <div className="adr-gacha-title8">{t('FreeContent17')}</div>
              <div className="adr-gacha-title8a">{t('FreeContent17a', {eth: gasPriceToShow && gasPriceToShow.slow, price: formatNumberLeftZero((gasPrice && Number(gasPriceToShow.slow) * this.props.etherPrice.price), 4), currency: this.currency})}</div>
              <div className="adr-gacha-title8">{t('FreeContent8')}</div>
              <div className="adr-gacha-title8a">{t('FreeContent8a', {eth: gasPriceToShow && gasPriceToShow.medium, price: formatNumberLeftZero((gasPrice && Number(gasPriceToShow.medium) * this.props.etherPrice.price), 4), currency: this.currency})}</div>
              <div className="adr-gacha-title8">{t('FreeContent18')}</div>
              <div className="adr-gacha-title8a">{t('FreeContent18a', {eth: gasPriceToShow && gasPriceToShow.fast, price: formatNumberLeftZero((gasPrice && Number(gasPriceToShow.fast) * this.props.etherPrice.price), 4), currency: this.currency})}</div>
              <div className="adr-gacha-title9">{t('FreeContent9')}</div>
              <div className="adr-gacha-title9a">{t('FreeContent9a', {eth: gasPriceToShow && gasPriceToShow.fastest, price: formatNumberLeftZero((gasPrice && Number(gasPriceToShow.fastest) * this.props.etherPrice.price), 4), currency: this.currency})}</div>
              <div className="adr-gacha-title10">{t('FreeContent10')}</div>
              <div className="tf-notice">
                <div className="adr-gacha-title11">{t('FreeContent11')}</div>
                <div className="adr-gacha-title12">{t('FreeContent12')}</div>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    )
  }

  renderGrabToken () {
    const {
      indexAirdrop, indexTokenSale, fSpendable,
      tabSelected, ethAmount, tokenAmount, isLoading, isErrorMindeposit,
      isTermScreen, isConfirmScreen, currencyConfirmAmount,
      ethConfirmAmount, receiverAccount, isSendAmountErr, isDisableSend,
      tokenConfirmAmount, isLoadingSpendable, isLoadingExcute, 
      smoothSlider, isMyAirdrop, arrMyAirdrop, selectedAirdrop, daysG, hoursG, minutesG, secondsG, fullTime, isExpireAirdrops, deadlineAllGacha
    } = this.state
    const {
      arrTokenSale, arrAirdrop,
      selectedCellAirdrop, selectedCellTokenSale, selectedExpireCellAirdrop,
      onChangeTab, requestAirDrop, t,
      onChangeEthereumAmount, onChangeTokenAmount,
      joinBuyToken, gotoConfirmScreen,
      arrCurrencyData, onChangeCurrency, cancelTerm,
      calculateSendAmount, onChangeReceiverAccount, clickOpenModal, clickOpenModalGacha,
      onClickMax, cancelConfirm, sendEth, onChangeTokenConfirm, localeData,
      onClickApplyForAirdrop, onClickMyAirdrop, onUpdateMyAirdrop, sendTokenToSmartContract,
      openExternalPending, onClickTab
    } = this.props
    console.log('arrAirdrop123: ', arrAirdrop)
    let arrAirdropOpen = arrAirdrop.filter(e => (!e.isExpire && (!e.hasOwnProperty('isActive') || e.isActive)) || (!e.isExpire && e.is721Drop === true))
    console.log('arrAirdropOpen123: ', arrAirdropOpen)
    return (
      <React.Fragment>
        <div className={'gt-left-container ' + (localeData === 'jp' ? 'gt-fontJapan-2px' : '')}>
          {!isMyAirdrop && <div className="gt-group-btn">
            <button className="btn-add-sub-acount btn-myAirDrop" onClick={() => onClickMyAirdrop(true)}>{t('myAirDrop')}</button>
            <Tooltip placement="bottom" title={t('ApplyAirdrop.anyoneCanApplyAirdrop')}>
              <button className="btn-add-sub-acount" onClick={onClickApplyForAirdrop}>{t('ApplyForAirdrop')}</button>
            </Tooltip>
          </div>}
          {isMyAirdrop
            ? <div className='gt-list-container'>
              <button className="exs-btn-Back" onClick={() => onClickMyAirdrop(false)}>
                <img className="img-back" alt='imgBack' src={Images.tabNaviBack} />
                {t('Airdrop')}
              </button>
              <div className='gt-list-myAirdrop'>
                <div className="sts-header">
                  <div className="sts-header-title">{t('myAirDrop')}</div>
                </div>
                {isLoading
                  ? <div className='gt-list-loading'><Spin/></div>
                  : arrMyAirdrop.length === 0
                    ? <div className="gt-noData">
                      <img alt='img' src={Images.noInternet1} className={'mdToken-imgNoInternet'} />
                      <div className="txtNoResult">{t('noAirDrop')}</div>
                    </div>
                    : <List
                      id="HBScrollBar"
                      className="grab-token-list"
                      dataSource={arrMyAirdrop}
                      renderItem={(item, index) => this.renderCellAirdrop(item, index, selectedAirdrop, selectedCellAirdrop, t, isMyAirdrop, sendTokenToSmartContract, deadlineAllGacha)} />
                }
              </div>
            </div>
            : <Tabs defaultActiveKey={TAB_SELECTED.AIRDROP} onChange={(key) => onChangeTab(key)}>
              <TabPane tab={t('opening')} key={TAB_SELECTED.AIRDROP}>
                <div className='gt-list-container'>
                  <div className='gt-pending'>
                    <div className='gt-pending-icon'><img src={Images.etherIcon}/></div>
                    <div className='gt-pending-text' onClick={() => openExternalPending()}>{t('gc-queue')}</div>
                  </div>
                  {/* {arrAirdropOpen.length === 0
                    ? <div className="gt-noData">
                      <img alt='img' src={Images.noInternet1} className={'mdToken-imgNoInternet'} />
                      <div className="txtNoResult">{t('noAirDrop')}</div>
                    </div>
                    : <List
                      id="HBScrollBar"
                      className="grab-token-list"
                      dataSource={arrAirdropOpen} // remove airdrop expired
                      renderItem={(item, index) => this.renderCellAirdrop(item, index, selectedAirdrop, selectedCellAirdrop, t, isMyAirdrop, null, deadlineAllGacha, arrAirdropOpen)} />
                  } */}
                  <div id="HBScrollBar" className='grab-token-list'>
                    { arrAirdropOpen.length === 0
                      ? <div className="gt-noData">
                        <img alt='img' src={Images.noInternet1} className={'mdToken-imgNoInternet'} />
                        <div className="txtNoResult">{t('noAirDrop')}</div>
                      </div>
                      : <div className='ant-spin-container'>
                        <ul className='ant-list-items'>
                          { arrAirdropOpen.map((item, index) => {
                            let countDown = deadlineAllGacha && Array.isArray(deadlineAllGacha) && deadlineAllGacha.filter(e => e._idNew && item._id && e._idNew.toString() === item._id.toString())
                            return (
                              <li
                                key={index}
                                className={'ant-list-item ' + (item.isExpire
                                  ? 'gt-list-item-disable '
                                  : '') + (selectedAirdrop && item._id === selectedAirdrop._id
                                  ? 'gt-list-item-selected'
                                  : 'gt-list-item')}
                                onClick = {() => {
                                  selectedCellAirdrop(item)
                                  this.setDefaultSmoothSlider()
                                }}
                              >
                                {!item.isRead && <div className='tks-cell-unread'/>}
                                <div className='tks-icon-container'>
                                  <HBImage logo={item.imageLink} imgDefault={Images.ic_token_default} addClass={'tks-icon'}/>
                                </div>
                                {item.is721Drop || item.is721DropV1 || item.is721DropV2
                                  ? <div className='tks-cell-info tks-721'>
                                    <div className='tks-cell-name'>{item.name}</div>
                                    <div className={'tks-cell-content ' + (((countDown[0] && countDown[0].gfullTime) || !countDown[0]) && 'tks-721Start')}>
                                      {(countDown[0] && countDown[0].gfullTime) || !countDown[0]
                                        ? t('readyToPlay') 
                                        : t('startIn', {num: (countDown[0] && this.twoNumber(countDown[0].hoursG)) + ':' + (countDown[0] && this.twoNumber(countDown[0].minutesG))})}
                                    </div>
                                    <div className='tks-cell-date'>{item.short_description}</div>
                                    {(item.airdrop_amountNeed === 0 && item.is721Drop) && <div className='tks-cell-free'><img src={Images.discountGacha}/></div>}
                                    {(item.is721DropV1 || item.is721DropV2) && <div className='tks-cell-free'><img src={item.amount_image}/></div>}
                                  </div>
                                  : <div className='tks-cell-info'>
                                    <div className='tks-cell-name'>{item.name}</div>
                                    <div className='tks-cell-content'>{item.short_description}</div>
                                    <div className='tks-cell-date'>{convertTimestampToDate(item.start_time)}</div>
                                  </div>
                                }
                                {isMyAirdrop && item.isNotSendTokenToSmartContract && <Tooltip placement="top" title={<div style={{
                                  padding: '5px 5px 5px 5px',
                                  fontFamily: 'var(--font-helvetica-neue)',
                                  fontSize: '11px'}}>
                                  {t('afa-youHaveNotSentToken', { contract: item.contractAddress })}<br/>
                                  {t('afa-pleaseSendToken')}<br/>
                                  <button className="tks-send-token-btn" >{t('afa-sendToken')}</button>
                                </div>}>
                                  <div className='tks-cell-warning'><img src={Images.orderStatus[4]}/></div>
                                </Tooltip>}
                              </li>)
                          })}
                        </ul>
                      </div>
                    }
                  </div>
                </div>
              </TabPane>
              <TabPane tab={t('Closed')} key={TAB_SELECTED.CLOSED}>
                <div className='gt-list-container'>
                  <div className='gt-pending'>
                    <div className='gt-pending-icon'><img src={Images.etherIcon}/></div>
                    <div className='gt-pending-text' onClick={() => openExternalPending()}>{t('gc-queue')}</div>
                  </div>
                  {/* {isLoading
                    ? <div className='gt-list-loading'><Spin/></div>
                    : !isExpireAirdrops || isExpireAirdrops.length === 0
                      ? <div className="gt-noData">
                        <img alt='img' src={Images.noInternet1} className={'mdToken-imgNoInternet'} />
                        <div className="txtNoResult">{t('noTokenSale')}</div>
                      </div>
                      : <List
                        id="HBScrollBar"
                        className="grab-token-list"
                        dataSource={isExpireAirdrops}
                        renderItem={(item, index) => this.renderCellAirdropClosed(item, index, selectedAirdrop, selectedExpireCellAirdrop, t, isMyAirdrop, null)} />} */}
                  <div id="HBScrollBar" className='grab-token-list'>
                    {isLoading
                      ? <div className='gt-list-loading'><Spin/></div>
                      : !isExpireAirdrops || isExpireAirdrops.length === 0
                        ? <div className="gt-noData">
                          <img alt='img' src={Images.noInternet1} className={'mdToken-imgNoInternet'} />
                          <div className="txtNoResult">{t('noTokenSale')}</div>
                        </div>
                        : <div className='ant-spin-container'><ul className='ant-list-items'>
                          { isExpireAirdrops.map((item, index) => <li
                            key={index + 100}
                            className={'ant-list-item ' + (selectedAirdrop && item._id === selectedAirdrop._id
                              ? 'gt-list-item-selected'
                              : 'gt-list-item')}
                            onClick = {() => {
                              selectedExpireCellAirdrop(item)
                              this.setDefaultSmoothSlider() 
                            }}
                          >
                            <div className='tks-icon-container'>
                              <HBImage logo={item.imageLink} imgDefault={Images.ic_token_default} addClass={'tks-icon'}/>
                            </div>
                            {item.is721Drop || item.is721DropV1 || item.is721DropV2
                              ? <div className='tks-cell-info tks-721'>
                                <div className='tks-cell-name'>{item.name}</div>
                                <div className='tks-cell-ended'>{t('ended')}</div>
                                <div className='tks-cell-date'>{item.short_description}</div>
                                {(item.airdrop_amountNeed === 0 && item.is721Drop) && <div className='tks-cell-free'><img src={Images.discountGacha}/></div>}
                                {(item.is721DropV1 || item.is721DropV2) && <div className='tks-cell-free'><img src={item.amount_image}/></div>}
                              </div>
                              : <div className='tks-cell-info'>
                                <div className='tks-cell-name'>{item.name}</div>
                                <div className='tks-cell-content'>{item.short_description}</div>
                                <div className='tks-cell-date'>{convertTimestampToDate(item.start_time)}</div>
                              </div>
                            }
                            {isMyAirdrop && item.isNotSendTokenToSmartContract && <Tooltip placement="top" title={<div style={{
                              padding: '5px 5px 5px 5px',
                              fontFamily: 'var(--font-helvetica-neue)',
                              fontSize: '11px'}}>
                              {t('afa-youHaveNotSentToken', { contract: item.contractAddress })}<br/>
                              {t('afa-pleaseSendToken')}<br/>
                              <button className="tks-send-token-btn">{t('afa-sendToken')}</button>
                            </div>}>
                              <div className='tks-cell-warning'><img src={Images.orderStatus[4]}/></div>
                            </Tooltip>}
                          </li>
                          )}
                        </ul></div>
                    }
                  </div>
                </div>
              </TabPane>
            </Tabs>}
        </div>
        <div className='gt-right-container'>
          {tabSelected === (TAB_SELECTED.AIRDROP || TAB_SELECTED.CLOSED)
            ? <AirdropRight
              isEnableRequest={this.state.isEnableRequest}
              days={this.state.days}
              hours={this.state.hours}
              minutes={this.state.minutes}
              seconds ={this.state.seconds}
              item={this.state.selectedAirdrop}
              clickOpenModal={clickOpenModal}
              clickOpenModalGacha={clickOpenModalGacha}
              t= {t} requestAirDrop={requestAirDrop}
              smoothSlider={smoothSlider}
              that={this}
              isMyAirdrop={isMyAirdrop}
              onUpdateMyAirdrop={onUpdateMyAirdrop}
              history721={this.state.history721}
              listHistory={this.state.listHistory}
              isLoadingHistory721={this.state.isLoadingHistory721}
              loadImg={this.state.loadImg}
              itemAirdrop721={this.state.itemAirdrop721}
              isGetting721={this.state.isGetting721}
              backTo721={this.props.backTo721}
              goToNagemon={this.props.goToNagemon}
              clickOpenHistoryAirdrop721={this.props.clickOpenHistoryAirdrop721}
              currency={this.currency}
              etherPrice={this.props.etherPrice.price}
              openWinnerList={this.props.openWinnerList}
              countTxs={this.state.countTxs}
              openExternalContract={this.props.openExternalContract}
              openTransactionHistory={this.props.openTransactionHistory}
              openWinnerListSub={this.props.openWinnerListSub}
              openTransactionFee={this.props.openTransactionFee}
              goToGame={this.props.goToGame}
              gcName={this.state.gcName}
              gcBalance={this.state.gcBalance}
              tabClosed={this.state.tabClosed}
              hasMore={this.state.hasMore}
              handleInfiniteOnLoad={this.props.handleInfiniteOnLoad}
              isLoadMore={this.state.isLoadMore}
              localeData={this.props.localeData}
            />
            : isConfirmScreen
              ? <TokenSaleConfirm item={arrTokenSale[indexTokenSale]}
                receiverAccount={receiverAccount}
                onChangeReceiverAccount={onChangeReceiverAccount}
                ethConfirmAmount={ethConfirmAmount}
                calculateSendAmount={calculateSendAmount}
                arrCurrencyData={arrCurrencyData}
                currencyConfirmAmount={currencyConfirmAmount}
                onChangeCurrency={onChangeCurrency}
                onClickMax={onClickMax}
                sendEth={sendEth}
                cancelConfirm={cancelConfirm}
                isSendAmountErr={isSendAmountErr}
                isDisableSend={isDisableSend}
                fSpendable={fSpendable}
                isErrorMindeposit={isErrorMindeposit}
                tokenConfirmAmount={tokenConfirmAmount}
                onChangeTokenConfirm={onChangeTokenConfirm}
                isLoadingSpendable={isLoadingSpendable}
                isLoadingExcute={isLoadingExcute}
                t={t}
              />
              : isTermScreen
                ? <TokenSaleTerm
                  cancelTerm={cancelTerm}
                  gotoConfirmScreen={gotoConfirmScreen}
                  item={arrTokenSale[indexTokenSale]}
                  t={t}/>
                : <AirdropRight
                  isEnableRequest={this.state.isEnableRequest}
                  days={this.state.days}
                  hours={this.state.hours}
                  minutes={this.state.minutes}
                  seconds ={this.state.seconds}
                  item={this.state.selectedAirdrop}
                  clickOpenModal={clickOpenModal}
                  clickOpenModalGacha={clickOpenModalGacha}
                  t= {t} requestAirDrop={requestAirDrop}
                  smoothSlider={smoothSlider}
                  that={this}
                  isMyAirdrop={isMyAirdrop}
                  onUpdateMyAirdrop={onUpdateMyAirdrop}
                  history721={this.state.history721}
                  listHistory={this.state.listHistory}
                  isLoadingHistory721={this.state.isLoadingHistory721}
                  loadImg={this.state.loadImg}
                  itemAirdrop721={this.state.itemAirdrop721}
                  isGetting721={this.state.isGetting721}
                  backTo721={this.props.backTo721}
                  goToNagemon={this.props.goToNagemon}
                  clickOpenHistoryAirdrop721={this.props.clickOpenHistoryAirdrop721}
                  currency={this.currency}
                  etherPrice={this.props.etherPrice.price}
                  openWinnerList={this.props.openWinnerList}
                  countTxs={this.state.countTxs}
                  openExternalContract={this.props.openExternalContract}
                  openTransactionHistory={this.props.openTransactionHistory}
                  openWinnerListSub={this.props.openWinnerListSub}
                  openTransactionFee={this.props.openTransactionFee}
                  goToGame={this.props.goToGame}
                  gcName={this.state.gcName}
                  gcBalance={this.state.gcBalance}
                  tabClosed={true}
                  hasMore={this.state.hasMore}
                  handleInfiniteOnLoad={this.props.handleInfiniteOnLoad}
                  isLoadMore={this.state.isLoadMore}
                  localeData={this.props.localeData}
                />
          }
        </div>
      </React.Fragment>
    )
  }

  renderWinnerList (item, index, openViewTransaction, t) {
    return (
      <div className="gc-item">
        <div className="gc-address" >{item.from}</div>
        <div className="gc-info">
          <div className="gc-info-prize">+{item.awardAmount} {item.awardName}</div>
          <div className="gc-info-time">{moment(item.createdAt).format('YYYY/MM/DD HH:mm')}</div>
        </div>
        <div className="gc-link" >
          <img src={Images.etherIcon} />
          <div className="gc-link-content" onClick={() => openViewTransaction(item.trnx)}>{t('gc-view')}</div>
        </div>
      </div>
    )
  }

  renderCellAirdrop (item, index, selectedAirdrop, selectedCellAirdrop, t, isMyAirdrop, sendToken, deadlineAllGacha, arrAirdropOpen) {
    let countDown = deadlineAllGacha && Array.isArray(deadlineAllGacha) && deadlineAllGacha.filter(e => e._idNew && item._id && e._idNew.toString() === item._id.toString())
    return (
      <List.Item
        key={item._id}
        className={(item.isExpire
          ? 'gt-list-item-disable '
          : '') + (selectedAirdrop && item._id === selectedAirdrop._id
          ? 'gt-list-item-selected'
          : 'gt-list-item')}
        onClick = {() => {
          selectedCellAirdrop(item, index)
          this.setDefaultSmoothSlider()
        }}
      >
        {!item.isRead && <div className='tks-cell-unread'/>}
        <div className='tks-icon-container'>
          <HBImage logo={item.imageLink} imgDefault={Images.ic_token_default} addClass={'tks-icon'}/>
        </div>
        {item.is721Drop || item.is721DropV1 || item.is721DropV2
          ? <div className='tks-cell-info tks-721'>
            <div className='tks-cell-name'>{item.name}</div>
            <div className={'tks-cell-content ' + (((countDown[0] && countDown[0].gfullTime) || !countDown[0]) && 'tks-721Start')}>
              {(countDown[0] && countDown[0].gfullTime) || !countDown[0]
                ? t('readyToPlay') 
                : t('startIn', {num: (countDown[0] && this.twoNumber(countDown[0].hoursG)) + ':' + (countDown[0] && this.twoNumber(countDown[0].minutesG))})}
            </div>
            <div className='tks-cell-date'>{item.short_description}</div>
            {(item.airdrop_amountNeed === 0 && item.is721Drop) && <div className='tks-cell-free'><img src={Images.discountGacha}/></div>}
            {(item.is721DropV1 || item.is721DropV2) && <div className='tks-cell-free'><img src={item.amount_image}/></div>}
          </div>
          : <div className='tks-cell-info'>
            <div className='tks-cell-name'>{item.name}</div>
            <div className='tks-cell-content'>{item.short_description}</div>
            <div className='tks-cell-date'>{convertTimestampToDate(item.start_time)}</div>
          </div>
        }
        {isMyAirdrop && item.isNotSendTokenToSmartContract && <Tooltip placement="top" title={<div style={{
          padding: '5px 5px 5px 5px',
          fontFamily: 'var(--font-helvetica-neue)',
          fontSize: '11px'}}>
          {t('afa-youHaveNotSentToken', { contract: item.contractAddress })}<br/>
          {t('afa-pleaseSendToken')}<br/>
          <button className="tks-send-token-btn" onClick={() => isMyAirdrop ? sendToken(item) : {}}>{t('afa-sendToken')}</button>
        </div>}>
          <div className='tks-cell-warning'><img src={Images.orderStatus[4]}/></div>
        </Tooltip>}
      </List.Item>
    )
  }

  renderCellAirdropClosed (item, index, selectedAirdrop, selectedExpireCellAirdrop, t, isMyAirdrop, sendToken) {
    return (
      <List.Item
        key={index + 100}
        className={(selectedAirdrop && item._id === selectedAirdrop._id
          ? 'gt-list-item-selected'
          : 'gt-list-item')}
        onClick = {() => {
          selectedExpireCellAirdrop(item)
          this.setDefaultSmoothSlider() 
        }}
      >
        <div className='tks-icon-container'>
          <HBImage logo={item.imageLink} imgDefault={Images.ic_token_default} addClass={'tks-icon'}/>
        </div>
        {item.is721Drop || item.is721DropV1 || item.is721DropV2
          ? <div className='tks-cell-info tks-721'>
            <div className='tks-cell-name'>{item.name}</div>
            <div className='tks-cell-ended'>{t('ended')}</div>
            <div className='tks-cell-date'>{item.short_description}</div>
            {(item.airdrop_amountNeed === 0 && item.is721Drop) && <div className='tks-cell-free'><img src={Images.discountGacha}/></div>}
            {(item.is721DropV1 || item.is721DropV2) && <div className='tks-cell-free'><img src={item.amount_image}/></div>}
          </div>
          : <div className='tks-cell-info'>
            <div className='tks-cell-name'>{item.name}</div>
            <div className='tks-cell-content'>{item.short_description}</div>
            <div className='tks-cell-date'>{convertTimestampToDate(item.start_time)}</div>
          </div>
        }
        {isMyAirdrop && item.isNotSendTokenToSmartContract && <Tooltip placement="top" title={<div style={{
          padding: '5px 5px 5px 5px',
          fontFamily: 'var(--font-helvetica-neue)',
          fontSize: '11px'}}>
          {t('afa-youHaveNotSentToken', { contract: item.contractAddress })}<br/>
          {t('afa-pleaseSendToken')}<br/>
          <button className="tks-send-token-btn" onClick={() => isMyAirdrop ? sendToken(item) : {}}>{t('afa-sendToken')}</button>
        </div>}>
          <div className='tks-cell-warning'><img src={Images.orderStatus[4]}/></div>
        </Tooltip>}
      </List.Item>
    )
  }

  renderCellTokenSale (item, index, indexTokenSale, selectedCellTokenSale) {
    let now = new Date()
    let compareDate = new Date()
    compareDate.setTime(item.expire_time)
    let isEnable = (compareDate.getTime() - now.getTime()) > 0
    return (
      <List.Item className={!isEnable
        ? 'gt-list-item-disable'
        : index === indexTokenSale
          ? 'gt-list-item-selected'
          : 'gt-list-item'}
      onClick = {() => selectedCellTokenSale(index)}
      >
        {!(item.isRead || item.isExpire) && <div className='tks-cell-unread'/>}
        <div className='tks-icon-container'>
          <HBImage logo={item.imageLink} imgDefault={Images.ic_token_default} addClass={'tks-icon'}/>
        </div>
        <div className='tks-cell-info'>
          <div className='tks-cell-name'>{item.name}</div>
          <div className='tks-cell-content'>{item.description}</div>
          <div className='tks-cell-date'>{convertTimestampToDate(item.start_time)}</div>
        </div>
      </List.Item>
    )
  }
}
