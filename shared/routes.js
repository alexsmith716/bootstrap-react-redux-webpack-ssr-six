
import { App, Home, NotFound } from '../client/containers';

import About from '../client/containers/About/Loadable';
import AboutOne from '../client/containers/AboutOne/Loadable';
import AboutTwo from '../client/containers/AboutTwo/Loadable';
import AboutThree from '../client/containers/AboutThree/Loadable';
import AboutFour from '../client/containers/AboutFour/Loadable';
import StickyFooter from '../client/containers/StickyFooter/Loadable';
import BoardGames from '../client/containers/Games/BoardGames/Loadable';

const routes = [{
  component: App,
  routes: [
    { path: '/', exact: true, component: Home },
    { path: '/about', component: About },
    { path: '/about-one', component: AboutOne },
    { path: '/about-two', component: AboutTwo },
    { path: '/about-three', component: AboutThree },
    { path: '/about-four', component: AboutFour },
    { path: '/sticky-footer', component: StickyFooter },
    { path: '/board-games', component: BoardGames },
    { component: NotFound }
  ]
}];

export default routes;
