import * as server from 'src/serverHandler'

export type Props = {
  onClick?: Actions
  onlyAdmin?: boolean
  onActivate?: Actions
  onDeactivate?: Actions
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

  async toggle(entity: Entity, value: boolean, sync: boolean) {
    this.play(entity)
    
    this.active[entity.uuid] = value
    log(value)
    if (sync)
      await server.changeObjectCondition(entity.uuid, value)

    log('name: ' + entity.uuid + '\n' + 
        'sync: ' + sync + '\n' + 
        'localActive: ' + this.active[entity.uuid] + '\n' + 
        'serverActive: ' + await server.getObjectCondition(entity.uuid))
  }

  spawn(host: Entity, props: Props, channel: IChannel) {
    const button = new Entity(host.name + '-button')
    button.setParent(host)

    button.addComponent(new GLTFShape('models/Red_Button.glb'))
    
    const animator = new Animator()
    const clip = new AnimationState('trigger', { looping: false })
    animator.addClip(clip)
    button.addComponent(animator);

    (async () => {
      this.toggle(button, await server.getObjectCondition(button.uuid), false)

      let isEnabled = props.onlyAdmin ? await server.isAdmin() : true
      if (isEnabled){
        button.addComponent(new OnPointerDown(
          () => channel.sendActions(props.onClick),
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
      
      await this.toggle(button, value, sync)
      
      if ( e.sender === channel.id )
        if (value)
          channel.sendActions(props.onActivate)
        else
          channel.sendActions(props.onDeactivate)
      }
    )
  }
}
