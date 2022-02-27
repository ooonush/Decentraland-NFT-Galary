import { Spawner } from '../node_modules/decentraland-builder-scripts/spawner'
import Door, { Props } from './item'

const door = new Door()
const spawner = new Spawner<Props>(door)

spawner.spawn(
  'door',
  new Transform({
    position: new Vector3(2, 0, 1)
  }),
  {  }
)