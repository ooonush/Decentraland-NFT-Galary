import { TriggerableArea, TriggerableAreaSystem } from './area'

export type Props = {
  onOpen?: Actions
  onClose?: Actions
  onEnter?: Actions
  onLeave?: Actions
}

export default class Doors implements IScript<Props> {
  openClip = new AudioClip('sounds/open.mp3')
  closeClip = new AudioClip('sounds/close.mp3')

  doorsArr: Record<string, Entity> = {}

  active: Record<string, boolean> = {}

  init() {
    engine.addSystem(new TriggerableAreaSystem())
  }

  toggle(entity: Entity, value: boolean, playSound = true) {
    if (this.active[entity.name] === value) return

    if (playSound) {
      const source = new AudioSource(value ? this.openClip : this.closeClip)
      entity.addComponentOrReplace(source)
      source.playing = true
    }

    log(entity.name)

    const left = this.doorsArr[entity.name + '-left']
    const right = this.doorsArr[entity.name + '-right']

    log(left.name)
    log(right.name)

    this.doorToggleAnimation(left.getComponent(Animator), value)
    this.doorToggleAnimation(right.getComponent(Animator), value)

    this.active[entity.name] = value
  }

  doorToggleAnimation(animator: Animator, value: boolean){
    const openClip = animator.getClip('Door_open')
    const closeClip = animator.getClip('Door_close')

    openClip.stop()
    closeClip.stop()
    const clip = value ? openClip : closeClip
    clip.play()
  }

  spawn(host: Entity, props: Props, channel: IChannel) {
    const doors = new Entity(host.name + '-doors')
    doors.setParent(host)

    const doorLeft = new Entity(doors.name + '-left')
    this.doorsArr[doorLeft.name] = doorLeft
    const doorRight = new Entity(doors.name + '-right')
    this.doorsArr[doorRight.name] = doorRight

    doorLeft.setParent(doors)
    doorRight.setParent(doors)

    doorRight.addComponent(new Transform({
      scale: new Vector3(-1, 1, 1)
    }))

    const animator = new Animator()
    const closeClip = new AnimationState('Door_close', { looping: false })
    const openClip = new AnimationState('Door_open', { looping: false })
    animator.addClip(closeClip)
    animator.addClip(openClip)
    doorLeft.addComponent(animator)
    doorRight.addComponent(animator)

    this.toggle(doors, false, false)

    doorLeft.addComponent(new GLTFShape('models/Door.glb'))
    doorRight.addComponent(new GLTFShape('models/Door.glb'))

    const area = new Entity(doors.name + "-trigger-area")
    area.setParent(doors)
    // area.addComponent(new BoxShape)
    area.addComponent(new Transform({ 
      scale: new Vector3(4, 4, 5)
    }))
    // area.getComponent(BoxShape).withCollisions = false
    const trigger = new TriggerableArea()

    trigger.onEnter = () => {
      channel.sendActions(props.onEnter)
    }
    trigger.onLeave = () => {
      channel.sendActions(props.onLeave)
    }

    area.addComponent(trigger)

    this.active[doors.name] = false

    // handle actions
    channel.handleAction('open', ({ sender }) => {
      if (!this.active[doors.name])
        this.toggle(doors, true)
      if (sender === channel.id)
        channel.sendActions(props.onOpen)
    })
    channel.handleAction('close', ({ sender }) => {
      if (this.active[doors.name])
        this.toggle(doors, false)
      if (sender === channel.id)
        channel.sendActions(props.onClose)
    })

    // sync initial values
    channel.request<boolean>('isOpen', (isOpen) => this.toggle(doors, isOpen, false))
    channel.reply<boolean>('isOpen', () => this.active[doors.name])
  }
}
