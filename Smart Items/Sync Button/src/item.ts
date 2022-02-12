import * as server from 'src/serverHandler'

export type Props = {
  onClick?: Actions
  onlyVIPs?: boolean
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

  async toggle(entity: Entity, value: boolean) {
    this.play(entity)

    this.active[entity.name] = value
    server.changeLampCondition(entity.name, value);
  }

  spawn(host: Entity, props: Props, channel: IChannel) {
    const button = new Entity()
    button.setParent(host)

    button.addComponent(new GLTFShape('models/Red_Button.glb'))

    const animator = new Animator()
    const clip = new AnimationState('trigger', { looping: false })
    animator.addClip(clip)
    button.addComponent(animator)

    async () => { 
      this.active[button.name] = await server.getLampCondition("aboba1")
    }

    async () => { 
      let isEnabled = true
      if (props.onlyVIPs)
        isEnabled = await server.isVIP()

      if (isEnabled)
          button.addComponent(new OnPointerDown(
            () => {
                const toggleAction = channel.createAction('toggle', {value: !this.active[button.name]})
                channel.sendActions([toggleAction])
            },
            { button: ActionButton.POINTER,
              distance: 6,
              hoverText: 'Toggle'
            }
          )
        )
      }

    channel.handleAction('toggle', 
      (e) => {
        const value = e.values['value']
        this.toggle(button, value)

        if ( e.sender === channel.id )
          if (value)
            channel.sendActions(props.onActivate)
          else
            channel.sendActions(props.onDeactivate)
      }
    )
  }
}
