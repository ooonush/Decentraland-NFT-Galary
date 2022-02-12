import { VerticalMovingPlatformSystem, VerticalMovingPlatform } from './platform'
import * as utils from '@dcl/ecs-scene-utils'
import { TriggerableArea, TriggerableAreaSystem } from './area'
import * as serverHandler from 'src/serverHandler'


export type Props = {
  enabled?: boolean
  speed?: number
  onlyvips?: boolean
}

export default class TriggerableMovingVerticalArea implements IScript<Props> {
  init(_: any) {
    engine.addSystem(new TriggerableAreaSystem())
    engine.addSystem(new VerticalMovingPlatformSystem())
  }

  start(entity: Entity) {
    const platform = entity.getComponent(VerticalMovingPlatform)
    platform.enabled = true

    entity.getComponent(PlaneShape).withCollisions = true
    const transform = entity.getComponent(Transform)
    const parentTransform = entity.getParent().getComponent(Transform)
    const parentPos = parentTransform.position
    const parentScaleY = parentTransform.scale.y
    transform.position.set(0, (Camera.instance.feetPosition.y - parentPos.y) / parentScaleY, 0)
  }

  end(entity: Entity) {
    const platform = entity.getComponent(VerticalMovingPlatform)
    platform.enabled = false

    entity.getComponent(PlaneShape).withCollisions = false
    const transform = entity.getComponent(Transform)
    transform.position.set(0, 0, 0)
  }

  spawn(host: Entity, props: Props, channel: IChannel) {
    const platform = new Entity(host.name + '-platform')
    platform.setParent(host)
    const parentScaleY = host.getComponent(Transform).scale.y

    platform.addComponent(new Transform({ 
      position: new Vector3(0, 0, 0),
      rotation: Quaternion.Euler(90, 0, 0)
    }))

    platform.addComponent(new PlaneShape())
    platform.getComponent(PlaneShape).visible = false
    platform.addComponent(new VerticalMovingPlatform(channel, props.speed / parentScaleY, false))
    platform.getComponent(PlaneShape).withCollisions = false

    // const box = new Entity(host.name + '-box')
    // box.addComponent(new GLTFShape('models/TriggerArea.glb'))
    // box.setParent(host)
    // box.getComponent(GLTFShape).withCollisions = false

    const trigger = new TriggerableArea()
    
    if (props.onlyvips)
      async () => { trigger.enabled = props.enabled && await serverHandler.isVIP() }
    else
      trigger.enabled = props.enabled

    trigger.onEnter = () => {
      if (trigger.enabled)
        this.start(platform)
    }
    trigger.onLeave = () => {
      if (trigger.enabled)
        this.end(platform)
    }

    // // sync initial values
    // channel.request<boolean>(
    //   'enabled',
    //   (enabled) => (trigger.enabled = enabled)
    // )
    // channel.reply<boolean>('enabled', () => trigger.enabled)

    host.addComponent(trigger)
  }
}
