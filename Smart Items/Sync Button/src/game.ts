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
    //onlyAdmin: true,
    firebaseURL: "https://us-central1-nft-gallery-15f17.cloudfunctions.net/app/"
  }
)

spawner.spawn(
  'button2',
  new Transform({
    position: new Vector3(5, 0, 8)
  }),
  {
    //onlyAdmin: false,
    firebaseURL: "https://us-central1-nft-gallery-15f17.cloudfunctions.net/app/"
  },
)
