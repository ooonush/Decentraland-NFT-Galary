import * as serverHandler from 'src/serverHandler'
import * as ui from '../node_modules/@dcl/ui-utils/index'
import { PromptStyles } from '../node_modules/@dcl/ui-utils/index'

export type Props = {
  id: string
  contract: string
  style: string
  color: string
  ui: boolean
  uiText: string
}

export default class SignPost implements IScript<Props> {
  init() {}

  openNFTDialog(scr: string, comment?: string | null): void {
    let prompt = new ui.CustomPrompt(PromptStyles.LIGHT)
    let myText = prompt.addText('Hello World', 0, 100)
    let myIcon = prompt.addIcon()
  }

  spawn(host: Entity, props: Props, channel: IChannel) {
    const frame = new Entity()
    frame.setParent(host)

    frame.addComponent(
      new Transform({
        position: new Vector3(0, 0.25, 0),
        rotation: Quaternion.Euler(0, 180, 0),
      })
    )
    
    let nft = 'ethereum://' + props.contract + '/' + props.id
    frame.addComponent(
      new NFTShape(nft, {
        color: Color3.FromHexString(props.color),
        style: PictureFrameStyle[props.style],
      })
    )
    
    if (props.ui) {
      frame.addComponent(
        new OnPointerDown(
          () => {
            serverHandler.addPotentialBuyer()
            this.openNFTDialog(nft, props.uiText ? props.uiText : null)
          },
          { hoverText: 'Open UI' }
        )
      )
    }

    channel.handleAction("hide", ({ sender }) => {
      if (sender === channel.id)
        frame.getComponent('engine.shape').visible = false
    })

    channel.handleAction("show", ({ sender }) => {
      if (sender === channel.id)
        frame.getComponent('engine.shape').visible = true
    })

    // let test = new Entity()
    // test.setParent(host)
    // test.addComponent(new GLTFShape('models/CustomFrame.glb'))
  }
}
