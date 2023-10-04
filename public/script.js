const mess = document.querySelectorAll('.mess');
setTimeout(function(){
    for(let i=0; i<mess.length; i++){
        mess[i].innerHTML = null;
    }
}, 3000);

console.log('Hello');