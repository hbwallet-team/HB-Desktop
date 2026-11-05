import React from 'react'
import Images from 'Assets/Image'
import swal from 'sweetalert2'

import {
  FacebookShareCount,
  PinterestShareCount,
  VKShareCount,
  OKShareCount,
  RedditShareCount,
  TumblrShareCount,
  FacebookShareButton,
  LinkedinShareButton,
  TwitterShareButton,
  PinterestShareButton,
  VKShareButton,
  OKShareButton,
  TelegramShareButton,
  WhatsappShareButton,
  RedditShareButton,
  EmailShareButton,
  TumblrShareButton,
  LivejournalShareButton,
  MailruShareButton,
  ViberShareButton,
  WorkplaceShareButton,
  LineShareButton,
  WeiboShareButton,
  PocketShareButton,
  InstapaperShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  PinterestIcon,
  VKIcon,
  OKIcon,
  TelegramIcon,
  WhatsappIcon,
  RedditIcon,
  TumblrIcon,
  MailruIcon,
  EmailIcon,
  LivejournalIcon,
  ViberIcon,
  WorkplaceIcon,
  LineIcon,
  PocketIcon,
  InstapaperIcon
} from 'react-share'
import { copyText } from 'Utils/globalFunction'

const ShareModal = props => {
  const {
    cardSelected,
    handleSwitchAccount,
    onCloseModal,
    t,
    item: { symbol, id, image }
  } = props
  const shareUrl = `https://s.nagemon.com/${encodeURIComponent(symbol)}/${id}`
  return (
    <div className="md-body md-small">
      <div className="md-header">
        <div className="pp-close" onClick={onCloseModal}>
          <img src={Images.close} />
        </div>
        {t('Dapps.shareAsset')}
      </div>
      <div className="md-content">
        <div className="social-list">
          <div className="social-list-1">
            <FacebookShareButton url={shareUrl}>
              <FacebookIcon size={32} round={true} />
            </FacebookShareButton>
            <TwitterShareButton url={shareUrl}>
              <TwitterIcon size={32} round={true} />
            </TwitterShareButton>

            <TelegramShareButton url={shareUrl}>
              <TelegramIcon size={32} round={true} />
            </TelegramShareButton>
            <PinterestShareButton url={shareUrl} media={image}>
              <PinterestIcon size={32} round={true} />
            </PinterestShareButton>
            <RedditShareButton url={shareUrl}>
              <RedditIcon size={32} round={true} />
            </RedditShareButton>
            <TumblrShareButton url={shareUrl}>
              <TumblrIcon size={32} round={true} />
            </TumblrShareButton>
            <EmailShareButton url={shareUrl}>
              <EmailIcon size={32} round={true} />
            </EmailShareButton>
            <LineShareButton url={shareUrl}>
              <LineIcon size={32} round={true} />
            </LineShareButton>
            <WeiboShareButton url={shareUrl}>
              <img
                src={Images.weibo_icon}
                alt="weibo"
                className="social-icon"
              />
            </WeiboShareButton>
            <img
              className="social-icon"
              src={Images.paper_icon}
              alt="copy"
              onClick={() => {
                copyText(shareUrl)
                swal({
                  width: '250px',
                  text: t('Copied'),
                  type: 'success',
                  timer: 5000,
                  showConfirmButton: false
                })
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
export default ShareModal
