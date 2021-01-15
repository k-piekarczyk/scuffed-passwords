import Navigation from '../components/navigation'
import ConditionalRender from '../components/conditionalRender'

function Home () {
  return (
    <>
      <Navigation />
      <ConditionalRender server>
        <p>Rendered on the server</p>
      </ConditionalRender>
      <ConditionalRender client>
        <p>Rendered on the client</p>
      </ConditionalRender>
    </>
  )
}

export default Home
