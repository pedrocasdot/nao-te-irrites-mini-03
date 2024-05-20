


import { Nanter } from './Nanter.js';
const resetBtn  = document.getElementById('reset-btn');
let nanter = new Nanter();



resetBtn.addEventListener('click', ()=>{
    location.reload();
});