import { Switch, Route } from 'react-router-dom'

import {
    App,
} from './App.js'

import {
    LoginPage,
} from './Components'


const Main = () => (
  <main>
    <Switch>
        <Route exact path='/' component={LoginPage}/>
    </Switch>
  </main>
)