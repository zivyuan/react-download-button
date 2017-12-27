import React, { Component } from 'react';
import styles from './index.less';

export default class FileDownloader extends Component {

  constructor (props) {
    super(props)

    window.addEventListener('message', this.onMessageRecieve)
  }

  state = {
    downloading: false,
    timer: 0,
  }

  uniId = 'filedownloader' + Math.floor(Math.random() * 8888888 + 1000000)

  onMessageRecieve = (evt) => {
    const { data } = evt
    if (data.uuid === this.uniId) {
      if (this.props.onError) {
        this.props.onError({
          code: data.code,
          message: data.message,
          data: data.data,
        })
      }
    }

    if (this.state.timer) {
      clearTimeout(this.state.timer)
    }

    this.setState({
      downloading: false
    })
  }

  createDownload = (url, params = [], method = 'POST') => {
    let converted = null
    if (typeof params === 'object') {
      converted = []
      for ( let key in params) {
        converted.push({
          name: key,
          value: params[key],
        })
      }
    }
    const parameters = ([
      {
        name: 'uuid',
        value: this.uniId,
      }
    ]).concat(converted || params)

    const inputs = parameters.map((item) => `<input type="hidden" name="${item.name}" value="${item.value}" />`)
    const formContent = `<form action="${url}" method="${method}" target="_self">${inputs.join('')}<input id="btn-download" type="submit" value="Download"/></form>`
    const iframe = `<iframe id="${this.uniId}-iframe" src="about:blank"></iframe>`
    const container = document.getElementsByClassName(this.uniId)[0]
    container.innerHTML = iframe

    const iframeItem = document.getElementById(`${this.uniId}-iframe`)

    const c = iframeItem.contentWindow.document;
    try {
      c.open(), c.write(formContent), c.close()
      const btn = c.getElementById('btn-download')
      btn.click();

    } catch (err) {
      console.log("FileDownloader can not render download frame!", err)
    }

    return document.getElementById(`${this.uniId}-iframe`)
  }

  onDownloadClick = (evt) => {
    if (this.state.downloading)
      return

    const { url, params, method } = this.props
    this.createDownload(url, params, method)
    const timer = setTimeout((obj) => {
      obj.setState({
        downloading: false
      })
    }, 4500, this)

    this.setState({
      downloading: true,
      timer: timer,
    })
  }

  render() {
    const iframe = <div></div>
    const button = this.props.children
    const style = this.props.style || {}
    const icon = this.state.downloading
      ? this.props.iconLoading
      : this.props.icon

    return <div className={`${styles.efFiledownloader} ${this.state.downloading ? styles.efFileDownloading : ''}`} style={style}>
      <div onClick={this.onDownloadClick}><a href="javascript:void(0)">{icon} {this.props.children}</a></div>
      <div className={`${styles.efContainer} ${this.uniId}`}> </div>
    </div>
  }
}

FileDownloader.defaultProps = {
    url: '',          // Download url
    params: null,     // Parameters
    iconLoading: '',  // Icon for downloading state
    icon: '',         // Icon for normal state
}
