import { ServerHandler } from "./serverHandler"

export type Props = {
  id: string
  contract: string
  style: string
  color: string
  ui: boolean
  uiText: string
  firebaseURL: string
}

export default class SignPost implements IScript<Props> {
  init() {}

  spawn(host: Entity, props: Props, channel: IChannel) {
    const frame = new Entity()
    frame.setParent(host)

    frame.addComponent(
      new Transform({
        position: new Vector3(0, 0.25, 0),
        rotation: Quaternion.Euler(0, 180, 0),
      })
    )
    
    let url = 'https://opensea.io/assets/' + props.contract + '/' + props.id
    let nft = 'ethereum://' + props.contract + '/' + props.id
    frame.addComponent(
      new NFTShape(nft, {
        color: Color3.FromHexString(props.color),
        style: PictureFrameStyle[props.style],
      })
    )
    
    host.getComponent(Shape).withCollisions = false
    frame.getComponent(Shape).withCollisions = false

    if (props.ui) {
      frame.addComponent(
        new OnPointerDown(
          () => {
            new ServerHandler(props.firebaseURL).addPotentialBuyer(url)
            openNFTDialog(nft, props.uiText ? props.uiText : null)
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
  }
}