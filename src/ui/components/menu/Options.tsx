import React from 'react'
import { invoke } from '@tauri-apps/api'
import { dataDir } from '@tauri-apps/api/path'
import DirInput from '../common/DirInput'
import Menu from './Menu'
import Tr, { getLanguages } from '../../../utils/language'
import { setConfigOption, getConfig, getConfigOption, Configuration } from '../../../utils/configuration'
import Checkbox from '../common/Checkbox'
import Divider from './Divider'
import { getThemeList } from '../../../utils/themes'

import './Options.css'
import BigButton from '../common/BigButton'
import DownloadHandler from '../../../utils/download'
import TextInput from '../common/TextInput'

interface IProps {
  closeFn: () => void
  downloadManager: DownloadHandler
}

interface IState {
  game_install_path: string
  java_path: string
  language_options: { [key: string]: string }[]
  current_language: string
  bg_url_or_path: string
  themes: string[]
  theme: string
  wipe_login: boolean
  horny_mode: boolean
  swag: boolean
  platform: string

  // Swag stuff
  akebi_path: string
  migoto_path: string
  reshade_path: string
}

export default class Options extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    this.state = {
      game_install_path: '',
      java_path: '',
      language_options: [],
      current_language: 'en',
      bg_url_or_path: '',
      themes: ['default'],
      theme: '',
      wipe_login: false,
      horny_mode: false,
      swag: false,
      platform: '',

