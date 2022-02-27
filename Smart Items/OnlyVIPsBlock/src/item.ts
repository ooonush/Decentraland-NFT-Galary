import * as serverHandler from 'src/serverHandler'

export type Props = {
  enabled?: boolean
}

export default class TriggerableMovingVerticalArea implements IScript<Props> {
  init(_: any) { }

  spawn(host: Entity, props: Props, channel: IChannel) {
    const box = new Entity(host.name + '-box')
    box.setParent(host)

    box.addComponent(new Transform({ 
      position: new Vector3(0, 0, 0)
    }))

    box.addComponent(new GLTFShape('models/box.glb'))
    //box.getComponent(GLTFShape).visible = false

    if (props.enabled)
      (async () => {
        if (await serverHandler.isVIP())
        box.getComponent(GLTFShape).withCollisions = false
      })()
  }
}