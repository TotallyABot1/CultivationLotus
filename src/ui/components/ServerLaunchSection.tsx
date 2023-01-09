import React from 'react'
import BigButton from './common/BigButton'
import { getConfig } from '../../utils/configuration'
import { translate } from '../../utils/language'
import { invoke } from '@tauri-apps/api/tauri'

import Plus from '../../resources/icons/plus.svg'

import './ServerLaunchSection.css'
import { dataDir } from '@tauri-apps/api/path'
import { getGameExecutable } from '../../utils/game'

interface IProps {
  openExtras: (playWhichGame: () => void) => void
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
  shortcutSet: boolean
}

export default class ServerLaunchSection extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    this.state = {
      buttonLabel: '',
      checkboxLabel: '',
      ip: '65.109.57.164',
      port: '2888',
      httpsEnabled: false,
      swag: false,
      akebiSet: false,
      migotoSet: false,
      shortcutSet: false,
    }

    this.playWhichGame = this.playWhichGame.bind(this)
    this.setIp = this.setIp.bind(this)
    this.setPort = this.setPort.bind(this)
  }

  async componentDidMount() {
    const config = await getConfig()

    this.setState({
      buttonLabel: await translate('main.launch_button'),
      ip: '65.109.57.164',
      port: '2888',
      httpsEnabled: false,
      swag: config.swag_mode || false,
      akebiSet: config.akebi_path !== undefined && config.akebi_path !== '',
      migotoSet: config.migoto_path !== undefined && config.migoto_path !== '',
      shortcutSet: config.game_shortcut_path !== undefined && config.game_shortcut_path !== '',
    })
  }

  async playWhichGame(exe?: string, proc_name?: string) {
    const config = await getConfig()
    const akebiActive = config.last_extras?.akebi || false
    if (this.state.swag && this.state.akebiSet && akebiActive) {
      await this.playGameAkebi(exe, proc_name)
    } else {
      await this.playGame(exe, proc_name)
    }
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
    await invoke('connect', { port: 8365, certificatePath: (await dataDir()) + '\\LotusCultivation\\ca' })

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

    if (this.state.shortcutSet) {
      await invoke('run_program_relative', { path: config.game_shortcut_path })
    } else if (gameExists) {
      await invoke('run_program_relative', { path: exe || config.game_install_path })
    } else
      alert(
        'Game not found at\n' +
          config.game_install_path +
          (this.state.shortcutSet ? '\nor the shortcut location\n' + config.game_shortcut_path + '\nis wrong!' : '')
      )
  }

  async playGameAkebi(akebiExe?: string, proc_name?: string) {
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
    await invoke('connect', { port: 8365, certificatePath: (await dataDir()) + '\\LotusCultivation\\ca' })

    if (config.wipe_login) {
      // First wipe registry if we have to
      await invoke('wipe_registry', {
        // The exe is always PascalCase, so we can get the dir using regex
        execName: (await getGameExecutable())?.split('.exe')[0].replace(/([a-z\d])([A-Z])/g, '$1 $2'),
      })
    }

    // Launch the program
    const gameExists = await invoke('dir_exists', {
      path: akebiExe || config.game_install_path,
    })

    if (gameExists) await invoke('run_program_relative', { path: akebiExe || config.game_install_path })
    else alert('Game not found! At: ' + (akebiExe || config.game_install_path))
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
          <BigButton onClick={this.playWhichGame} id="officialPlay">
            {this.state.buttonLabel}
          </BigButton>
          {this.state.swag && (
            <BigButton onClick={() => this.props.openExtras(this.playWhichGame)} id="ExtrasMenuButton">
              <img className="ExtrasIcon" id="extrasIcon" src={Plus} />
            </BigButton>
          )}
        </div>
      </div>
    )
  }
}