      // Swag stuff
      akebi_path: '',
      migoto_path: '',
      reshade_path: '',
    }

    this.setGameExecutable = this.setGameExecutable.bind(this)
    this.setJavaPath = this.setJavaPath.bind(this)
    this.setAkebi = this.setAkebi.bind(this)
    this.setMigoto = this.setMigoto.bind(this)
    this.setCustomBackground = this.setCustomBackground.bind(this)
  }

  async componentDidMount() {
    const config = await getConfig()
    const languages = await getLanguages()
    const platform: string = await invoke('get_platform')

    console.log(platform)

    this.setState({
      game_install_path: config.game_install_path || '',
      java_path: config.java_path || '',
      language_options: languages,
      current_language: config.language || 'en',
      bg_url_or_path: config.customBackground || '',
      themes: (await getThemeList()).map((t) => t.name),
      theme: config.theme || 'default',
      wipe_login: config.wipe_login || false,
      horny_mode: config.horny_mode || false,
      swag: config.swag_mode || false,
      platform,

      // Swag stuff
      akebi_path: config.akebi_path || '',
      migoto_path: config.migoto_path || '',
      reshade_path: config.reshade_path || '',
    })

    this.forceUpdate()
  }

  setGameExecutable(value: string) {
    setConfigOption('game_install_path', value)

    // I hope this stops people setting launcher.exe because oml it's annoying
    if (value.endsWith('launcher.exe')) {
      const pathArr = value.replace(/\\/g, '/').split('/')
      pathArr.pop()
      const path = pathArr.join('/') + '/Genshin Impact Game/'

      alert(
        `You have set your game execuatable to "launcher.exe". You should not do this. Your game executable is located in:\n\n${path}`
      )
    }

    this.setState({
      game_install_path: value,
    })
  }

  setJavaPath(value: string) {
    setConfigOption('java_path', value)

    this.setState({
      java_path: value,
    })
  }

  setAkebi(value: string) {
    setConfigOption('akebi_path', value)

    this.setState({
      akebi_path: value,
    })
  }

  setMigoto(value: string) {
    setConfigOption('migoto_path', value)

    this.setState({
      migoto_path: value,
    })

    // Set game exe in Migoto ini
    invoke('set_migoto_target', {
      path: this.state.game_install_path,
      migotoPath: value,
    })
  }

  setReshade(value: string) {
    setConfigOption('reshade_path', value)

    this.setState({
      reshade_path: value,
    })
  }

  async setLanguage(value: string) {
    await setConfigOption('language', value)
    window.location.reload()
  }

  async setTheme(value: string) {
    await setConfigOption('theme', value)
    window.location.reload()
  }

  async setCustomBackground(value: string) {
    const isUrl = /^(?:http(s)?:\/\/)/gm.test(value)

    if (!value) return await setConfigOption('customBackground', '')

    if (!isUrl) {
      const filename = value.replace(/\\/g, '/').split('/').pop()
      const localBgPath = ((await dataDir()) as string).replace(/\\/g, '/')

      await setConfigOption('customBackground', `${localBgPath}/LotusCultivation/bg/${filename}`)

      // Copy the file over to the local directory
      await invoke('copy_file', {
        path: value.replace(/\\/g, '/'),
        newPath: `${localBgPath}LotusCultivation/bg/`,
      })

      window.location.reload()
    } else {
      await setConfigOption('customBackground', value)
      window.location.reload()
    }
  }

  async installCert() {
    await invoke('generate_ca_files', {
      path: (await dataDir()) + 'lotusCultivation',
    })
  }

  async toggleOption(opt: keyof Configuration) {
    const changedVal = !(await getConfigOption(opt))

    await setConfigOption(opt, changedVal)

    // @ts-expect-error shut up bitch
    this.setState({
      [opt]: changedVal,
    })
  }

  render() {
    return (
      <Menu closeFn={this.props.closeFn} className="Options" heading="Options">
        {!this.state.platform || this.state.platform === 'windows' ? (
          <div className="OptionSection" id="menuOptionsContainerGamePath">
            <div className="OptionLabel" id="menuOptionsLabelGamePath">
              <Tr text="options.game_path" />
            </div>
            <div className="OptionValue" id="menuOptionsDirGamePath">
              <DirInput onChange={this.setGameExecutable} value={this.state?.game_install_path} extensions={['exe']} />
            </div>
          </div>
        ) : (
          <div className="OptionSection" id="menuOptionsContainerGameCommand">
            <div className="OptionLabel" id="menuOptionsLabelGameCommand">
              <Tr text="options.game_command" />
            </div>
            <div className="OptionValue" id="menuOptionsGameCommand">
              <TextInput />
            </div>
          </div>
        )}
        <div className="OptionSection" id="menuOptionsContainerWipeLogin">
          <div className="OptionLabel" id="menuOptionsLabelWipeLogin">
            <Tr text="options.wipe_login" />
          </div>
          <div className="OptionValue" id="menuOptionsCheckboxWipeLogin">
            <Checkbox
              onChange={() => this.toggleOption('wipe_login')}
              checked={this.state?.wipe_login}
              id="wipeLogin"
            />
          </div>
        </div>

        <Divider />

        <div className="OptionSection" id="menuOptionsContainerInstallCert">
          <div className="OptionLabel" id="menuOptionsLabelInstallCert">
            <Tr text="options.install_certificate" />
          </div>
          <div className="OptionValue" id="menuOptionsButtonInstallCert">
            <BigButton disabled={false} onClick={this.installCert} id="installCert">
              <Tr text="components.install" />
            </BigButton>
          </div>
        </div>
        {this.state.swag && (
          <>
            <Divider />
            <div className="OptionSection" id="menuOptionsContainerAkebi">
              <div className="OptionLabel" id="menuOptionsLabelAkebi">
                <Tr text="swag.akebi" />
              </div>
              <div className="OptionValue" id="menuOptionsDirAkebi">
                <DirInput onChange={this.setAkebi} value={this.state?.akebi_path} extensions={['exe']} />
              </div>
            </div>
            <div className="OptionSection" id="menuOptionsContainerMigoto">
              <div className="OptionLabel" id="menuOptionsLabelMigoto">
                <Tr text="swag.migoto" />
              </div>
              <div className="OptionValue" id="menuOptionsDirMigoto">
                <DirInput onChange={this.setMigoto} value={this.state?.migoto_path} extensions={['exe']} />
              </div>
            </div>
            <div className="OptionSection" id="menuOptionsContainerReshade">
              <div className="OptionLabel" id="menuOptionsLabelReshade">
                <Tr text="swag.reshade" />
              </div>
              <div className="OptionValue" id="menuOptionsDirReshade">
                <DirInput onChange={this.setReshade} value={this.state?.reshade_path} extensions={['exe']} />
              </div>
            </div>
          </>
        )}

        {this.state.swag ? (
          <div className="OptionSection" id="menuOptionsContainerHorny">
            <div className="OptionLabel" id="menuOptionsLabelHorny">
              <Tr text="options.horny_mode" />
            </div>
            <div className="OptionValue" id="menuOptionsCheckboxHorny">
              <Checkbox
                onChange={() => this.toggleOption('horny_mode')}
                checked={this.state?.horny_mode}
                id="hornyMode"
              />
            </div>
          </div>
        ) : null}

        <Divider />

        <div className="OptionSection" id="menuOptionsContainerThemes">
          <div className="OptionLabel" id="menuOptionsLabelThemes">
            <Tr text="options.theme" />
          </div>
          <div className="OptionValue" id="menuOptionsSelectThemes">
            <select
              value={this.state.theme}
              id="menuOptionsSelectMenuThemes"
              onChange={(event) => {
                this.setTheme(event.target.value)
              }}
            >
              {this.state.themes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Divider />

        <div className="OptionSection" id="menuOptionsContainerJavaPath">
          <div className="OptionLabel" id="menuOptionsLabelJavaPath">
            <Tr text="options.java_path" />
          </div>
          <div className="OptionValue" id="menuOptionsDirJavaPath">
            <DirInput onChange={this.setJavaPath} value={this.state?.java_path} extensions={['exe']} />
          </div>
        </div>

        <div className="OptionSection" id="menuOptionsContainerBG">
          <div className="OptionLabel" id="menuOptionsLabelBG">
            <Tr text="options.background" />
          </div>
          <div className="OptionValue" id="menuOptionsDirBG">
            <DirInput
              onChange={this.setCustomBackground}
              value={this.state?.bg_url_or_path}
              extensions={['png', 'jpg', 'jpeg']}
              readonly={false}
              clearable={true}
              customClearBehaviour={async () => {
                await setConfigOption('customBackground', '')
                window.location.reload()
              }}
            />
          </div>
        </div>

        <div className="OptionSection" id="menuOptionsContainerLang">
          <div className="OptionLabel" id="menuOptionsLabelLang">
            <Tr text="options.language" />
          </div>
          <div className="OptionValue" id="menuOptionsSelectLang">
            <select
              value={this.state.current_language}
              id="menuOptionsSelectMenuLang"
              onChange={(event) => {
                this.setLanguage(event.target.value)
              }}
            >
              {this.state.language_options.map((lang) => (
                <option key={Object.keys(lang)[0]} value={Object.keys(lang)[0]}>
                  {lang[Object.keys(lang)[0]]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Menu>
    )
  }
}
