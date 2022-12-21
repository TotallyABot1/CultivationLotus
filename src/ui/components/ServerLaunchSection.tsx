import React from 'react'
import Checkbox from './common/Checkbox'
import BigButton from './common/BigButton'
import TextInput from './common/TextInput'
import HelpButton from './common/HelpButton'
import { getConfig, saveConfig, setConfigOption } from '../../utils/configuration'
import { translate } from '../../utils/language'
import { invoke } from '@tauri-apps/api/tauri'

import Server from '../../resources/icons/server.svg'
import Plus from '../../resources/icons/plus.svg'

import './ServerLaunchSection.css'
import { dataDir } from '@tauri-apps/api/path'
import { getGameExecutable, getGameVersion } from '../../utils/game'
import { patchGame, unpatchGame } from '../../utils/metadata'

interface IProps {
  openExtras: (playGame: () => void) => void
}

interface IState {
  buttonLabel: string
  checkboxLabel: string
  ip: string
  port: string
  httpsEnabled: boolean
  swag: boolean
  akebiSet: boolean
  migotoSet: boolean
}

export default class ServerLaunchSection extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    this.state = {
      buttonLabel: '',
      checkboxLabel: '',
      ip: 'static.123.83.217.95.clients.your-server.de.',
      port: '2888',
      httpsEnabled: false,
      swag: false,
      akebiSet: false,
      migotoSet: false,
    }

    this.playGame = this.playGame.bind(this)
    this.setIp = this.setIp.bind(this)
    this.setPort = this.setPort.bind(this)
  }

  async componentDidMount() {
    const config = await getConfig()

    this.setState({
      buttonLabel: await translate('main.launch_button'),
      ip: 'static.123.83.217.95.clients.your-server.de.',
      port: '2888',
      httpsEnabled: false,
      swag: config.swag_mode || false,
      akebiSet: config.akebi_path !== '',
      migotoSet: config.migoto_path !== '',
    })
  }

  async playGame(exe?: string, proc_name?: string) {
    const config = await getConfig()

    if (!(await getGameExecutable())) {
      alert('Game executable not set!')
      return
    }

    const game_exe = await getGameExecutable()
    await invoke('enable_process_watcher', {
      process: proc_name || game_exe,
    })

    await invoke('set_proxy_addr', {
      addr: (this.state.httpsEnabled ? 'https' : 'http') + '://' + this.state.ip + ':' + this.state.port,
    })
    // Connect to proxy
    await invoke('connect', { port: 8365, certificatePath: (await dataDir()) + '\\cultivation\\ca' })

    if (config.wipe_login) {
      // First wipe registry if we have to
      await invoke('wipe_registry', {
        // The exe is always PascalCase, so we can get the dir using regex
        execName: (await getGameExecutable())?.split('.exe')[0].replace(/([a-z\d])([A-Z])/g, '$1 $2'),
      })
    }

    // Launch the program
    const gameExists = await invoke('dir_exists', {
      path: exe || config.game_install_path,
    })

    if (gameExists) await invoke('run_program_relative', { path: exe || config.game_install_path })
    else alert('Game not found! At: ' + (exe || config.game_install_path))
  }

  setIp(text: string) {
    this.setState({
      ip: text,
    })
  }

  setPort(text: string) {
    this.setState({
      port: text,
    })
  }

  render() {
    return (
      <div id="playButton">
        <div className="ServerLaunchButtons" id="serverLaunchContainer">
          <BigButton onClick={this.playGame} id="officialPlay">
            {this.state.buttonLabel}
          </BigButton>
          {this.state.swag && (
            <BigButton onClick={() => this.props.openExtras(this.playGame)} id="ExtrasMenuButton">
              <img className="ExtrasIcon" id="extrasIcon" src={Plus} />
            </BigButton>
          )}
        </div>
      </div>
    )
  }
}
