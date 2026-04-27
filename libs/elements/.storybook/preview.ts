import '@telperion/elements';
import '@telperion/elements/drag-drop';
import '@telperion/elements/icon';
import '@telperion/elements/icon/material-symbols.css';
import './preview.css';
import './tha-url-output';

document.head.appendChild(document.createElement('style')).textContent = `
  div[scale="1"] {
    transform: initial;
  }
`;
