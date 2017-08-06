import './main.css';

const fileName = location.pathname;

const Elm = require('./App.elm');
const root = document.getElementById('root');

const app = Elm.App.embed(root, fileName);

