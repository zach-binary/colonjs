import SimpleMDE from 'simplemde';

// import './reset.css';
import './main.css';

const Elm = require('./App.elm');
const root = document.getElementById('root');

const app = Elm.App.embed(root, '');

