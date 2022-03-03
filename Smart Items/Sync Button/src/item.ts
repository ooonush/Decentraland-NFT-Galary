import { ServerHandler } from "./serverHandler"

export type Props = {
  onClick?: Actions
  onlyAdmin?: boolean
  onActivate?: Actions
  onDeactivate?: Actions
  firebaseURL: string
}

export default class Button implements IScript<Props> {
  clip = new AudioClip('sounds/click.mp3')
  active: Record<string, boolean> = {}

  init() {}

  play(entity: Entity) {
    const source = new AudioSource(this.clip)
    entity.addComponentOrReplace(source)
    source.playing = true

    const animator = entity.getComponent(Animator)
    const clip = animator.getClip('trigger')
    clip.stop()
    clip.play()
  }

  async toggle(entity: Entity, value: boolean, sync: boolean, server: ServerHandler) {
    if (value !== undefined){
      this.play(entity)
    
      this.active[entity.uuid] = value
      
      if (sync)
      
        await server.changeObjectCondition(entity.uuid, value)
  
      log(value)
    }
  }

  spawn(host: Entity, props: Props, channel: IChannel) {
    const button = new Entity(host.name + '-button')
    button.setParent(host)

    button.addComponent(new GLTFShape('models/Red_Button.glb'))
    
    const animator = new Animator()
    const clip = new AnimationState('trigger', { looping: false })
    animator.addClip(clip)
    button.addComponent(animator);
    this.active[button.uuid] = false
    const server = new ServerHandler(props.firebaseURL);

    (async () => {
      channel.sendActions([channel.createAction("toggle", {"value": await server.getObjectCondition(button.uuid), "sync": false})])

      let isEnabled = props.onlyAdmin ? await server.isAdmin() : true
      if (isEnabled){
        button.addComponent(new OnPointerDown(
          () => channel.sendActions([channel.createAction("toggle", {"value": !this.active[button.uuid], "sync": true})]),
          { button: ActionButton.POINTER,
            distance: 6,
            hoverText: 'Toggle'
          }
        ))
      }
      else
        button.getComponent(GLTFShape).visible = false
    })()

    channel.handleAction('toggle', async (e) => {
      const value = e.values['value']
      const sync = e.values['sync']

      if (value != this.active[button.uuid]){
        await this.toggle(button, value, sync, server)
        
        if ( e.sender === channel.id )
          if (value)
            channel.sendActions(props.onActivate)
          else
            channel.sendActions(props.onDeactivate)
        }
      }
    )
  }
}
