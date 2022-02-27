import * as serverHandler from 'src/serverHandler'

export type Props = {
  enabled?: boolean
}

export default class OnlyAdminsArea implements IScript<Props> {
  init(_: any) { }

  spawn(host: Entity, props: Props, channel: IChannel) {
    const box = new Entity(host.name + '-box')
    box.setParent(host)
    box.uuid
    box.addComponent(new Transform({ 
      position: new Vector3(0, 0.5, 0)
    }))
    
    box.addComponent(new BoxShape());
    box.getComponent(BoxShape).visible = false
    box.getComponent(BoxShape).withCollisions = true;
    
    if (props.enabled)
      (async () => {
        if (await serverHandler.isAdmin())
          box.getComponent(BoxShape).withCollisions = false
      })()
  }
}