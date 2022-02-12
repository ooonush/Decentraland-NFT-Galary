export type Props = {
  customStation?: string
  volume: number
  image?: string
}

export default class VideoStream implements IScript<Props> {
  channel: Record<string, string> = {}
  video: Record<string, VideoTexture> = {}
  materials: Record<string, Material> = {}
  active: Record<string, boolean> = {}
  volume: Record<string, number> = {}
  streamIcon: Record<string, Entity> = {}
  activeScreen: Entity = new Entity

  init() {

  }
  
  toggle(entity: Entity, value: boolean) {
    log('all screens: ', this.video, ' setting: ', entity.name, ' to ', value)

    if (value) {
      // if (this.activeScreen && this.activeScreen == entity) {
      //   return
      // } else if (this.activeScreen) {
      //   this.toggle(this.activeScreen, false)
      // }

      // this.activeScreen = entity
      this.active[entity.name] = true
      this.video[entity.name].volume = this.volume[entity.name]
      this.video[entity.name].playing = true
      engine.removeEntity(this.streamIcon[entity.name])
      this.streamIcon[entity.name].getComponent(PlaneShape).visible = false
    } else {
      // if (!this.activeScreen || this.activeScreen != entity) {
      //   return
      // }

      // this.activeScreen = null
      this.active[entity.name] = false
      this.video[entity.name].playing = false
      this.streamIcon[entity.name].getComponent(PlaneShape).visible = true
    }
    return
  }

  spawn(host: Entity, props: Props, channel: IChannel) {
    const screen = new Entity(host.name + '-screen')
    screen.setParent(host)

    let scaleMult = 3.7

    let planeShape = new PlaneShape()
    //planeShape.isPointerBlocker = false
    //planeShape.withCollisions = true
    screen.addComponent(planeShape)
    screen.addComponent(
      new Transform({
        scale: new Vector3(1.92 * scaleMult, 1.08 * scaleMult, 10 * scaleMult),
        position: new Vector3(0, 0, -0.03),
      })
    )
    
    const billboard = new Entity()
    billboard.setParent(host)
    billboard.addComponent(new Transform({ position: new Vector3(0, 0, 0) }))
    billboard.addComponent(new GLTFShape('models/Screen_Independent.glb'))

    this.channel[screen.name] = props.customStation
    
    // video material
    this.video[screen.name] = new VideoTexture(new VideoClip(this.channel[screen.name]))
    this.materials[screen.name] = new Material()
    this.materials[screen.name].albedoTexture = this.video[screen.name]
    this.materials[screen.name].specularIntensity = 0
    this.materials[screen.name].roughness = 1
    this.materials[screen.name].metallic = 0
    this.materials[screen.name].emissiveTexture = this.video[screen.name]
    this.materials[screen.name].emissiveIntensity = 0.8
    this.materials[screen.name].emissiveColor = Color3.Black()

    screen.addComponent(this.materials[screen.name])

    // icon for streaming
    this.streamIcon[screen.name] = new Entity(host.name + '-streamIcon')
    this.streamIcon[screen.name].setParent(screen)

    this.streamIcon[screen.name].addComponent(new PlaneShape())
    this.streamIcon[screen.name].getComponent(PlaneShape).withCollisions = false
    this.streamIcon[screen.name].addComponent(
      new Transform({
        position: new Vector3(0, 0, 0.002),
        rotation: Quaternion.Euler(180, 0, 0),
      })
    )

    let placeholderMaterial = new Material()
    placeholderMaterial.albedoTexture = new Texture(
      props.image ? props.image : 'images/stream.png'
    )
    placeholderMaterial.specularIntensity = 0
    placeholderMaterial.roughness = 1

    this.streamIcon[screen.name].addComponent(placeholderMaterial)
    
    this.volume[screen.name] = props.volume


    screen.addComponent(new OnPointerDown(
      (e) => {
          const toggleAction = channel.createAction('toggle', {value: !this.active[screen.name]})
          channel.sendActions([toggleAction])
      },
      { button: ActionButton.POINTER,
        distance: 6,
        hoverText: 'Toggle'
      }
      )
    )
    
    this.toggle(screen, false)

    // handle actions
    channel.handleAction('toggle', (e) => this.toggle(screen, e.values['value']))
    //channel.handleAction('changeURL', (e) => this.changeURL(screen, e.values['url']))

    channel.handleAction("hide", ({ sender }) => {
      if (sender === channel.id)
        screen.getComponent('engine.shape').visible = false
        billboard.getComponent('engine.shape').visible = false
        this.streamIcon[screen.name].getComponent('engine.shape').visible = false
    })

    channel.handleAction("show", ({ sender }) => {
      screen.getComponent('engine.shape').visible = true
        billboard.getComponent('engine.shape').visible = true
        this.streamIcon[screen.name].getComponent('engine.shape').visible = true
    })


    // sync initial values
    channel.request<boolean>('isActive', (isActive) =>
      this.toggle(screen, isActive))
    channel.reply<boolean>('isActive', () => this.active[screen.name])
  }
}