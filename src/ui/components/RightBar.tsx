import { invoke } from '@tauri-apps/api'
import React from 'react'

import Discord from '../../resources/icons/discord.svg'
import Github from '../../resources/icons/github.svg'
import Game from '../../resources/icons/game.svg'

import './RightBar.css'

const DISCORD = 'https://discord.gg/NJfdSw3u'
const GITHUB = 'https://github.com/TotallyABot1/CultivationLotus'
const WEBSITE = 'https://lotus-genshin.online/'

export default class RightBar extends React.Component {
  openInBrowser(url: string) {
    invoke('open_in_browser', { url })
  }

  render() {
    return (
      <div className="RightBar" id="rightBarContainer">
        <div className="RightBarInner" id="rightBarContent">
          <div className="BarDiscord BarImg" id="rightBarButtonDiscord" onClick={() => this.openInBrowser(DISCORD)}>
            <img src={Discord} />
          </div>
          <div className="BarGithub BarImg" id="rightBarButtonGithub" onClick={() => this.openInBrowser(GITHUB)}>
            <img src={Github} />
          </div>
          <div className="BarWebsite BarImg" id="rightBarButtonWebsite" onClick={() => this.openInBrowser(WEBSITE)}>
            <img src={Game} />
          </div>
        </div>
      </div>
    )
  }
}
