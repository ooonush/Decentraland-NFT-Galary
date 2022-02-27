import { Spawner } from '../node_modules/decentraland-builder-scripts/spawner'
import Button, { Props } from './item'

const button = new Button()
const spawner = new Spawner<Props>(button)

spawner.spawn(
  'button1',
  new Transform({
    position: new Vector3(4, 0, 8)
  }),
  {
    onlyAdmin: true
  }
)

spawner.spawn(
  'button2',
  new Transform({
    position: new Vector3(5, 0, 8)
  }),
  {
    onlyAdmin: false
  }
)
