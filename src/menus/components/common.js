import { css } from 'lit'

const commonCss = css`
  .dirt-bg {
    position: absolute;
    top: 0;
    left: 0;
    background: rgba(0, 0, 0, 0.75);
    /* background: url('textures/1.17.1/gui/options_background.png'), rgba(0, 0, 0, 0.75); */
    background-size: 16px;
    background-repeat: repeat;
    width: 100%;
    height: 100%;
    transform-origin: top left;
    transform: scale(2);
    background-blend-mode: overlay;
  }

  .bg {
    position: absolute;
    top: 0;
    left: 0;
    background: rgba(0, 0, 0, 0.75);
    width: 100%;
    height: 100%;
  }

  .title {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translate(-50%);
    font-size: 10px;
    color: white;
    text-align: center;
    text-shadow: 1px 1px #222;
  }

  .text {
    color: white;
    font-size: 10px;
    text-shadow: 1px 1px #222;
  }
`

/** @returns {boolean} */
function isMobile () {
  return window.matchMedia('(pointer: coarse)').matches
}

// todo there are better workarounds and proper way to detect notch
/** @returns {boolean} */
function isProbablyIphone () {
  if (!isMobile()) return false
  const smallest = window.innerWidth < window.innerHeight ? window.innerWidth : window.innerHeight
  return smallest < 600
}

/**
 * @param {string} url
 */
function openURL (url) {
  window.open(url, '_blank', 'noopener,noreferrer')
}

export {
  isProbablyIphone,
  commonCss,
  isMobile,
  openURL,
}
