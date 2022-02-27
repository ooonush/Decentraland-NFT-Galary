@Component('org.decentraland.VerticalMovingPlatform')
export class VerticalMovingPlatform {
  constructor(
    public channel: IChannel,
    public speed: number = 5,
    public enabled: boolean = false
  ) {}
}

export class VerticalMovingPlatformSystem implements ISystem {
  group = engine.getComponentGroup(VerticalMovingPlatform)
  update(dt: number) {
    for (const entity of this.group.entities) {
      const platform = entity.getComponent(VerticalMovingPlatform)
      //log(entity.getComponent(Transform).position.y)
      if (platform.enabled && entity.getComponent(Transform).position.y < 1){
        const transform = entity.getComponent(Transform)
        const speed = platform.speed / 5
        transform.position.set(transform.position.x, transform.position.y += dt * speed, transform.position.z)
      }
    }
  }
}